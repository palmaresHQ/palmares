import { serverAdapter } from '@palmares/server';
import express, { type Express } from 'express';

import ExpressServerRequestAdapter from './request';
import ExpressServerResponseAdapter from './response';
import ExpressServerRouterAdapter from './router';

import type { CustomSettingsForExpress, ServerSettingsTypeExpress } from './types';
import type { Domain } from '@palmares/core';
import type multer from 'multer';

export const servers = new Map<
  string,
  {
    server: Express;
    settings: ServerSettingsTypeExpress;
    jsonParser?: ReturnType<(typeof express)['json']>;
    bodyRawParser?: ReturnType<(typeof express)['raw']>;
    formDataParser?: ReturnType<typeof multer>;
    textParser?: ReturnType<(typeof express)['text']>;
    urlEncodedParser?: ReturnType<(typeof express)['urlencoded']>;
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
  // eslint-disable-next-line ts/require-await
  load: async (serverName, _domains: Domain[], settings: ServerSettingsTypeExpress) => {
    let server: Express | undefined = servers.get(serverName)?.server;
    if (!server) {
      server = express();
      servers.set(serverName, { server, settings });
    }
    if (settings.customServerSettings?.middlewares) {
      settings.customServerSettings.middlewares.forEach((middleware) => {
        server.use(middleware);
      });
    }
  },
  // eslint-disable-next-line ts/require-await
  close: async () => {
    console.log('close');
  },
  // eslint-disable-next-line ts/require-await
  start: async (serverName, port, logServerStart) => {
    const serverInstanceToStart = servers.get(serverName);
    if (serverInstanceToStart) {
      serverInstanceToStart.server.listen(port, () => logServerStart());
    }
  }
});
