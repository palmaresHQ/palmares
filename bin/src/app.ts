#!/usr/bin/env node

import { ConsoleLogging } from '@palmares/console-logging';
import { Commands, CoreDomain, defineSettings, domain, std } from '@palmares/core';
import { Logger, loggingDomain } from '@palmares/logging';
import { NodeStd } from '@palmares/node-std';

import { recursivelyCopyFilesFromTemplate } from './utils';

import type { ExtractCommandsType } from '@palmares/core';

type TemplatesJson = {
  name: string;
  templates: {
    name: string;
    location: string;
    messages: {
      onStart: string;
      onDoing: string;
      onFinish: {
        message: string;
        commands:
          | string[]
          | {
              command: string;
              message: string;
            }[];
      };
    };
  }[];
};

const logger = new Logger({ domainName: 'palmares' });
const cpaDomain = domain('palmares', '', {
  commands: {
    new: {
      description: 'Create a new Palmares app',
      positionalArgs: {
        appType: {
          description: 'The type of app you want to create',
          type: 'string',
          required: false
        },
        name: {
          description: 'The name of the app you are creating',
          type: 'string',
          required: false
        }
      },
      keywordArgs: {
        template: {
          description: 'The template to use for the database app',
          type: 'string'
        },
        pm: {
          description: 'The package manager to use',
          type: ['pnpm', 'npm', 'yarn', 'bun']
        }
      },
      handler: async (args) => {
        // @ts-ignore Trust me bro
        const basePath = import.meta.dirname;
        const fullPath = await std.files.join(basePath, '..', 'templates');
        const allApps = await std.files.readDirectory(fullPath);
        const commandLineArgs = args.commandLineArgs as ExtractCommandsType<typeof cpaDomain, 'new'>;
        let appType: undefined | string = commandLineArgs.positionalArgs.appType;
        let packageManager: undefined | 'pnpm' | 'npm' | 'yarn' | 'bun' = commandLineArgs.keywordArgs.pm;
        let name = commandLineArgs.positionalArgs.name;

        if (!appType) appType = await std.asker.askSelection(`\x1b[1mWhich app you want to create?\x1b[0m`, allApps);

        if (!appType)
          throw new Error(
            'You must provide a type for the app.\n\nOptions:\n\n' + allApps.map((app) => `- ${app}`).join('\n')
          );

        if (!name) {
          name = await std.asker.askClearingScreen(
            [`\x1b[1mWhat is the name of your project?\x1b[0m`],
            (answer) => `\x1b[1mWhat is the name of your project?\x1b[0m \x1b[32m${answer}\x1b[0m`
          );
        }

        if (!packageManager)
          packageManager = (await std.asker.askSelection(`\x1b[1mWhich package manager would you like to use?\x1b[0m`, [
            'npm',
            'yarn',
            'pnpm',
            'bun'
          ])) as 'npm' | 'yarn' | 'pnpm' | 'bun' | undefined;

        if (!packageManager) throw new Error('You must provide a package manager to use');

        const path = await std.files.join(fullPath, appType);
        try {
          const templatesJson = JSON.parse(await std.files.readFile(await std.files.join(path, 'templates.json'))) as
            | TemplatesJson
            | undefined;

          if (!templatesJson) throw new Error('Could not find templates.json in the template directory');

          const templateToUse = commandLineArgs.keywordArgs.template;
          let template = templateToUse
            ? templatesJson.templates.find((template) => template.name === templateToUse)
            : undefined;

          if (!template) {
            const question =
              typeof templateToUse === 'string'
                ? `Template '${templateToUse}' not found. Choose one from the list`
                : 'Which template would you like to use?';

            const answer = await std.asker.askSelection(
              `\x1b[1m${question}\x1b[0m`,
              templatesJson.templates.map((template) => template.name)
            );

            template = templatesJson.templates.find((template) => template.name === answer);
          }

          if (template?.messages['onStart'])
            logger.log(
              template.messages['onStart']
                .replaceAll('${appName}', name)
                .replaceAll('${packageManager}', packageManager)
            );

          const templatePath = await std.files.join(path, ...(template?.location.split('/') || []));
          await recursivelyCopyFilesFromTemplate(std, packageManager, name, templatePath);

          logger.log(`\x1b[1mInstalling dependencies on '${name}' using '${packageManager}'...\x1b[0m`);

          const done = {
            done: false
          };

          const message1 = setTimeout(() => {
            if (!done.done) logger.log(`It might take a few minutes, hang in there...`);
          }, 10000);

          const message2 = setTimeout(() => {
            if (!done.done) logger.log(`Just a little more time...`);
          }, 30000);

          const message3 = setTimeout(() => {
            if (!done.done)
              logger.log(
                `Use the millions you will earn with your '${name}' application to buy ` +
                  `yourself a really good internet connection...\n`
              );
          }, 60000);

          const message4 = setTimeout(() => {
            if (!done.done) logger.log(`Probably using Bun will speed it up, you should check it out!\n`);
          }, 60000 * 2);

          const message5 = setTimeout(() => {
            if (!done.done)
              logger.log(`You are still here huh? I like your perseverance, but you should give up, it's over\n`);
          }, 60000 * 5);

          std.childProcess.executeAndOutput(`cd ${name} && ${packageManager} i`).then(async () => {
            done.done = true;
            clearTimeout(message1);
            clearTimeout(message2);
            clearTimeout(message3);
            clearTimeout(message4);
            clearTimeout(message5);

            if (template?.messages['onFinish']) {
              for (const commandToRunOrObject of template.messages['onFinish'].commands) {
                const commandToRun = (
                  typeof commandToRunOrObject === 'string' ? commandToRunOrObject : commandToRunOrObject.command
                ).replaceAll('${packageManager}', packageManager);
                const message =
                  typeof commandToRunOrObject === 'string'
                    ? `Running command '${commandToRun}'...`
                    : commandToRunOrObject.message;
                logger.log(message);

                console.log(await std.childProcess.executeAndOutput(`cd ${name} && ${commandToRun}`));
              }
              logger.log(
                template.messages['onFinish'].message
                  .replaceAll('${appName}', name)
                  .replaceAll('${packageManager}', packageManager)
              );
            }
          });
        } catch (e) {
          console.log(e);
          throw new Error('Could not find templates.json in the template directory');
        }
      }
    }
  }
});

Commands.handleCommands(
  defineSettings({
    basePath: '',
    settingsLocation: '',
    std: NodeStd,
    installedDomains: [
      [CoreDomain, {}],
      [
        loggingDomain,
        {
          logger: ConsoleLogging
        }
      ],
      cpaDomain
    ]
  }),
  process.argv.slice(2)
);
