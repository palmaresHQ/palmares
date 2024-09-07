import { appServer } from '@palmares/core';

import { ServerAlreadyInitializedError } from './exceptions';
import { initializeRouters } from './utils';
import { DEFAULT_SERVER_PORT } from '../defaults';
import { serverLogger } from '../logging';

import type { ServerAdapter } from '../adapters';
import type { ServerlessAdapter } from '../adapters/serverless';
import type { ServerDomain } from '../domain/types';
import type { AllServerSettingsType, ServerSettingsType } from '../types';

declare global {
  // eslint-disable-next-line no-var
  var $PServerInstances:
    | Map<string, { server: ServerAdapter | ServerlessAdapter; settings: ServerSettingsType }>
    | undefined;
}

function getServerInstances() {
  if (!globalThis.$PServerInstances) globalThis.$PServerInstances = new Map();
  return globalThis.$PServerInstances;
}

/**
 * This is the http app server, it is responsible for loading the server and starting it configuring all of
 * the routes of the application.
 *
 * The life cycle of the app is explained on '@palmares/core', but it's basically:
 * - `load`: Loads the constructor.
 * - `start`: Starts the appServer.
 * - `close`: Called when SIGINT is received.
 */
export const httpAppServer = appServer({
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
      const serverInstances = getServerInstances();
      const serverWasNotInitialized = !serverInstances.has(serverName);
      if (serverWasNotInitialized) {
        const newServerInstance = new serverSettings.server(
          serverName,
          args.settings,
          args.settings.servers[serverName],
          args.domains
        );
        serverInstances.set(serverName, { server: newServerInstance, settings: serverSettings });
        await newServerInstance.load(serverName, args.domains, serverSettings);
        await initializeRouters(args.domains, serverSettings, args.settings, newServerInstance);
      } else throw new ServerAlreadyInitializedError();
    }
  },
  start: async (configureCleanup) => {
    const promises: Promise<void>[] = [];
    const serverInstances = getServerInstances();
    for (const [serverName, { server, settings }] of serverInstances.entries()) {
      // eslint-disable-next-line ts/no-unnecessary-condition
      if ((server as ServerAdapter)?.$$type === '$PServerAdapter') {
        promises.push(
          (server as ServerAdapter).start(serverName, settings.port || DEFAULT_SERVER_PORT, () => {
            serverLogger.logMessage('START_SERVER', { port: settings.port || DEFAULT_SERVER_PORT, serverName });
          })
        );
      }
    }
    await Promise.all(promises.concat(Promise.resolve(configureCleanup())));
  },
  close: async () => {
    const serverInstances = getServerInstances();
    for (const [serverName, { server }] of serverInstances.entries()) {
      serverLogger.logMessage('STOP_SERVER', {
        serverName
      });
      // eslint-disable-next-line ts/no-unnecessary-condition
      if ((server as ServerAdapter)?.$$type === '$PServerAdapter') await (server as ServerAdapter).close();
    }
  }
});
