import { type MethodTypes, type ParseHandlersServer, serverRouterAdapter } from '@palmares/server';

import { servers } from './server';

import type { Express, Request, RequestHandler, Response } from 'express';

/**
 * This will automatically initialize all the routes of the server on the express server.
 */
export const routerAdapter = serverRouterAdapter({
  /**
   * Handler is the function to call when a request is made to the server, by default Palmares
   * gives us the option to send a data during the request/response lifecycle, we just send req and res.
   *
   * We can use this data to send a response, parse the request and do pretty much anything.
   */
  parseHandlers(_, initializedServer: Express, path, handlers: ParseHandlersServer<RequestHandler[]>, __, handler404) {
    // This will initialize the server routes.
    initializedServer.all(path, (req: Request, res: Response) => {
      let currentMiddlewareIndex = 0;

      const runMiddlewares = (methodType: MethodTypes | 'all', req: Request, res: Response) => {
        const next = () => {
          if (handlers.get(methodType)?.options?.[currentMiddlewareIndex])
            handlers.get(methodType)?.options?.[currentMiddlewareIndex]?.(req, res, next);
          else handlers.get(methodType)?.handler({ req, res });
          currentMiddlewareIndex++;
        };

        next();
      };

      const methodLowerCase = req.method.toLowerCase() as MethodTypes;
      const isASpecificMethod = handlers.has(methodLowerCase);
      const isAllMethod = handlers.has('all') && !isASpecificMethod;
      if (isASpecificMethod || isAllMethod) runMiddlewares(isASpecificMethod ? methodLowerCase : 'all', req, res);
      else handler404({ req, res });
    });
  },
  parseRoute(_, __, partOfPath, urlParamType) {
    if (urlParamType) return `:${partOfPath}`;
    else return partOfPath;
  },
  // eslint-disable-next-line ts/require-await
  load404: async (server, handler) => {
    const initializedServer = servers.get(server.serverName)?.server;
    if (initializedServer) {
      initializedServer.use((req, res) => {
        const serverRequestAndResponseData = {
          req,
          res
        };
        handler(serverRequestAndResponseData);
      });
    }
  }
});
