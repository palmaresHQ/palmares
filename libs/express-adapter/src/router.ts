import { serverRouterAdapter } from '@palmares/server';

import { servers } from './server';

import type { Request, Response } from 'express';

/**
 * This will automatically initialize all the routes of the server on the express server.
 */
export default serverRouterAdapter({
  /**
   * Handler is the function to call when a request is made to the server, by default Palmares
   * gives us the option to send a data during the request/response lifecycle, we just send req and res.
   *
   * We can use this data to send a response, parse the request and do pretty much anything.
   */
  parseHandlers(server, path, handlers, _, handler404) {
    const initializedServer = servers.get(server.serverName)?.server;

    if (initializedServer) {
      const optionsHandler = handlers.get('options')?.handler;
      const headHandler = handlers.get('head')?.handler;
      const deleteHandler = handlers.get('delete')?.handler;
      const getHandler = handlers.get('get')?.handler;
      const postHandler = handlers.get('post')?.handler;
      const putHandler = handlers.get('put')?.handler;
      const patchHandler = handlers.get('patch')?.handler;
      const allHandler = handlers.get('all')?.handler;

      // This will initialize the server routes.
      initializedServer.all(path, (req: Request, res: Response) => {
        const serverRequestAndResponseData = {
          req,
          res,
        };
        if (optionsHandler && req.method === 'OPTIONS') {
          optionsHandler(serverRequestAndResponseData);
          return;
        } else if (headHandler && req.method === 'HEAD') {
          headHandler(serverRequestAndResponseData);
          return;
        } else if (deleteHandler && req.method === 'DELETE') {
          deleteHandler(serverRequestAndResponseData);
          return;
        } else if (getHandler && req.method === 'GET') {
          getHandler(serverRequestAndResponseData);
          return;
        } else if (postHandler && req.method === 'POST') {
          postHandler(serverRequestAndResponseData);
          return;
        } else if (putHandler && req.method === 'PUT') {
          putHandler(serverRequestAndResponseData);
          return;
        } else if (patchHandler && req.method === 'PATCH') {
          patchHandler(serverRequestAndResponseData);
          return;
        } else if (allHandler) {
          allHandler(serverRequestAndResponseData);
          return;
        } else handler404(serverRequestAndResponseData);
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
});
