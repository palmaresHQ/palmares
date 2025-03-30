import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { FileSystemTree } from '@webcontainer/api';
import { setupTypeAcquisition } from './download-from-npm';
type LibraryCode = { [key: string]: Record<string, string> };

const retrieveTypes = setupTypeAcquisition({
  toFilter: (deps) => deps.filter((dep) => dep.module.includes('@palmares') === false)
});

export async function getLibraryCodes(
  libraries: [string, string][],
  parser: ((args: { path: string; content: string }) => { path: string; content: string }) | undefined = undefined,
  opts: {
    shouldRetrieveExternalTypes?: boolean;
    fetchExternalTypes?: string;
    flattenPathOnRaw?: boolean;
  } = {
    shouldRetrieveExternalTypes: false,
    fetchExternalTypes: undefined,
    flattenPathOnRaw: false
  }
): Promise<
  Record<
    string,
    {
      raw: LibraryCode[string];
      formatted: FileSystemTree;
    }
  >
> {
  let libraryCodes = {} as Record<
    string,
    {
      raw: LibraryCode[string];
      formatted: FileSystemTree;
    }
  >;

  async function getFiles(
    dir: string,
    rootDir = dir,
    files = {
      raw: {} as LibraryCode[string],
      formatted: {} as FileSystemTree
    },
    filesOrFoldersToConsider = undefined as string[] | undefined,
    hasFoundPackageJson = false
  ) {
    const fileList = await fs.readdir(dir);
    if (hasFoundPackageJson === false) {
      for (const file of fileList) {
        if (file.endsWith('package.json')) {
          hasFoundPackageJson = true;
          const packageJsonContents = await fs.readFile(path.join(dir, file), 'utf8');
          const packageJson = JSON.parse(packageJsonContents);

          if (packageJson.files) {
            files.raw['package.json'] = packageJsonContents as any;
            files.formatted['package.json'] = {
              file: {
                contents: packageJsonContents as any
              }
            };
            return getFiles(dir, rootDir, files, packageJson.files, true);
          }
          break;
        }
      }
    } else {
      await Promise.all(
        fileList.map(async (file) => {
          const filePath = path.join(dir, file);
          if (Array.isArray(filesOrFoldersToConsider) && filesOrFoldersToConsider.includes(file) === false) return;
          if ((await fs.stat(filePath)).isDirectory())
            return getFiles(filePath, rootDir, files, undefined, hasFoundPackageJson);
          else {
            let filePathRelativeToRoot = path.relative(rootDir, filePath);
            let fileContent = await fs.readFile(filePath, 'utf8');
            const isTSFile = filePathRelativeToRoot.endsWith('.ts');
            if (isTSFile && opts.shouldRetrieveExternalTypes) {
              const dtsCode = await retrieveTypes(fileContent, {
                fetchExternalTypes: opts.fetchExternalTypes
              });
              for (const [path, dts] of dtsCode.entries()) {
                files.raw[path.replace('/node_modules/', 'node_modules/')] = dts;
              }
            }
            if (parser) {
              const parsed = parser({ path: filePathRelativeToRoot, content: fileContent });
              filePathRelativeToRoot = parsed.path;
              fileContent = parsed.content;
            }

            if (opts.flattenPathOnRaw) {
              const splittedPath = filePathRelativeToRoot.split('/');
              files.raw[splittedPath[splittedPath.length - 1]] = fileContent;
            } else {
              files.raw[filePathRelativeToRoot] = fileContent;
            }
            const splittedPath = filePathRelativeToRoot.split('/');

            let data = files.formatted;
            for (let i = 0; i < splittedPath.length; i++) {
              const isLastPath = i === splittedPath.length - 1;
              const fileOrFolder = splittedPath[i];
              if (isLastPath === false) {
                if (data[fileOrFolder] === undefined)
                  data[fileOrFolder] = {
                    directory: {}
                  };
                data = (data[fileOrFolder] as any).directory as FileSystemTree;
                continue;
              } else
                data[splittedPath[i]] = {
                  file: {
                    contents: fileContent
                  }
                };
            }
          }
        })
      );
    }
  }
  await Promise.all(
    libraries.map(async ([library, path]) => {
      libraryCodes[library] = {
        raw: {} as LibraryCode[string],
        formatted: {} as FileSystemTree
      } as {
        raw: LibraryCode[string];
        formatted: FileSystemTree;
      };
      await getFiles(path, path, libraryCodes[library]);
    })
  );
  for (const values of Object.values(libraryCodes)) {
    const packageJsonOfLibrary = values.raw['package.json'];
    const packageJsonFormatted = JSON.parse(packageJsonOfLibrary);
    for (const type of ['dependencies', 'devDependencies', 'peerDependencies']) {
      if (!packageJsonFormatted[type]) continue;
      for (const [key, value] of Object.entries(packageJsonFormatted[type])) {
        if (value === 'workspace:*') {
          const packageJsonOfDependency = JSON.parse(libraryCodes[key].raw['package.json']);
          packageJsonFormatted[type][key] = packageJsonOfDependency.version;
        }
      }
    }
    const stringfiedPackageJson = JSON.stringify(packageJsonFormatted, null, 2);
    values.raw['package.json'] = stringfiedPackageJson;
    if ((values?.formatted?.['package.json'] as any)?.file?.contents)
      (values.formatted['package.json'] as any)['file']['contents'] = stringfiedPackageJson;
  }

  return libraryCodes;
}

