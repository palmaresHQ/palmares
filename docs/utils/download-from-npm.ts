// Copied from:
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

async function batchedPromiseAll<T>(promises: Promise<T>[], numberOfPromises: number = 10, retries: number = 3) {
  const results: T[] = [];
  for (let i = 0; i < promises.length; i += numberOfPromises) {
    const batch = promises.slice(i, i + numberOfPromises);
    try {
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    } catch (e) {
      if (retries > 0) {
        console.log('Retrying', e);
        return new Promise((resolve, reject) => {
          queueMicrotask(() =>
            batchedPromiseAll(promises, numberOfPromises, retries - 1)
              .then(resolve)
              .catch(reject)
          );
        });
      }
      throw e;
    }
  }
  return results as Promise<T>[];
}
// Taken from dts-gen: https://github.com/microsoft/dts-gen/blob/master/lib/names.ts
function getDTName(s: string) {
  if (s.indexOf('@') === 0 && s.indexOf('/') !== -1) {
    // we have a scoped module, e.g. @bla/foo
    // which should be converted to   bla__foo
    s = s.substr(1).replace('/', '__');
  }
  return s;
}

function isDtsFile(file: string) {
  return /\.d\.([^\.]+\.)?[cm]?ts$/i.test(file);
}

/** Converts some of the known global imports to node so that we grab the right info */
export function mapModuleNameToModule(moduleSpecifier: string) {
  // in node repl:
  // > require("module").builtinModules
  const builtInNodeMods = [
    'assert',
    'assert/strict',
    'async_hooks',
    'buffer',
    'child_process',
    'cluster',
    'console',
    'constants',
    'crypto',
    'dgram',
    'diagnostics_channel',
    'dns',
    'dns/promises',
    'domain',
    'events',
    'fs',
    'fs/promises',
    'http',
    'http2',
    'https',
    'inspector',
    'inspector/promises',
    'module',
    'net',
    'os',
    'path',
    'path/posix',
    'path/win32',
    'perf_hooks',
    'process',
    'punycode',
    'querystring',
    'readline',
    'repl',
    'stream',
    'stream/promises',
    'stream/consumers',
    'stream/web',
    'string_decoder',
    'sys',
    'timers',
    'timers/promises',
    'tls',
    'trace_events',
    'tty',
    'url',
    'util',
    'util/types',
    'v8',
    'vm',
    'wasi',
    'worker_threads',
    'zlib'
  ];

  if (moduleSpecifier.indexOf('node:') === 0 || builtInNodeMods.includes(moduleSpecifier)) {
    return 'node';
  }

  // strip module filepath e.g. lodash/identity => lodash
  const [a = '', b = ''] = moduleSpecifier.split('/');
  const moduleName = a.startsWith('@') ? `${a}/${b}` : a;

  return moduleName;
}

const cache = new Map<string, any>();
async function cacheFetch(...args: Parameters<typeof fetch>): ReturnType<typeof fetch> {
  const key = args[0].toString();
  console.log('Cache miss', key);
  if (cache.has(key)) {
    console.log('Cache HIT', key);
    return cache.get(key);
  } else {
    const res = await fetch(...args);
    return res.json().then((data) => {
      console.log('Cache set', key, data);
      const response: Response = {
        ...res,
        ok: res.ok,
        json: async () => {
          return data;
        }
      };
      cache.set(key, { json: async () => data });
      return response;
    });
  }
}
export async function getNPMVersionsForModule(moduleName: string) {
  const url = `https://data.jsdelivr.com/v1/package/npm/${moduleName}`;
  return cacheFetch(url, { cache: 'no-cache' })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return new Error('Error');
      }
    })
    .then((data) => data);
}

export async function getNPMVersionForModuleReference(moduleName: string, reference: string) {
  const url = `https://data.jsdelivr.com/v1/package/resolve/npm/${moduleName}@${reference}`;
  return cacheFetch(url, { cache: 'no-cache' })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return new Error('Error');
      }
    })
    .then((data) => data);
}

export type NPMTreeMeta = { default: string; files: Array<{ name: string }>; moduleName: string; version: string };

const mapOfFlatFiles = new Map<string, any>();
export async function getFiletreeForModuleWithVersion(moduleName: string, version: string) {
  const url = `https://data.jsdelivr.com/v1/package/npm/${moduleName}@${version}/flat`;
  let res: any;
  try {
    res = await fetch(url)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          return new Error('Error');
        }
      })
      .then((data) => data);
  } catch (e) {
    console.error('Error fetching', url, e);
    res = new Error('Error');
  }
  if (res instanceof Error) {
    return res;
  } else {
    return {
      ...res,
      moduleName,
      version
    };
  }
}

