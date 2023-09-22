import { domain } from '@palmares/core';

import httpAppServer from '../app';
import type { path } from '../router/functions';
import type { ServersSettingsType } from '../types';
import { BaseRouter } from '../router/routers';

export const serverDomainModifier = domain<{
  getRoutes: () =>
    | Promise<ReturnType<typeof path> | Omit<ReturnType<typeof path>, never>>
    | ReturnType<typeof path>
    | Omit<ReturnType<typeof path>, never>;
  /**
   * Router interceptors are used to retrieve the information metadata about all of the routes inside of the application, this way you can dynamically create
   * routers and paths when you start the application. Imagine building a swagger documentation, you can intercept it and build the json documentation before actually
   * running the server.
   */
  routerInterceptor?: (router: BaseRouter['__completePaths']) => Promise<void>;
}>('@palmares/server', __dirname, {});

export default domain('@palmares/server', __dirname, {
  commands: {
    runserver: {
      description: 'Start the server in development mode',
      keywordArgs: {
        port: {
          description: 'The port to run the server on',
          type: 'number',
          default: 4000,
          hasFlag: true,
        },
      },
      positionalArgs: undefined,
      handler: async (options) => {
        return httpAppServer;
      },
    },
  },
  load: async (_: ServersSettingsType) => undefined,
});