export async function getPalmaresFiles(args?: { generateJson: boolean; host: string | undefined }) {
  const libraryCodes = await getLibraryCodes(
    [
      ['@palmares/console-logging', path.join(process.cwd(), '..', 'libs', 'console-logging')],
      ['@palmares/drizzle-engine', path.join(process.cwd(), '..', 'libs', 'drizzle-engine')],
      ['@palmares/express-adapter', path.join(process.cwd(), '..', 'libs', 'express-adapter')],
      ['@palmares/jest-tests', path.join(process.cwd(), '..', 'libs', 'jest-tests')],
      ['@palmares/node-std', path.join(process.cwd(), '..', 'libs', 'node-std')],
      ['@palmares/sequelize-engine', path.join(process.cwd(), '..', 'libs', 'sequelize-engine')],
      ['@palmares/zod-schema', path.join(process.cwd(), '..', 'libs', 'zod-schema')],
      ['@palmares/core', path.join(process.cwd(), '..', 'packages', 'core')],
      ['@palmares/databases', path.join(process.cwd(), '..', 'packages', 'databases')],
      ['@palmares/schemas', path.join(process.cwd(), '..', 'packages', 'schemas')],
      ['@palmares/server', path.join(process.cwd(), '..', 'packages', 'server')],
      ['@palmares/tests', path.join(process.cwd(), '..', 'packages', 'tests')],
      ['@palmares/logging', path.join(process.cwd(), '..', 'packages', 'logging')],
      ['@palmares/events', path.join(process.cwd(), '..', 'packages', 'events')]
    ],
    ({ path, content }) => {
      return {
        path: path.replace('_', ''),
        content: content.startsWith('// @ts-nocheck\n') ? content.replace('// @ts-nocheck\n', '') : content
      };
    },
    {
      fetchExternalTypes: args?.host
    }
  );

  if (args?.generateJson) {
    const json = JSON.stringify(libraryCodes, null, 2);
    await fs.writeFile(path.join(process.cwd(), 'public', 'palmares-files.json'), json);
  }

  return libraryCodes as any;
}

export async function getExamplesFiles(args?: { generateJson: boolean; host: string | undefined }) {
  const libraryCodes = await getLibraryCodes(
    [['mainpage', path.join(process.cwd(), '.', 'examples', 'mainpage')]],
    ({ path, content }) => {
      return {
        path: path.replace('_', ''),
        content: content.startsWith('// @ts-nocheck\n') ? content.replace('// @ts-nocheck\n', '') : content
      };
    },
    {
      shouldRetrieveExternalTypes: true,
      fetchExternalTypes: args?.host,
      flattenPathOnRaw: true
    }
  );
  if (args?.generateJson) {
    const json = JSON.stringify(libraryCodes, null, 2);
    await fs.writeFile(path.join(process.cwd(), 'public', 'examples-files.json'), json);
  }

  return libraryCodes as any;
}
