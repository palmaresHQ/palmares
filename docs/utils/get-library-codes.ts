import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'path';
import type { FileSystemTree } from '@webcontainer/api';
import { setupTypeAcquisition } from './download-from-npm';
import {
  GET_FILE_CONTENTS_BY_NAME_VERSION_AND_PATH,
  type JSDELIVR_DATA_RESPONSE,
  GET_PACKAGE_BY_NAME_AND_VERSION
} from '../constants/npm-registry-apis';
import { PALMARES_PACKAGES_TO_FILES_AND_FOLDERS } from '../constants/palmares-packages-to-files-and-paths';
import { PackageJson } from 'type-fest';

type LibraryCode = { [key: string]: Record<string, string> };

async function recursivelyReadDirExcludingCertainDirs(dirPath: string, excludedDirs: string[], files: string[] = []) {
  const dirsOrFiles = await readdir(dirPath);
  await Promise.all(
    dirsOrFiles.map(async (fileOrDir) => {
      if (excludedDirs.includes(fileOrDir)) return;
      const filePath = resolve(dirPath, fileOrDir);
      const stats = await stat(filePath);
      if (stats.isDirectory()) return recursivelyReadDirExcludingCertainDirs(filePath, excludedDirs);
      files.push(filePath);
    })
  );
  return files;
}

async function getFileFromUrlOrPath(maybeUrlOrPath: string) {
  const startsWithHttp = maybeUrlOrPath.startsWith('http') || maybeUrlOrPath.startsWith('https');
  if (!startsWithHttp) return readFile(maybeUrlOrPath, 'utf-8');
  try {
    const response = await fetch(maybeUrlOrPath);
    return response.text();
  } catch (e) {
    return '';
  }
}
export function findPackageDirectoryInNodeModules(
  packageName: string,
  startDir = join(process.cwd(), '..')
): string | undefined {
  console.log(packageName, startDir);
  const segments = packageName.split('/').filter(Boolean);
  if (segments.length === 0) return undefined;

  const queue: string[] = [startDir];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentDir = queue.shift()!;
    if (visited.has(currentDir)) continue;
    visited.add(currentDir);

    const candidate = join(currentDir, 'node_modules', ...segments);
    if (existsSync(candidate)) return candidate;

    let entries: ReturnType<typeof readdirSync>;
    try {
      entries = readdirSync(currentDir, { withFileTypes: true }) as unknown as ReturnType<typeof readdirSync>;
    } catch {
      continue; // ignore directories we can't read
    }

    for (const entry of entries) {
      const entryName = entry.name as unknown as string;
      if (!entry.isDirectory()) continue;
      if (entryName === 'node_modules') {
        // we already checked this node_modules above
        continue;
      }
      if (entryName.startsWith('.')) continue; // skip dotfolders
      if (entry.isSymbolicLink?.()) continue; // avoid cycles through symlinks
      queue.push(join(currentDir, entryName));
    }
  }

  return undefined;
}
async function getFileListAndPackageJsonFromDirOrPackageName(
  maybeDirOrPackageToFind: string,
  version?: string
): Promise<['package' | 'local', string[], PackageJson]> {
  if (existsSync(maybeDirOrPackageToFind) === false && version) {
    const directoryOfPackage = findPackageDirectoryInNodeModules(maybeDirOrPackageToFind);
    console.log(directoryOfPackage, maybeDirOrPackageToFind, version);
    const response = await fetch(GET_PACKAGE_BY_NAME_AND_VERSION(maybeDirOrPackageToFind, version));
    const responseJson = await response.json();
    const packageJsonContents = await getFileFromUrlOrPath(
      GET_FILE_CONTENTS_BY_NAME_VERSION_AND_PATH(maybeDirOrPackageToFind, version, '/package.json')
    );
    return [
      'package',
      ((responseJson?.files || []) as JSDELIVR_DATA_RESPONSE[]).map((file) => file.name),
      JSON.parse(packageJsonContents) as PackageJson
    ];
  }

  let packageJsonPathLocation = join(maybeDirOrPackageToFind, 'package.json');
  const existsPackageJson = existsSync(packageJsonPathLocation);
  if (!existsPackageJson) packageJsonPathLocation = join(maybeDirOrPackageToFind, '_package.json');
  const packageJsonContents = await getFileFromUrlOrPath(packageJsonPathLocation);
  const packageJson = JSON.parse(packageJsonContents);

  return [
    'local',
    await recursivelyReadDirExcludingCertainDirs(maybeDirOrPackageToFind, ['node_modules', '__tests__', '.turbo']),
    packageJson as PackageJson
  ];
}

