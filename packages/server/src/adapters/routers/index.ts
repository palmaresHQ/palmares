import type { BaseRouter } from '../../router/routers';
import type { MethodTypes, RouterOptionsType } from '../../router/types';
import type ServerAdapter from '../index';
import type ServerRequestAdapter from '../requests';
import type ServerResponseAdapter from '../response';
import type ServerlessAdapter from '../serverless';

/**
 * Adapter used for translating Palmares router to the framework of choice router.
 *
 * Functional approach to creating a server adapter instead of the default class/inheritance approach.
 */
export function serverRouterAdapter<
  TParseRouteFunction extends ServerRouterAdapter['parseRoute'],
  TParseHandlerFunction extends ServerRouterAdapter['parseHandler'],
  TParseHandlersFunction extends ServerRouterAdapter['parseHandlers'],
  TLoad404Function extends ServerRouterAdapter['load404']
>(args: {
  /**
   * Used for parsing each part of the route, instead of parsing the whole route all at once, the framework itself will
   * call this method for each part of the route.
   *
   * n this example we are parsing the route and following Express's route syntax, like /users/:id, /users/:id/posts,
   * /users/:id/posts/:postId, etc. So each url param will contain
   * a colon before the name of the param.
   *
   * @example
   * ```ts
   * parseRoute(server, partOfPath, urlParamType) {
   *   if (urlParamType) return ':${partOfPath}`;
   *   else return partOfPath;
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _partOfPath - The part of the path to be parsed.
   * @param _urlParamType - If the part of the path is a url param, this will be true, otherwise it will be false.
   *
   * @returns The parsed part of the path.
   */
  parseRoute: TParseRouteFunction;
  /**
   * This method is used for loading a 405 handler, this will only be called if no handler is found for the requested method.
   *
   * IMPORTANT: If you define a route handler OUTSIDE of palmares and we do not find the route, this will still be called, because this is defined by your framework of choice.
   *
   * @example
   * ```ts
   * load404(server, handler) {
   *   const initializedServer = servers.get(server.serverName)?.server;
   *   if (initializedServer) {
   *      initializedServer.use((req, res) => {
   *        const serverRequestAndResponseData = {
   *          req,
   *          res,
   *        };
   *        handler(serverRequestAndResponseData);
   *      });
   *   }
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _handler - The handler is a simple callback function that receives a single parameter as argument. Whatever you pass on this parameter can later be retrieved inside of
   * {@link ServerResponseAdapter} and {@link ServerRequestAdapter} methods.
   */
  load404: TLoad404Function;
  /**
   * Usually {@link parseHandlers()} is preferred, but if your framework supports all methods from the {@link MethodTypes} enum, you can use this method instead.
   * This method is used to parse one handler at a time.
   *
   * IMPORTANT: Don't forget to handle the `all` method, so it can be used to accept all methods.
   *
   * app.[method]()
   * @example
   * ```ts
   * parseHandler(server, path, method, handler, queryParams) {
   *   const initializedServer = servers.get(server.serverName)?.server;
   *   if (initializedServer) {
   *     initializedServer[method](path, (req: Request, res: Response) => {
   *       const serverRequestAndResponseData = {
   *         req,
   *         res,
   *       };
   *       handler(serverRequestAndResponseData);
   *     });
   *   }
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _path - The retrieved by calling {@link parseRoute()} method.
   * @param _method - The method to be used.
   * @param _handler - The handler is a simple callback function that receives a single parameter as argument. Whatever you pass on this parameter can later be retrieved inside of
   * {@link ServerResponseAdapter} and {@link ServerRequestAdapter} methods. What you return on {@link ServerResponseAdapter.redirect} or {@link ServerResponseAdapter.send} will be
   * the return value of this method.
   * @param _queryParams - The query params so you can parse it and validate as you wish.
   */
  parseHandler?: TParseHandlerFunction;
  /**
   * Use this method if you want to parse all handlers at once. Parse all handlers at once is ofter useful if your framework doesn't support the same methods as us. With this
   * method you can loop through each handler and parse it or you can listen to all methods and parse them during the request/response lifecycle.
   *
   * Important: if this method is defined, {@link parseHandler()} will be ignored.
   *
   * @example
   * ```ts
   * parseHandlers(server, path, handlers, _, handler404) {
   *    const initializedServer = servers.get(server.serverName)?.server;
   *    if (initializedServer) {
   *      const optionsHandler = handlers.get('options')?.handler;
   *      const headHandler = handlers.get('head')?.handler;
   *      const deleteHandler = handlers.get('delete')?.handler;
   *      const getHandler = handlers.get('get')?.handler;
   *      const postHandler = handlers.get('post')?.handler;
   *      const putHandler = handlers.get('put')?.handler;
   *      const patchHandler = handlers.get('patch')?.handler;
   *      const allHandler = handlers.get('all')?.handler;
   *
   *      // This will initialize the server routes.
   *      initializedServer.all(path, (req: Request, res: Response) => {
   *        const serverRequestAndResponseData = {
   *          req,
   *          res,
   *        };
   *        if (optionsHandler && req.method === 'OPTIONS') {
   *          optionsHandler(serverRequestAndResponseData);
   *          return;
   *        } else if (headHandler && req.method === 'HEAD') {
   *          headHandler(serverRequestAndResponseData);
   *          return;
   *        } else if (deleteHandler && req.method === 'DELETE') {
   *          deleteHandler(serverRequestAndResponseData);
   *          return;
   *        } else if (getHandler && req.method === 'GET') {
   *          getHandler(serverRequestAndResponseData);
   *          return;
   *        } else if (postHandler && req.method === 'POST') {
   *          postHandler(serverRequestAndResponseData);
   *          return;
   *        } else if (putHandler && req.method === 'PUT') {
   *          putHandler(serverRequestAndResponseData);
   *          return;
   *        } else if (patchHandler && req.method === 'PATCH') {
   *          patchHandler(serverRequestAndResponseData);
   *          return;
   *        } else if (allHandler) {
   *          allHandler(serverRequestAndResponseData);
   *          return;
   *        } else handler404(serverRequestAndResponseData);
   *      });
   *    }
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _path - The retrieved by calling {@link parseRoute()} method.
   * @param _methodsAndHandlers - A Map instance where the method is the key and the handler is the value. The handler is a simple
   * callback function that receives a single parameter as argument. Whatever you pass on this parameter can later be retrieved inside of {@link ServerResponseAdapter}
   * and {@link ServerRequestAdapter} methods. What you return on {@link ServerResponseAdapter.redirect} or {@link ServerResponseAdapter.send} will be
   * the return value of the handlers callback.
   * @param _queryParams - The query params so you can parse it and validate as you wish.
   * @param _404Handler - The 404 handler.
   */
  parseHandlers?: TParseHandlersFunction;
}) {
  class CustomServerRouterAdapter extends ServerRouterAdapter {
    parseRoute = args.parseRoute;
    parseHandler = args.parseHandler as TParseHandlerFunction;
    parseHandlers = args.parseHandlers as TParseHandlersFunction;
    load404 = args.load404;
  }

  return CustomServerRouterAdapter as {
    new (): ServerRouterAdapter & {
      parseRoute: TParseRouteFunction;
      parseHandler: TParseHandlerFunction;
      parseHandlers: TParseHandlersFunction;
      load404: TLoad404Function;
    };
  };
}

