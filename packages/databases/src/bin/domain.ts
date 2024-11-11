import { type ExtractCommandsType, domain, getDefaultStd } from '@palmares/core';

const databasesBinDomain = domain('@palmares/databases', '', {
  commands: {
    ['db-app']: {
      description: 'Create a new Palmares database application',
      positionalArgs: {
        name: {
          description: 'The name of the database app',
          type: 'string',
          required: true
        }
      },
      keywordArgs: {
        template: {
          description: 'The template to use for the database app',
          type: 'string',
          required: true
        }
      },
      // eslint-disable-next-line ts/require-await
      handler: async (args) => {
        console.log('Creating Palmares app');
        const commandLineArgs = args.commandLineArgs as ExtractCommandsType<typeof databasesBinDomain, 'db-app'>;
        const std = getDefaultStd();
        // @ts-ignore Trust me bro
        const basePath = import.meta.dirname;
        const fullPath = await std.files.join(basePath, '..', 'templates');
        const allOptions = await std.files.readDirectory(fullPath);

        const templateName = commandLineArgs.keywordArgs.template;
        const projectName = commandLineArgs.positionalArgs.name;

        if (!projectName) throw new Error('You must provide a name for the app');

        if (!templateName) {
          throw new Error(
            `Use '--template' to use choose a template to create your app\n\nOptions:\n\n` +
              allOptions.map((option) => `- ${option}\n`).join('')
          );
        }

        const templateDirectoryPath = await std.files.join(fullPath, templateName);

        const recursivelyCopyFiles = async (directoryToCreate: string, path: string) => {
          const templateFiles = await std.files.readDirectory(path);
          await std.files.makeDirectory(directoryToCreate);

          await Promise.all(
            templateFiles.map(async (fileOrFolder) => {
              const fileNameRenamed = fileOrFolder.replace(/^\$/g, '.').replace(/^_/g, '');
              const filePath = await std.files.join(path, fileOrFolder);

              try {
                await std.files.readDirectory(filePath);
                await std.files.makeDirectory(path);
                recursivelyCopyFiles(fileOrFolder, filePath);
              } catch (e) {
                const fileContent = await std.files.readFile(filePath);
                const newFilePath = await std.files.join(path, fileNameRenamed);
                await std.files.writeFile(
                  newFilePath,
                  fileContent.replace(`// eslint-disable-next-line ts/ban-ts-comment\n// @ts-nocheck\n`, '')
                );
              }
            })
          );
        };

        await recursivelyCopyFiles(projectName, templateDirectoryPath);
      }
    },
    ['db-engine']: {
      description: 'Set up a new Palmares Database Engine',
      positionalArgs: {
        name: {
          description: 'The name of the database engine',
          type: 'string',
          required: true
        }
      },
      keywordArgs: {},
      async handler() {
        console.log('Setting up Palmares Database Engine');
      }
    }
  }
});

export default databasesBinDomain;
