import { CommandNotFoundException } from './exceptions';
import { AppServer } from '../app';
import { initializeApp } from '../app/utils';
import { initializeDomains } from '../domain/utils';
import { getLogger, setLogger } from '../logging';
import { PACKAGE_NAME, structuredClone } from '../utils';

import type { DefaultCommandType, DomainHandlerFunctionArgs } from './types';
import type { appServer } from '../app';
import type { SettingsType2 } from '../conf/types';
import type Std from '../std-adapter';

let cachedCommands = {} as DefaultCommandType;

export function getCommands() {
  return cachedCommands;
}

function getValueFromType(type: 'boolean' | 'number' | 'string' | string[] | readonly string[], value: string) {
  switch (type) {
    case 'string':
      return value.toString();
    case 'number': {
      const valueToReturn = Number(value);
      if (isNaN(valueToReturn)) throw new Error(`Invalid number ${value}`);
      else return valueToReturn;
    }
    case 'boolean':
      return value === 'true' || value === '1' || value === 'yes' || value === 'y';
    default:
      if (Array.isArray(type) && type.includes(value)) return value;
      else throw new Error(`Invalid type ${type}`);
  }
}

/**
 * This will format the arguments and it will return an object with the positional and keyword arguments.
 * It will also check and parse the arguments from the `type` provided on either the `keywordArgs` or `positionalArgs`
 * object of your domain.
 *
 * @example ```ts
 * import { domain, handleCommands } from '@palmares/core';
 *
 * const testDomain = domain('test', __dirname, {
 *  commands: {
 *   testCommand: {
 *    keywordArgs: {
 *      test: {
 *       type: 'string',
 *       description: 'This is a test keyword argument',
 *      },
 *    },
 *    positionalArgs: {
 *     test: {
 *       type: 'string',
 *       description: 'This is a test positional argument',
 *     },
 *    },
 *    handler: async ({ args }) => {
 *    console.log(args);
 *   // { positionalArgs: { test: 'test' }, keywordArgs: { test: 'test' } }
 *  }
 * }
 *
 * handleCommands({ installedDomains: [testDomain] }, ['testCommand', 'test', '--test=test']);
 * ```
 *
 * @param command - The command object that will be used to format the arguments.
 * @param args - The arguments that will be formatted.
 */
function formatArgs(command: DefaultCommandType[string], args: string[]) {
  const isArgAKeywordParameter = (arg: string) => arg.startsWith('--') || arg.startsWith('-');
  const positionalArguments = structuredClone(command.positionalArgs || ({} as object)) as NonNullable<
    DefaultCommandType[string]['positionalArgs']
  >;
  const allKeywordArgsFlagsByRealName =
    // eslint-disable-next-line ts/no-unnecessary-condition
    Object.entries(command.keywordArgs || ({} as DefaultCommandType[string]))
      .map(([argName, arg]) => (arg.hasFlag ? { [argName[0]]: argName } : undefined))
      .filter((arg) => arg !== undefined)
      .reduce((accumulator, current) => {
        const [key, value] = Object.entries(current as object)[0];
        // eslint-disable-next-line ts/no-unnecessary-condition
        if (accumulator) {
          accumulator[key] = value;
          return accumulator;
        } else return { [key]: value };
      }, {}) || ({} as { [key: string]: string });

  const positionalArgs: { [key: string]: any } = {};
  const keywordArgs: { [key: string]: any } = {};

  while (args.length > 0) {
    const arg = args.shift() as string;
    const isArgAKeywordParam = isArgAKeywordParameter(arg);

    if (isArgAKeywordParam) {
      const argKey = arg.replace(/^(--|-)/, '');
      const [keywordArgument, possibleArgument] = argKey.split(/=(.*)/g);

      const formattedKeywordArgument = allKeywordArgsFlagsByRealName[keywordArgument] || keywordArgument;
      // eslint-disable-next-line ts/no-unnecessary-condition
      if (command.keywordArgs && command.keywordArgs[formattedKeywordArgument]) {
        const isABooleanParameter =
          (typeof command.keywordArgs[formattedKeywordArgument].type === 'string' &&
            command.keywordArgs[formattedKeywordArgument].type === 'boolean') ||
          typeof command.keywordArgs[formattedKeywordArgument].type !== 'string';
        let valueToUse = possibleArgument;

        if (!valueToUse || isABooleanParameter) {
          const hasDefaultValue = command.keywordArgs[formattedKeywordArgument].default;

          if (hasDefaultValue) valueToUse = command.keywordArgs[formattedKeywordArgument].default;
          else if (isABooleanParameter) valueToUse = 'true';
          else valueToUse = args.shift() as string;
        }
        const valueToUseFormatted = getValueFromType(
          command.keywordArgs[formattedKeywordArgument].type || 'boolean',
          valueToUse
        );

        const canBeMultiple = command.keywordArgs[formattedKeywordArgument].canBeMultiple;
        if (canBeMultiple && Array.isArray(keywordArgs[formattedKeywordArgument]))
          keywordArgs[formattedKeywordArgument].push(valueToUseFormatted);
        else keywordArgs[formattedKeywordArgument] = canBeMultiple ? [valueToUseFormatted] : valueToUseFormatted;
      }
    } else if (Object.keys(positionalArguments).length > 0) {
      const [positionalArgument, positionalArgsData] = Object.entries(positionalArguments)[0];
      positionalArgs[positionalArgument] = getValueFromType(positionalArgsData.type || 'string', arg);
      delete positionalArguments[positionalArgument];
    }
  }

  return {
    positionalArgs,
    keywordArgs
  };
}

