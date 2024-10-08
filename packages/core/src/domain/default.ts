import { domain } from './function';
import { help } from '../commands/help';
import { PACKAGE_NAME } from '../utils';

import type { CoreSettingsType } from '../conf/types';

export const coreDomain = domain(PACKAGE_NAME, '', {
  modifiers: [] as const,
  commands: {
    help: {
      description:
        'Helps you with all of the other commands. If you do not specify a command it will list all of the ' +
        'available commands alongside of their descriptions. If you do specify a command it will give you the' +
        ' description and example of usage of that command.',
      positionalArgs: undefined,
      keywordArgs: {
        command: {
          description: 'If you add this argument it will show you the help only for that specific command.',
          hasFlag: true,
          type: 'string',
          canBeMultiple: true
        },
        domain: {
          description:
            'If you add this argument it will only show you the help for all of the commands of a specific domain',
          hasFlag: true,
          type: 'string',
          canBeMultiple: true
        }
      } as const,
      handler: (options) => {
        help(options.domains, options.commandLineArgs.keywordArgs);
      }
    }
  },
  // eslint-disable-next-line ts/require-await
  load: async (_: CoreSettingsType) => undefined
});
