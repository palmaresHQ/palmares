import { AllServerSettingsType, ServerAdapter } from '@palmares/server';
import express, { type Express } from 'express';

import { requestAdapter } from './request';
import { responseAdapter } from './response';
import { routerAdapter } from './router';

import type { ServerSettingsTypeExpress } from './types';
import type { Domain } from '@palmares/core';
import type multer from 'multer';

export const servers = new Map<
  string,
  {
    server: Express;
    settings: ServerSettingsTypeExpress;
    // eslint-disable-next-line ts/consistent-type-imports
    httpServer?: ReturnType<(typeof import('http'))['createServer']>;
    jsonParser?: ReturnType<(typeof express)['json']>;
    bodyRawParser?: ReturnType<(typeof express)['raw']>;
    formDataParser?: ReturnType<typeof multer>;
    textParser?: ReturnType<(typeof express)['text']>;
    urlEncodedParser?: ReturnType<(typeof express)['urlencoded']>;
  }
>();

let defaultConfig = {} as ServerSettingsTypeExpress;

class ExpressServerAdapter extends ServerAdapter {
  $$type = '$PServerAdapter';
  request = new requestAdapter();
  response = new responseAdapter();
  routers = new routerAdapter();

  constructor(
    serverName: string,
    allSettings: AllServerSettingsType,
    settings: ServerSettingsTypeExpress,
    domains: Domain[]
  ) {
    super(serverName, allSettings, settings, domains);
    
    // If this function is called without new, return a new instance
    if (!(this instanceof ExpressServerAdapter)) {
      return new ExpressServerAdapter(serverName, allSettings, settings, domains);
    }
  }
  
  // eslint-disable-next-line ts/require-await
  async load(serverName: string, _domains: Domain[], settings: ServerSettingsTypeExpress) {
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
    return server;
  }
  
  // eslint-disable-next-line ts/require-await
  static close(serverName: string) {
    servers.get(serverName)?.httpServer?.close();
    servers.delete(serverName);
  }

  // eslint-disable-next-line ts/require-await
  async start(_serverName: string, server: Express, port: number, logServerStart: () => void) {
    server.listen(port, () => logServerStart());
  }

  static new(args: Omit<ServerSettingsTypeExpress, 'server'>) {
    defaultConfig = {
      server: this,
      ...args,
    };

    return {
      server: this,
    };
  }
}

export { ExpressServerAdapter };
export default ExpressServerAdapter;