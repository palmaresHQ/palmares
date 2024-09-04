import { domain } from '@palmares/core';

import httpAppServer from '../app';
import Serverless from '../serverless';

import type { ServerDomain } from './types';
import type { BaseRouter } from '../router/routers';
import type { ServersSettingsType } from '../types';

export const serverDomainModifier = domain<{
  getRoutes: () =>
    | Promise<BaseRouter<any, any, any, any, any>>
    | BaseRouter<any, any, any, any, any>
    | Omit<BaseRouter<any, any, any, any, any>, never>;
  /**
   * Router interceptors are used to retrieve the information metadata about all of the routes inside of the
   * application, this way you can dynamically create routers and paths when you start the application.
   * Imagine building a swagger documentation, you can intercept it and build the json documentation before actually
   * running the server.
   */
  routerInterceptor?: (router: BaseRouter['__completePaths']) => Promise<void>;
}>('@palmares/server', '', {} as any);

export default domain('@palmares/server', '', {
  commands: {
    runserver: {
      description: 'Start the server in development mode',
      keywordArgs: {
        port: {
          description: 'The port to run the server on',
          type: 'number',
          default: 4000,
          hasFlag: true
        }
      },
      positionalArgs: undefined,
      handler: () => {
        return httpAppServer;
      }
    },
    serverless: {
      description: 'Generate the serverless configuration from the server',
      keywordArgs: undefined,
      positionalArgs: undefined,
      handler: async ({ domains, settings }) => {
        const serverlessInstance = new Serverless();
        await serverlessInstance.load({
          settings: settings as any,
          domains: domains as ServerDomain[]
        });
      }
    }
  },
  // eslint-disable-next-line ts/require-await
  load: async (_: ServersSettingsType) => undefined
});
