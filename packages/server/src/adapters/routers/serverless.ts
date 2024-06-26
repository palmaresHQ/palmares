import ServerAdapter from '.';
import { BaseRouter } from '../../router/routers';
import { MethodTypes, RouterOptionsType } from '../../router/types';
import ServerResponseAdapter from '../response';

import type ServerlessAdapter from '../serverless';
import type ServerRequestAdapter from '../requests';

type HandlerForServerless = {
  writeFile: (args: {
    pathOfHandlerFile: string[],
    /** This is the name of your current package as on package.json the import like: `import ${name} from ${projectName}` */
    projectName: string,
    adapter: {
      /** Is it a default export? like `import ${name} from ${projectName}` or not, like: `import { ${name} } from ${projectName}` */
      isDefaultImport: boolean,
      /** This is the name on the import like: `import ${name} from ${projectName}` */
      name: string
    },
  }) => Promise<void>,
  appendBody: (args: {
    parameters: {
      name: string
      type: string
    }[] | string[];
    customExport?: string;
    isCJSModule?: boolean;
    isDefaultExport?: boolean;
    functionName: string;
    adapter: string
    isSpecificRoute?: boolean;
    isSpecificMethod?: boolean;
    requestAndResponseData: string
    getMethodFunctionBody: string
    getRouteFunctionBody: string
  }) => Promise<void>
};

/**
 * Adapter used for translating Palmares router to the framework of choice router.
 *
 * Functional approach to creating a server adapter instead of the default class/inheritance approach.
 */
export function serverlessRouterAdapter<
  TParseRouteFunction extends ServerlessRouterAdapter['parseRoute'],
  TParseHandlerFunction extends ServerlessRouterAdapter['parseHandler'],
  TParseHandlersFunction extends ServerlessRouterAdapter['parseHandlers'],
  TLoad404Function extends ServerlessRouterAdapter['load404'],
>(args: {
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
  class CustomServerRouterAdapter extends ServerlessRouterAdapter {
    parseRoute = args.parseRoute as TParseRouteFunction;
    parseHandler = args.parseHandler as TParseHandlerFunction;
    parseHandlers = args.parseHandlers as TParseHandlersFunction;
    load404 = args.load404 as TLoad404Function;
  }

  return CustomServerRouterAdapter as {
    new (): ServerlessRouterAdapter & {
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
export default class ServerlessRouterAdapter {
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
  async load404(
    _server: ServerlessAdapter,
    _handler: (serverRequestAndResponseData: any) => ReturnType<ServerResponseAdapter['send']>
  ): Promise<void> {
    return undefined;
  }

  /**
   * This method is used for loading a 500 handler, this handler will be called when an error occurs during the request/response lifecycle.
   *
   * IMPORTANT: If you define a route handler OUTSIDE of palmares and an error occurs in the handler, this method will not be called.
   *
   * @example
   * ```ts
   * load500(server, handler) {
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
  async load500(
    _server: ServerlessAdapter,
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
    _server: ServerlessAdapter,
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
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _path - The retrieved by calling {@link parseRoute()} method.
   * @param _method - The method to be used.
   * @param _queryParams - The query params so you can parse it and validate as you wish.
   */
  async parseHandler(
    _server: ServerlessAdapter,
    _path: string,
    _method: MethodTypes | 'all',
    _handler: HandlerForServerless,
    _options: RouterOptionsType['customRouterOptions'],
    _queryParams: BaseRouter['__queryParamsAndPath']['params']
  ) {
    return undefined;
  }

  /**
   * Use this method if you want to parse all handlers at once. Parse all handlers at once is ofter useful if your framework doesn't support the same methods as us. With this
   * method you can loop through each handler and parse it or you can listen to all methods and parse them during the request/response lifecycle.
   *
   * Important: if this method is defined, {@link parseHandler()} will be ignored.
   *
   * @param _server - The {@link ServerlessAdapter} instance.
   * @param _path - The retrieved by calling {@link parseRoute()} method.
   * @param _methodsAndHandlers - A Map instance where the method is the key and the handler is the value. The handler is a simple
   * callback function that receives a single parameter as argument. Whatever you pass on this parameter can later be retrieved inside of {@link ServerResponseAdapter}
   * and {@link ServerRequestAdapter} methods. What you return on {@link ServerResponseAdapter.redirect} or {@link ServerResponseAdapter.send} will be
   * the return value of the handler callback.
   * @param _queryParams - The query params so you can parse it and validate as you wish.
   * @param _404Handler - The 404 handler.
   */
  async parseHandlers(
    _server: ServerlessAdapter,
    _rootFileSystemPath: string,
    _path: string,
    _methodsAndHandlers: Map<
      MethodTypes | 'all',
      {
        handler: HandlerForServerless;
        options?: RouterOptionsType['customRouterOptions'];
      }
    >,
    _queryParams: BaseRouter['__queryParamsAndPath']['params'],
    _404Handler: (serverRequestAndResponseData: any) => ReturnType<ServerResponseAdapter['send']>
  ) {
    return undefined;
  }
}