function normalizeMaybePalmaresPackagesToFilesAndFolders(
  maybePalmaresPackage: string
): ['palmares' | 'normal', string] {
  if (maybePalmaresPackage in PALMARES_PACKAGES_TO_FILES_AND_FOLDERS)
    return [
      'palmares',
      PALMARES_PACKAGES_TO_FILES_AND_FOLDERS[
        maybePalmaresPackage as keyof typeof PALMARES_PACKAGES_TO_FILES_AND_FOLDERS
      ] as string
    ];
  return ['normal', maybePalmaresPackage];
}

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
  const dependenciesGraph = new Map<
    string,
    Map<
      string,
      Record<
        string,
        {
          raw: LibraryCode[string];
          formatted: FileSystemTree;
        }
      >
    >
  >();
  const startedAndNotFinished = new Set<string>();
  async function getFiles(
    dirOrPackageName: string,
    rootDir = dirOrPackageName,
    files = {
      raw: {} as LibraryCode[string],
      formatted: {} as FileSystemTree
    },
    version = undefined as string | undefined
  ) {
    startedAndNotFinished.add(`${dirOrPackageName}@${version}`);
    const filesOrFoldersToConsider = [] as string[];
    const [palmaresOrNormalFile, dirOrPackageNameNormalizedFromPalmaresPackagesToFilesAndFolders] =
      normalizeMaybePalmaresPackagesToFilesAndFolders(dirOrPackageName);

    const [type, fileList, packageJson] = await getFileListAndPackageJsonFromDirOrPackageName(
      dirOrPackageNameNormalizedFromPalmaresPackagesToFilesAndFolders,
      version
    );

    const dependencies = Object.entries(packageJson?.['dependencies'] || {});
    // const devDependencies =
    //   type === 'local' && palmaresOrNormalFile !== 'palmares'
    //     ? Object.entries(packageJson?.['devDependencies'] || {})
    //     : [];

    await Promise.all(
      dependencies.map(async ([key, value]) => {
        const formattedVersion = ((value as string) || '').replace(/^workspace\:/g, '');
        const existingOrNewDependencyMap =
          dependenciesGraph.get(key) ||
          new Map<
            string,
            Record<
              string,
              {
                raw: LibraryCode[string];
                formatted: FileSystemTree;
              }
            >
          >();

        if (existingOrNewDependencyMap.has(formattedVersion) === false) {
          const existingOrNewDependencyMapVersion = existingOrNewDependencyMap.get(formattedVersion) || {};
          dependenciesGraph.set(key, existingOrNewDependencyMap);
          existingOrNewDependencyMap.set(formattedVersion, existingOrNewDependencyMapVersion);
          try {
            await getFiles(key, rootDir, files, formattedVersion);
          } catch (e) {
            console.log('error', e);
          }
        }
      })
    );

    const packageJSONContent = JSON.stringify(packageJson, null, 2);
    files.raw['package.json'] = packageJSONContent;
    files.formatted['package.json'] = {
      file: {
        contents: packageJSONContent
      }
    };
    if (packageJson.files) filesOrFoldersToConsider.push(...packageJson.files);

    const promises: Promise<void>[] = [];
    while (fileList.length > 0) {
      const file = fileList.shift() as string;
      // Check if file is a file, in other words, ends with \.\w+
      const isFile = /\w+\.\w+$/.test(file as string);
      const existsInFilesToConsider =
        filesOrFoldersToConsider.length > 0
          ? filesOrFoldersToConsider.some((fileOrFolder) => file?.includes(fileOrFolder))
          : true;
      if (existsInFilesToConsider === false) continue;
      if (isFile) {
        const fetchFile = async () => {
          const filePath =
            type === 'local'
              ? file
              : GET_FILE_CONTENTS_BY_NAME_VERSION_AND_PATH(
                  dirOrPackageNameNormalizedFromPalmaresPackagesToFilesAndFolders,
                  version as string,
                  file
                );

          const fileContent = await getFileFromUrlOrPath(filePath);

          const splittedPath = file.split('/');
          const isPalmaresOPackageFile = palmaresOrNormalFile === 'palmares' || type === 'package';
          const keyOrRaw = isPalmaresOPackageFile
            ? join(dirOrPackageName, file)
            : splittedPath[splittedPath.length - 1];

          files.raw[keyOrRaw] = fileContent;
        };

        promises.push(fetchFile());
      }
    }

    await Promise.all(promises);
    startedAndNotFinished.delete(`${dirOrPackageName}@${version}`);
    // await Promise.all(
    //   fileList.map(async (file) => {
    //     console.log(dirOrPackageName, file);
    //     const filePath = join(dirOrPackageName, file);
    //     if (Array.isArray(filesOrFoldersToConsider) && filesOrFoldersToConsider.includes(file) === false) return;
    //     if ((await stat(filePath)).isDirectory()) return getFiles(filePath, rootDir, files, undefined);
    //     else {
    //       let filePathRelativeToRoot = relative(rootDir, filePath);
    //       let fileContent = await getFileFromUrlOrPath(filePathRelativeToRoot);
    //       if (parser) {
    //         const parsed = parser({ path: filePathRelativeToRoot, content: fileContent });
    //         filePathRelativeToRoot = parsed.path;
    //         fileContent = parsed.content;
    //       }
    //
    //       const splittedPath = opts.flattenPathOnRaw ? filePathRelativeToRoot.split('/') : [];
    //       const keyOfRawFiles = opts.flattenPathOnRaw ? splittedPath[splittedPath.length - 1] : filePathRelativeToRoot;
    //       files.raw[keyOfRawFiles] = fileContent;
    //
    //       let data = files.formatted;
    //       for (let i = 0; i < splittedPath.length; i++) {
    //         const isLastPath = i === splittedPath.length - 1;
    //         const fileOrFolder = splittedPath[i];
    //         if (isLastPath === false) {
    //           if (data[fileOrFolder] === undefined)
    //             data[fileOrFolder] = {
    //               directory: {}
    //             };
    //           data = (data[fileOrFolder] as any).directory as FileSystemTree;
    //           continue;
    //         } else
    //           data[splittedPath[i]] = {
    //             file: {
    //               contents: fileContent
    //             }
    //           };
    //       }
    //     }
    //   })
    // );
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

  // for (const values of Object.values(libraryCodes)) {
  //   const packageJsonOfLibrary = values.raw['package.json'];
  //   const packageJsonFormatted = JSON.parse(packageJsonOfLibrary);
  //   for (const type of ['dependencies', 'devDependencies', 'peerDependencies']) {
  //     if (!packageJsonFormatted[type]) continue;
  //     for (const [key, value] of Object.entries(packageJsonFormatted[type])) {
  //       if (value === 'workspace:*') {
  //         const packageJsonOfDependency = JSON.parse(libraryCodes[key].raw['package.json']);
  //         packageJsonFormatted[type][key] = packageJsonOfDependency.version;
  //       }
  //     }
  //   }
  //   const stringfiedPackageJson = JSON.stringify(packageJsonFormatted, null, 2);
  //   if ((values?.formatted?.['package.json'] as any)?.file?.contents)
  //     (values.formatted['package.json'] as any)['file']['contents'] = stringfiedPackageJson;
  // }

  return libraryCodes;
}

// export async function getPalmaresFiles(args?: { generateJson: boolean; host: string | undefined }) {
//   console.log('AQUIIIIIII');
//   const libraryCodes = await getLibraryCodes(
//     Object.entries(palmaresPackagesToFilesAndFolders).map(([key, value]) => [key, value]) as [string, string][],
//     ({ path, content }) => {
//       return {
//         path: path.replace('_', ''),
//         content: content.startsWith('// @ts-nocheck\n') ? content.replace('// @ts-nocheck\n', '') : content
//       };
//     },
//     {
//       fetchExternalTypes: args?.host
//     }
//   );
//
//   if (args?.generateJson) {
//     const json = JSON.stringify(libraryCodes, null, 2);
//     await writeFile(join(process.cwd(), 'public', 'palmares-files.json'), json);
//   }
//
//   return libraryCodes as any;
// }

export async function getExamplesFiles(args?: { generateJson: boolean; host: string | undefined }) {
  const libraryCodes = await getLibraryCodes(
    [['mainpage', join(process.cwd(), '.', 'examples', 'mainpage')]],
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
    await writeFile(join(process.cwd(), 'public', 'examples-files.json'), json);
  }

  return libraryCodes as any;
}
