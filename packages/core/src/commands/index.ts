import Configuration from '../conf';
import devCommandHandler from './dev';
import { CommandNotFoundException } from './exceptions';
import { DefaultCommandType } from './types';

class Commands {
    #defaultCommands: DefaultCommandType = {
        dev: {
            description: 'Start development server',
            example: 'node manage.js dev',
            handler: devCommandHandler
        }
    }

    async handleCommands(settingsPath: string, args: string[]): Promise<void> {
        const commandType = args[0];
        await Configuration.loadConfiguration(settingsPath);
        const isCommandDefined: boolean = typeof this.#defaultCommands[commandType] === 'object' && 
            this.#defaultCommands[commandType] !== undefined;
        if (isCommandDefined) {
            await Promise.resolve(this.#defaultCommands[commandType].handler(args));
        } else {
            throw new CommandNotFoundException(commandType);
        }
    }
}

export default new Commands();