import { appServer } from '@palmares/core';

import { loadServer } from './utils';
import { getServerInstances } from '../config';
import { DEFAULT_SERVER_PORT } from '../defaults';
import { serverLogger } from '../logging';

import type { ServerAdapter } from '../adapters';
import type { ServerDomain } from '../domain/types';
import type { AllServerSettingsType } from '../types';

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
  load: (args: {
    settings: AllServerSettingsType;
    commandLineArgs: {
      keywordArgs: {
        port?: number;
      };
      positionalArgs: object;
    };
    domains: ServerDomain[];
  }) => {
    return loadServer(args);
  },
  start: async (configureCleanup) => {
    const promises: Promise<void>[] = [];
    const serverInstances = getServerInstances();
    for (const [serverName, { server, settings, loadedServer }] of serverInstances.entries()) {
      // eslint-disable-next-line ts/no-unnecessary-condition
      if ((server as ServerAdapter)?.$$type === '$PServerAdapter') {
        promises.push(
          (server as ServerAdapter).start(serverName, loadedServer, settings.port || DEFAULT_SERVER_PORT, () => {
            serverLogger.logMessage('START_SERVER', { port: settings.port || DEFAULT_SERVER_PORT, serverName });
          })
        );
      }
    }
    await Promise.all(promises.concat(Promise.resolve(configureCleanup())));
  },
  close: async () => {
    const serverInstances = getServerInstances();
    for (const [serverName, { server, loadedServer }] of serverInstances.entries()) {
      serverLogger.logMessage('STOP_SERVER', {
        serverName
      });
      // eslint-disable-next-line ts/no-unnecessary-condition
      if ((server as ServerAdapter)?.$$type === '$PServerAdapter')
        await (server as ServerAdapter).close(serverName, loadedServer);
    }
  }
});
