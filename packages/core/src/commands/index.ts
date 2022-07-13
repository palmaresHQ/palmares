import Domain from '../domain';
import Configuration from '../conf';
import { SettingsType } from '../conf/types';
import devCommandHandler from './dev';
import { CommandNotFoundException } from './exceptions';
import { DefaultCommandType } from './types';

class Commands {
  #initializedDomains: Domain[] = [];
	#defaultCommands: DefaultCommandType = {
		dev: {
			description: 'Start development server',
			example: 'node manage.js dev',
			handler: devCommandHandler
		}
	}

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

	async handleCommands(settingsPath: string, args: string[]): Promise<void> {
		const commandType = args[0];
		const settings = await Configuration.loadConfiguration(settingsPath);
    const domains = await this.#initializeDomains(settings);
		const isCommandDefined: boolean = typeof this.#defaultCommands[commandType] === 'object' &&
			this.#defaultCommands[commandType] !== undefined;
		if (isCommandDefined) {
			await Promise.resolve(
        this.#defaultCommands[commandType].handler({
          settings, domains, args
        })
      );
		} else {
			throw new CommandNotFoundException(commandType);
		}
	}
}

export default new Commands();
