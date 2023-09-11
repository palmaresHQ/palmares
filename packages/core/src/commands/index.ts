import { SettingsType2, StdLike } from '../conf/types';
import { CommandNotFoundException } from './exceptions';
import { DefaultCommandType, DomainHandlerFunctionArgs } from './types';
import { initializeDomains } from '../domain/utils';
import { setSettings } from '../conf/settings';
import { AppServer, appServer } from '../app';
import { initializeApp } from '../app/utils';

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
 * It will also check and parse the arguments from the `type` provided on either the `keywordArgs` or `positionalArgs` object of your domain.
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
 */
async function formatArgs(command: DefaultCommandType[string], args: string[]) {
  const isArgAKeywordParameter = (arg: string) => arg.startsWith('--') || arg.startsWith('-');
  const positionalArguments = structuredClone(command.positionalArgs || ({} as object)) as NonNullable<
    DefaultCommandType[string]['positionalArgs']
  >;
  const allKeywordArgsFlagsByRealName =
    Object.entries(command.keywordArgs || ({} as DefaultCommandType[string]))
      .map(([argName, arg]) => (arg.hasFlag ? { [argName[0]]: argName } : undefined))
      .filter((arg) => arg !== undefined)
      .reduce((accumulator, current) => {
        const [key, value] = Object.entries(current as object)[0];
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
      delete positionalArguments[positionalArgument as string];
    }
  }

  return {
    positionalArgs,
    keywordArgs,
  };
}

/**
 * Main entrypoint for the hole application, the idea is simple: when we start the program we load all the domains, then we get all the commands it have.
 */
export async function handleCommands(
  settingsOrSettingsPath:
    | Promise<{ default: SettingsType2 }>
    | SettingsType2
    | StdLike
    | Promise<{ default: StdLike }>
    | {
        settingsPathLocation: string;
        std: StdLike;
      },
  args: string[]
): Promise<void> {
  const commandType = args[0];
  const settings = await setSettings(settingsOrSettingsPath);

  const { domains, commands: availableCommands } = await initializeDomains(settings);

  cachedCommands = availableCommands;

  const isCommandDefined: boolean =
    typeof availableCommands[commandType] === 'object' && availableCommands[commandType] !== undefined;

  let returnOfCommand: void | typeof AppServer | ReturnType<typeof appServer>;
  let formattedCommandLineArgs = {
    positionalArgs: {},
    keywordArgs: {},
  } as DomainHandlerFunctionArgs['commandLineArgs'];

  if (isCommandDefined) {
    formattedCommandLineArgs = await formatArgs(availableCommands[commandType], args.slice(1, args.length));
    returnOfCommand = await Promise.resolve(
      availableCommands[commandType].handler({
        settings,
        domains,
        commandLineArgs: formattedCommandLineArgs,
      })
    );
  } else {
    throw new CommandNotFoundException(commandType);
  }

  // This will start the app server if your command returns an app server class. Please, don't try to run the app server manually, unless you REALLY know
  // what you are doing, since it has it's own lifecycle.
  if (returnOfCommand?.prototype instanceof AppServer)
    initializeApp(domains, settings, formattedCommandLineArgs, returnOfCommand);
}