/**
 * Adapter used for translating palmares router to the framework of choice router.
 */
export default class ServerRouterAdapter {
  /**
   * This method is used for loading a 405 handler, this will only be called if no handler is found for the requested method.
   *
   * IMPORTANT: If you define a route handler OUTSIDE of palmares and we do not find the route, this will still be called, because this is defined by your framework of choice.
   *
   * @example
   * ```ts
   * load404(server, handler) {
   *   const initializedServer = servers.get(server.serverName)?.server;
   *   if (initializedServer) {
   *      initializedServer.use((req, res) => {
   *        const serverRequestAndResponseData = {
   *          req,
   *          res,
   *        };
   *        handler(serverRequestAndResponseData);
   *      });
   *   }
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _handler - The handler is a simple callback function that receives a single parameter as argument. Whatever you pass on this parameter can later be retrieved inside of
   * {@link ServerResponseAdapter} and {@link ServerRequestAdapter} methods.
   */
  // eslint-disable-next-line ts/require-await
  async load404(
    _server: ServerAdapter,
    _handler: (serverRequestAndResponseData: any) => ReturnType<ServerResponseAdapter['send']>
  ): Promise<void> {
    return undefined;
  }

  /**
   * Used for parsing each part of the route, instead of parsing the whole route all at once, the framework itself will call this method for each part of the route.
   *
   * n this example we are parsing the route and following Express's route syntax, like /users/:id, /users/:id/posts, /users/:id/posts/:postId, etc. So each url param will contain
   * a colon before the name of the param.
   *
   * @example
   * ```ts
   * parseRoute(server, partOfPath, urlParamType) {
   *   if (urlParamType) return ':${partOfPath}`;
   *   else return partOfPath;
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _partOfPath - The part of the path to be parsed.
   * @param _urlParamType - If the part of the path is a url param, this will be true, otherwise it will be false.
   *
   * @returns The parsed part of the path.
   */
  parseRoute(
    _server: ServerAdapter,
    _partOfPath: string,
    _urlParamType?: Parameters<BaseRouter['__urlParamsAndPath']['params']['set']>[1]
  ): string | undefined {
    return undefined;
  }

