import { appServer } from '@palmares/core';

import { ServerAlreadyInitializedError } from './exceptions';
import { initializeRouters } from './utils';
import { DEFAULT_SERVER_PORT } from '../defaults';
import { serverLogger } from '../logging';
import ServerAdapter from '../adapters';

import type { ServerSettingsType, AllServerSettingsType } from '../types';
import type { ServerDomain } from '../domain/types';
import type ServerlessAdapter from '../adapters/serverless';

let serverInstances: Map<string, { server: ServerAdapter | ServerlessAdapter; settings: ServerSettingsType }> = new Map();

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
        const newServerInstance = new serverSettings.server(serverName, args.settings, args.domains);
        serverInstances.set(serverName, { server: newServerInstance, settings: serverSettings });
        await newServerInstance.load(serverName, args.domains, serverSettings);
        await initializeRouters(args.domains, serverSettings, args.settings, newServerInstance);
      } else throw new ServerAlreadyInitializedError();
    }
  },
  start: async (configureCleanup) => {
    const promises: Promise<void>[] = [];
    for (const [serverName, { server, settings }] of serverInstances.entries()) {
      if (server instanceof ServerAdapter) {
        promises.push(
          server.start(serverName, settings.port || DEFAULT_SERVER_PORT, () => {
            serverLogger.logMessage('START_SERVER', { port: settings.port || DEFAULT_SERVER_PORT, serverName });
          })
        );
      }
    }
    await Promise.all(promises.concat(configureCleanup()));
  },
  close: async () => {
    for (const [serverName, { server }] of serverInstances.entries()) {
      serverLogger.logMessage('STOP_SERVER', {
        serverName,
      });
      if (server instanceof ServerAdapter) await server.close();
    }
  },
});
