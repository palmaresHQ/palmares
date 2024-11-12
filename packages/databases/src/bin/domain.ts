import { type ExtractCommandsType, type Std, domain, getDefaultStd } from '@palmares/core';

import { databaseLogger } from '../logging';

const databasesBinDomainBuilder = (
  recursivelyCopyFilesFromTemplate: (std: Std, projectName: string, templateDirectoryPath: string) => void
) =>
  domain('@palmares/databases', '', {
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
          const commandLineArgs = args.commandLineArgs as ExtractCommandsType<
            ReturnType<typeof databasesBinDomainBuilder>,
            'db-app'
          >;
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

          databaseLogger.logMessage('CREATE_PALMARES_DB_APP', {
            name: args.commandLineArgs.positionalArgs.name,
            template: templateName
          });
          const templateDirectoryPath = await std.files.join(fullPath, templateName);
          await recursivelyCopyFilesFromTemplate(std, projectName, templateDirectoryPath);
          databaseLogger.logMessage('DONE_CREATING_PALMARES_DB_APP', {
            name: args.commandLineArgs.positionalArgs.name,
            template: templateName
          });
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

export default databasesBinDomainBuilder;
