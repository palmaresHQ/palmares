import { serverRouterAdapter } from '@palmares/server';

import { servers } from './server';

import type { Express, Request, Response } from 'express';

/**
 * This will automatically initialize all the routes of the server on the express server.
 */
export default serverRouterAdapter({
  /**
   * handler is the function to call when a request is made to the server, by default Palmares
   * gives us the option to send a data during the request/response lifecycle, we just send req and res.
   *
   * We can use this data to send a response, parse the request and do pretty much anything.
   */
  parseHandler(server, path, method, handler, _) {
    const initializedServer = servers.get(server.serverName)?.server;
    const methodAsLowerCase = method.toLowerCase() as keyof Express;
    // This will initialize the server routes.
    if (initializedServer && typeof initializedServer[methodAsLowerCase] === 'function') {
      initializedServer[methodAsLowerCase](path, (req: Request, res: Response) => {
        const serverRequestAndResponseData = {
          req,
          res,
        };
        handler(serverRequestAndResponseData);
      });
    }
  },
  parseRoute(_, partOfPath, urlParamType) {
    if (urlParamType) return `:${partOfPath}`;
    else return partOfPath;
  },
  load404: async (server, handler) => {
    const initializedServer = servers.get(server.serverName)?.server;
    if (initializedServer) {
      initializedServer.use((req, res) => {
        const serverRequestAndResponseData = {
          req,
          res,
        };
        handler(serverRequestAndResponseData);
      });
    }
  },
  load500: async (server, handler) => {
    console.log('load500');
  },
});
