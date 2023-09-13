import { domain } from '@palmares/core';

import httpAppServer from '../app';
import type { path, pathNested } from '../router/functions';
import type { ServersSettingsType } from '../types';
import ServerAdapter from '../adapters';

export const serverDomainModifier = domain<{
  getRoutes: () =>
    | Promise<ReturnType<typeof path> | Omit<ReturnType<typeof path>, never>>
    | ReturnType<typeof path>
    | Omit<ReturnType<typeof path>, never>;
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
