import { Domain, ExtractCommandsType, ExtractModifierArguments, SettingsType2, appServer } from '@palmares/core';

import { ServerAlreadyInitializedError } from './exceptions';
import { serverDomainModifier } from '../domain';
import { getAllHandlers, initializeRouters } from './utils';

import type Server from '../adapters';
import type { ServerSettingsType, AllServerSettingsType } from '../types';
import type { ServerDomain } from '../domain/types';
import { DEFAULT_SERVER_PORT } from '../defaults';

let serverInstances: Map<string, { server: Server; settings: ServerSettingsType }> = new Map();

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
    const serverEntries = Object.entries(args.settings.servers);
    for (const [serverName, serverSettings] of serverEntries) {
      const serverWasNotInitialized = !serverInstances.has(serverName);
      if (serverWasNotInitialized) {
        const newServerInstance = new serverSettings.server(serverName);
        serverInstances.set(serverName, { server: newServerInstance, settings: serverSettings });
        await newServerInstance.load(serverName, args.domains, serverSettings);
        await initializeRouters(args.domains, serverSettings, newServerInstance);
      } else throw new ServerAlreadyInitializedError();
    }
  },
  start: async (configureCleanup) => {
    const promises: Promise<void>[] = [];
    for (const [serverName, { server, settings }] of serverInstances.entries()) {
      promises.push(
        server.start(serverName, settings.port || DEFAULT_SERVER_PORT, () => {
          console.log(`Server ${serverName} started on port ${settings.port || DEFAULT_SERVER_PORT}`);
        })
      );
    }
    await Promise.all(promises);
  },
  close: async () => {
    //if (serverInstance && serverInstance.close) await serverInstance.close();
  },
});