export async function getDTSFileForModuleWithVersion(
  moduleName: string,
  version: string,
  file: string
): Promise<string | Error> {
  const isProduction = process.env?.NODE_ENV === 'production';
  let filePath: string | undefined = undefined;
  if (isProduction === false) {
    filePath = join(process.cwd(), 'public', 'dependencies', moduleName, version, file);
    const directoryPath = dirname(filePath);
    if (!existsSync(directoryPath)) mkdirSync(directoryPath, { recursive: true });
    if (existsSync(filePath)) return readFileSync(filePath, 'utf8');
  }

  // file comes with a prefix
  const url = `https://cdn.jsdelivr.net/npm/${moduleName}@${version}${file}`;
  let tries = 0;
  const fetchAndSave = async (): Promise<string | Error> => {
    try {
      console.log('Fetching', url);
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        if (isProduction === false && filePath) {
          if (existsSync(dirname(filePath))) {
            mkdirSync(dirname(filePath), { recursive: true });
            writeFileSync(filePath, text);
          }
        }

        return text;
      } else {
        return new Error('OK');
      }
    } catch (e) {
      tries++;
      if (tries > 3) throw e;
      return await new Promise((resolve, reject) => setTimeout(() => fetchAndSave().then(resolve).then(reject), 0));
    }
  };
  return await fetchAndSave();
}

function treeToDTSFiles(tree: NPMTreeMeta, vfsPrefix: string) {
  const dtsRefs: {
    moduleName: string;
    moduleVersion: string;
    vfsPath: string;
    path: string;
  }[] = [];

  for (const file of tree.files) {
    if (isDtsFile(file.name)) {
      dtsRefs.push({
        moduleName: tree.moduleName,
        moduleVersion: tree.version,
        vfsPath: `${vfsPrefix}${file.name}`,
        path: file.name
      });
    }
  }
  return dtsRefs;
}

let preProcessFile: any;
/**
 * Pull out any potential references to other modules (including relatives) with their
 * npm versioning strat too if someone opts into a different version via an inline end of line comment
 */
export async function getReferencesForModule(code: string) {
  if (preProcessFile === undefined) preProcessFile = (await import('typescript')).preProcessFile;
  const meta = preProcessFile(code);

  // Ensure we don't try download TypeScript lib references
  // @ts-ignore - private but likely to never change
  const libMap: Map<string, string> = new Map();

  const references = meta.referencedFiles
    .concat(meta.importedFiles)
    .concat(meta.libReferenceDirectives)
    .filter((file: any) => !isDtsFile(file.fileName))
    .filter((dir: any) => !libMap.has(dir.fileName));

  return references.map((reference: any) => {
    let version = undefined;
    if (!reference.fileName.startsWith('.')) {
      version = 'latest';
      const line = code.slice(reference.end).split('\n')[0]!;
      if (line.includes('// types:')) version = line.split('// types: ')[1]!.trim();
    }

    return {
      module: reference.fileName,
      version
    };
  });
}

/** A list of modules from the current sourcefile which we don't have existing files for */
export async function getNewDependencies(moduleMap: Map<string, { state: 'loading' }>, code: string) {
  const refs = (await getReferencesForModule(code)).map((ref: any) => ({
    ...ref,
    module: mapModuleNameToModule(ref.module)
  }));

  // Drop relative paths because we're getting all the files
  const modules = refs.filter((f: any) => !f.module.startsWith('.')).filter((m: any) => !moduleMap.has(m.module));
  return modules;
}

/** The bulk load of the work in getting the filetree based on how people think about npm names and versions */
export const getFileTreeForModuleWithTag = async (moduleName: string, tag: string | undefined) => {
  let toDownload = tag || 'latest';

  // I think having at least 2 dots is a reasonable approx for being a semver and not a tag,
  // we can skip an API request, TBH this is probably rare
  if (toDownload.split('.').length < 2) {
    let response: any;
    const cacheKey = moduleName + toDownload;
    // The jsdelivr API needs a _version_ not a tag. So, we need to switch out
    // the tag to the version via an API request.
    response = await getNPMVersionForModuleReference(moduleName, toDownload);
    if (response instanceof Error) {
      return {
        error: response,
        userFacingMessage: `Could not go from a tag to version on npm for ${moduleName} - possible typo?`
      };
    }

    const neededVersion = response.version;
    if (!neededVersion) {
      const versions = await getNPMVersionsForModule(moduleName);
      if (versions instanceof Error) {
        return {
          error: response,
          userFacingMessage: `Could not get versions on npm for ${moduleName} - possible typo?`
        };
      }

      const tags = Object.entries(versions.tags).join(', ');
      return {
        error: new Error('Could not find tag for module'),
        userFacingMessage: `Could not find a tag for ${moduleName} called ${tag}. Did find ${tags}`
      };
    }

    toDownload = neededVersion;
  }

  const res = await getFiletreeForModuleWithVersion(moduleName, toDownload);
  if (res instanceof Error) {
    return {
      error: res,
      userFacingMessage: `Could not get the files for ${moduleName}@${toDownload}. Is it possibly a typo?`
    };
  }

  return res;
};

