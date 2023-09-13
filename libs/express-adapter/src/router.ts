import { serverRouterAdapter } from '@palmares/server';

import { servers } from './server';

import type { Express, Request, Response } from 'express';

/**
 * This will automatically initialize all the routes of the server on the express server.
 */
export default serverRouterAdapter({
  parseHandler(server, path, method, handler, _) {
    const initializedServer = servers.get(server.serverName);
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
});