/**
 * Main entrypoint for the hole application, the idea is simple: when we start the program we load all the domains,
 * then we get all the commands it have.
 */
export async function handleCommands(
  settingsOrSettingsPath:
    | Promise<{ default: SettingsType2 }>
    | SettingsType2
    | Std
    | Promise<{ default: Std }>
    | {
        settingsPathLocation: string;
        std: Std;
      },
  args: string[]
): Promise<void> {
  let logger = getLogger();
  logger.info(new Date().toISOString());
  logger.info('Loading the settings and domains...');
  const commandType = args[0];

  const { settings, domains, commands: availableCommands } = await initializeDomains(settingsOrSettingsPath);

  // the '@palmares/logging' package sends a new logger constructor through the settings, if that exist we will use it,
  // otherwise it'll just be a default `console.info`
  const loggerConstructorFromPalmaresLoggingPackage = (settings as any)?.__logger as
    | (new (args: { name?: string; domainName?: string }) => {
        log: (message: string) => void;
        info: (message: string) => void;
        debug: (message: string) => void;
        warn: (message: string) => void;
        error: (message: string) => void;
      })
    | undefined;
  if (loggerConstructorFromPalmaresLoggingPackage)
    setLogger(new loggerConstructorFromPalmaresLoggingPackage({ domainName: PACKAGE_NAME }));
  logger = getLogger();

  cachedCommands = availableCommands;

  const isCommandDefined: boolean =
    // eslint-disable-next-line ts/no-unnecessary-condition
    typeof availableCommands[commandType] === 'object' && availableCommands[commandType] !== undefined;

  let returnOfCommand: void | typeof AppServer | ReturnType<typeof appServer>;
  let formattedCommandLineArgs = {
    positionalArgs: {},
    keywordArgs: {}
  } as DomainHandlerFunctionArgs['commandLineArgs'];

  if (isCommandDefined) {
    formattedCommandLineArgs = formatArgs(availableCommands[commandType], args.slice(1, args.length));

    logger.info(`Domains loaded, running the command [${commandType}]`);

    returnOfCommand = await Promise.resolve(
      availableCommands[commandType].handler({
        settings,
        domains,
        commandLineArgs: formattedCommandLineArgs as any
      })
    );
  } else {
    throw new CommandNotFoundException(commandType);
  }

  // This will start the app server if your command returns an app server class. Please, don't try to run the app
  // server manually, unless you REALLY know what you are doing, since it has it's own lifecycle.
  if (returnOfCommand?.prototype instanceof AppServer) {
    logger.info(`Command wants to start the app server, starting it...`);

    initializeApp(domains, settings, formattedCommandLineArgs, returnOfCommand);
  }
}