/**
 * The function which starts up type acquisition,
 * returns a function which you then pass the initial
 * source code for the app with.
 *
 * This is effectively the main export, everything else is
 * basically exported for tests and should be considered
 * implementation details by consumers.
 */
export const setupTypeAcquisition = (opts?: {
  toFilter: (
    deps: { module: string; version: string | undefined }[]
  ) => { module: string; version: string | undefined }[];
}) => {
  const moduleMap = new Map<string, { state: 'loading' }>();
  const fsMap = new Map<string, string>();

  return async (
    initialSourceFile: string,
    args: {
      fetchExternalTypes?: string;
    }
  ) => {
    return resolveDeps(initialSourceFile, 0, args);
  };

  async function resolveDeps(
    initialSourceFile: string,
    depth: number,
    args: {
      fetchExternalTypes?: string;
    }
  ) {
    const depsToGet = await getNewDependencies(moduleMap, initialSourceFile);
    const depsToGetFiltered = opts?.toFilter ? opts.toFilter(depsToGet) : depsToGet;
    // Make it so it won't get re-downloaded
    depsToGetFiltered.forEach((dep: any) => moduleMap.set(dep.module, { state: 'loading' }));

    // Grab the module trees which gives us a list of files to download
    const trees = await batchedPromiseAll(
      depsToGetFiltered.map((file: any) => getFileTreeForModuleWithTag(file.module, file.version)),
      50
    );
    const treesOnly = (trees as any[]).filter((tree) => !('error' in tree)) as NPMTreeMeta[];

    // These are the modules which we can grab directly
    const hasDTS = treesOnly.filter((tree) => tree.files.find((file) => isDtsFile(file.name)));
    const dtsFilesFromNPM = hasDTS.map((tree) => treeToDTSFiles(tree, `/node_modules/${tree.moduleName}`));

    // These are ones we need to look on DT for (which may not be there, who knows)
    const mightBeOnDT = treesOnly.filter((tree) => !hasDTS.includes(tree));
    const dtTrees = await batchedPromiseAll(
      mightBeOnDT.map((file) => getFileTreeForModuleWithTag(`@types/${getDTName(file.moduleName)}`, 'latest')),
      50
    );

    const dtTreesOnly = (dtTrees as any[]).filter((t) => !('error' in t)) as NPMTreeMeta[];
    const dtsFilesFromDT = dtTreesOnly.map((t) =>
      treeToDTSFiles(t, `/node_modules/@types/${getDTName(t.moduleName).replace('types__', '')}`)
    );

    // Collect all the npm and DT DTS requests and flatten their arrays
    const allDTSFiles = dtsFilesFromNPM.concat(dtsFilesFromDT).reduce((p, c) => p.concat(c), []);

    // Grab the package.jsons for each dependency
    for (const tree of treesOnly) {
      let prefix = `/node_modules/${tree.moduleName}`;
      if (dtTreesOnly.includes(tree))
        prefix = `/node_modules/@types/${getDTName(tree.moduleName).replace('types__', '')}`;
      const path = prefix + '/package.json';
      const pkgJSON = await getDTSFileForModuleWithVersion(tree.moduleName, tree.version, '/package.json');

      if (typeof pkgJSON == 'string') {
        fsMap.set(path, pkgJSON);
      } else {
        console.error(`Could not download package.json for ${tree.moduleName}`);
      }
    }

    // Grab all dts files
    await batchedPromiseAll(
      allDTSFiles.map(async (dts) => {
        const dtsCode = await getDTSFileForModuleWithVersion(dts.moduleName, dts.moduleVersion, dts.path);
        if (dtsCode instanceof Error) {
          // TODO?
          console.error(`Had an issue getting ${dts.path} for ${dts.moduleName}`);
        } else {
          fsMap.set(dts.vfsPath, dtsCode);

          // Recurse through deps
          await resolveDeps(dtsCode, depth + 1, args);
        }
      }),
      5
    );
    return fsMap;
  }
};
