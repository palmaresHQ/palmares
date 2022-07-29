import Domain from '../domain';
import Configuration from '../conf';
import { SettingsType } from '../conf/types';
import { CommandNotFoundException } from './exceptions';
import { DefaultCommandType } from './types';

class Commands {
	#defaultCommands: DefaultCommandType = {}

  async #initializeDomains(settings: SettingsType) {
    const initializedDomains: Domain[] = [];
    const domainClasses = await Domain.retrieveDomains(settings);
    for (const domainClass of domainClasses) {
      const initializedDomain = new domainClass();
      await initializedDomain.load(settings);
      this.#defaultCommands = {
        ...this.#defaultCommands,
        ...initializedDomain.commands,
      }
      initializedDomains.push(initializedDomain);
    }
    return initializedDomains;
  }

  async #formatArgs(args: string[]) {
    const isArgAParameter = (arg: string) => arg.startsWith('--');
    const positionalArgs: string[] = [];
    const keywordArgs: { [key: string]: any} = {};
    let canBePositional = true;

    for (let i=0; i<args.length; i++) {
      const arg = args[i];
      if (isArgAParameter(arg)) {
        const initialIndex = i + 1;
        const argKey = arg.replace(/^--/, '');
        keywordArgs[argKey] = true;
        canBePositional = false;

        for (let argIndex = initialIndex; argIndex<args.length; argIndex++) {
          const argValue = args[argIndex];

          if (isArgAParameter(argValue)) break;
          const isFirstArgument = argIndex === initialIndex;
          const isKeywordArgsAnArray = Array.isArray(keywordArgs[argKey]);

          if (!isFirstArgument) {
            if (!isKeywordArgsAnArray) keywordArgs[argKey] = [keywordArgs[argKey]];
            keywordArgs[argKey].push(argValue);
          } else keywordArgs[argKey] = argValue;
          i = argIndex;
        }
      } else if (canBePositional) {
        positionalArgs.push(arg);
      }
    }

    return {
      positionalArgs,
      keywordArgs
    }
  }

	async handleCommands(settingsOrSettingsPath: Promise<SettingsType> | SettingsType | string, args: string[]): Promise<void> {
		const commandType = args[0];
    const otherArgs = await this.#formatArgs(args.slice(1, args.length));
		const settings = await Configuration.loadConfiguration(settingsOrSettingsPath);
    const domains = await this.#initializeDomains(settings);
		const isCommandDefined: boolean = typeof this.#defaultCommands[commandType] === 'object' &&
			this.#defaultCommands[commandType] !== undefined;
		if (isCommandDefined) {
			await Promise.resolve(
        this.#defaultCommands[commandType].handler({
          settings, domains, args: otherArgs
        })
      );
		} else {
			throw new CommandNotFoundException(commandType);
		}
	}
}

export default new Commands();
