import { serverAdapter } from '@palmares/server';
import { Domain } from '@palmares/core';
import express, { type Express } from 'express';

import ExpressServerRouterAdapter from './router';
import ExpressServerResponseAdapter from './response';
import ExpressServerRequestAdapter from './request';

import type { ServerSettingsTypeExpress, CustomSettingsForExpress } from './types';
import type multer from 'multer';

export const servers = new Map<
  string,
  {
    server: Express;
    settings: ServerSettingsTypeExpress;
    jsonParser?: ReturnType<typeof express['json']>;
    bodyRawParser?: ReturnType<typeof express['raw']>;
    formDataParser?: ReturnType<typeof multer>;
    textParser?: ReturnType<typeof express['text']>;
    urlEncodedParser?: ReturnType<typeof express['urlencoded']>;
  }
>();

export default serverAdapter({
  request: new ExpressServerRequestAdapter(),
  response: new ExpressServerResponseAdapter(),
  routers: new ExpressServerRouterAdapter(),
  /** Used for defining custom settings specific for express adapter. */
  customServerSettings: (args: CustomSettingsForExpress) => {
    return args;
  },
  load: async (serverName, _domains: Domain[], settings: ServerSettingsTypeExpress) => {
    let server: Express | undefined = servers.get(serverName)?.server;
    if (!server) {
      server = express();
      servers.set(serverName, { server, settings });
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
  start: async (serverName, port, logServerStart) => {
    const serverInstanceToStart = servers.get(serverName);
    if (serverInstanceToStart) {
      serverInstanceToStart.server.listen(port, () => logServerStart());
    }
  },
});
