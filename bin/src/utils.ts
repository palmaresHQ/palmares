import type { Std } from '@palmares/core';

export async function recursivelyCopyFilesFromTemplate(
  std: Std,
  packageManager: string,
  projectName: string,
  templateDirectoryPath: string
) {
  const recursivelyCopyFiles = async (directoryToCreate: string, path: string) => {
    const templateFiles = await std.files.readDirectory(path);
    await std.files.makeDirectory(directoryToCreate);

    await Promise.all(
      templateFiles.map(async (fileOrFolder) => {
        const fileNameRenamed = fileOrFolder.replace(/^\$/g, '.').replace(/^_/g, '');
        const locationPathToCopyFrom = await std.files.join(path, fileOrFolder);
        try {
          await std.files.readDirectory(locationPathToCopyFrom);
          const newDirectoryPath = await std.files.join(directoryToCreate, fileNameRenamed);
          recursivelyCopyFiles(newDirectoryPath, locationPathToCopyFrom);
        } catch (e) {
          //console.log(locationPathToCopyFrom);
          let fileContent = await std.files.readFile(locationPathToCopyFrom);
          const fileName = await std.files.join(directoryToCreate, fileNameRenamed);
          //console.log('Creating file from', locationPathToCopyFrom, 'to', fileName);
          const isPackageJson = fileNameRenamed === 'package.json';
          const isReadme = fileNameRenamed === 'README.md';
          if (isReadme) {
            fileContent = fileContent
              .replaceAll(/\$\{appName\}/g, projectName)
              .replaceAll(/\$\{packageManager\}/g, packageManager);
          }
          if (isPackageJson) {
            const fileContentAsJson = JSON.parse(fileContent);
            fileContentAsJson.name = projectName;
            const dependenciesAsEntries = Object.entries(fileContentAsJson.dependencies).concat(
              Object.entries(fileContentAsJson.devDependencies)
            );
            await Promise.all(
              dependenciesAsEntries.map(async ([key, value]) => {
                if (value === '${version}') {
                  const allVersions = await std.childProcess.executeAndOutput(`npm view ${key} versions --json`);
                  const allVersionsAsArray = JSON.parse(allVersions) as string[];
                  let latestVersion = allVersionsAsArray.pop();
                  while (allVersionsAsArray.length > 0 && latestVersion && latestVersion.includes('-')) {
                    latestVersion = allVersionsAsArray.pop();
                  }
                  if (fileContentAsJson.dependencies[key]) fileContentAsJson.dependencies[key] = `^${latestVersion}`;
                  else fileContentAsJson.devDependencies[key] = `^${latestVersion}`;
                }
              })
            );
            fileContent = JSON.stringify(fileContentAsJson, null, 2);
          }
          await std.files.writeFile(
            fileName,
            fileContent.replace(`// eslint-disable-next-line ts/ban-ts-comment\n// @ts-nocheck\n`, '')
          );
        }
      })
    );
  };

  await recursivelyCopyFiles(projectName, templateDirectoryPath);
}
