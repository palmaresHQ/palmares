import { Middleware, serverAdapter } from '@palmares/server';
import { Domain } from '@palmares/core';
import express, { Express } from 'express';

import { ServerSettingsTypeExpress, CustomSettingsForExpress } from './types';
import ExpressServerRouterAdapter from './router';
import ExpressServerResponseAdapter from './response';

export const servers = new Map<string, Express>();

export default serverAdapter({
  response: new ExpressServerResponseAdapter(),
  routers: new ExpressServerRouterAdapter(),
  customServerSettings: (args: CustomSettingsForExpress) => {
    return args;
  },
  load: async (serverName, _domains: Domain[], settings: ServerSettingsTypeExpress) => {
    let server: Express | undefined = servers.get(serverName);
    if (!server) {
      server = express();
      servers.set(serverName, server);
    }
    if (settings?.customServerSettings?.middlewares) {
      settings.customServerSettings.middlewares.forEach((middleware) => {
        server?.use(middleware);
      });
    }
  },
  close: async () => {
    console.log('close');
  },
  load404: async (handler: Middleware) => {
    console.log('load404');
  },
  load500: async (handler: Middleware) => {
    console.log('load500');
  },
  start: async (serverName, port) => {
    const serverInstanceToStart = servers.get(serverName);
    if (serverInstanceToStart) {
      serverInstanceToStart.listen(port, () => {
        console.log(`Server ${serverName} started on port ${port}`);
      });
    }
  },
});
