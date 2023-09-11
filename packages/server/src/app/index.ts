import { Domain, ExtractCommandsType, ExtractModifierArguments, SettingsType2, appServer } from '@palmares/core';
import { ServerAlreadyInitializedError } from './exceptions';

import type Server from '../adapters';
import type { AllServerSettingsType } from '../types';
import type { ServerDomain } from '../domain/types';
import { serverDomainModifier } from '../domain';
import { getAllHandlers } from './utils';

let serverInstance: Server | undefined = undefined;

/**
 * This is the http app server, it is responsible for loading the server and starting it configuring all of the routes of the application.
 *
 * The life cycle of the app is explained on '@palmares/core', but it's basically:
 * - `load`: Loads the constructor.
 * - `start`: Starts the appServer.
 * - `close`: Called when SIGINT is received.
 */
export default appServer({
  load: async (args: {
    settings: AllServerSettingsType;
    commandLineArgs: {
      keywordArgs: {
        port?: number;
      };
      positionalArgs: object;
    };
    domains: ServerDomain[];
  }) => {
    if (!serverInstance) {
      serverInstance = new args.settings.server();
      getAllHandlers(args.domains, args.settings, serverInstance);
      console.log('teste');
      serverInstance.load(args.domains, args.settings);
    } else throw new ServerAlreadyInitializedError();
  },
  start: async (configureCleanup) => {
    if (serverInstance) {
      await configureCleanup();
      await serverInstance.start();
    }
  },
  close: async () => {
    if (serverInstance && serverInstance.close) await serverInstance.close();
  },
});