  /**
   * Usually {@link parseHandlers()} is preferred, but if your framework supports all methods from the {@link MethodTypes} enum, you can use this method instead.
   * This method is used to parse one handler at a time.
   *
   * IMPORTANT: Don't forget to handle the `all` method, so it can be used to accept all methods.
   *
   * @example
   * ```ts
   * parseHandler(server, path, method, handler, queryParams) {
   *   const initializedServer = servers.get(server.serverName)?.server;
   *   if (initializedServer) {
   *     initializedServer[method](path, (req: Request, res: Response) => {
   *       const serverRequestAndResponseData = {
   *         req,
   *         res,
   *       };
   *       handler(serverRequestAndResponseData);
   *     });
   *   }
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _path - The retrieved by calling {@link parseRoute()} method.
   * @param _method - The method to be used.
   * @param _handler - The handler is a simple callback function that receives a single parameter as argument. Whatever you pass on this parameter can later be retrieved inside of
   * {@link ServerResponseAdapter} and {@link ServerRequestAdapter} methods. What you return on {@link ServerResponseAdapter.redirect} or {@link ServerResponseAdapter.send} will be
   * the return value of this method.
   * @param _queryParams - The query params so you can parse it and validate as you wish.
   */
  parseHandler(
    _server: ServerAdapter,
    _path: string,
    _method: MethodTypes | 'all',
    _handler: (serverRequestAndResponseData: any) => ReturnType<ServerResponseAdapter['send']>,
    _options: RouterOptionsType['customRouterOptions'],
    _queryParams: BaseRouter['__queryParamsAndPath']['params']
  ) {
    return undefined;
  }

  parseHandlers?(
    _server: ServerAdapter,
    _path: string,
    _methodsAndHandlers: Map<
      MethodTypes | 'all',
      {
        handler: (serverRequestAndResponseData: any) => ReturnType<ServerResponseAdapter['send']>;
        options?: RouterOptionsType['customRouterOptions'];
      }
    >,
    _queryParams: BaseRouter['__queryParamsAndPath']['params'],
    _404Handler: (serverRequestAndResponseData: any) => ReturnType<ServerResponseAdapter['send']>
  ) {
    return undefined;
  }
}
