import { std } from '@palmares/core';

import {
  HandlerOrHandlersShouldBeDefinedOnRouterAdapterError,
  RedirectionStatusCodesMustHaveALocationHeaderError,
  ResponseNotReturnedFromResponseOnMiddlewareError
} from './exceptions';
import { getServerInstances } from '../config';
import {
  DEFAULT_NOT_FOUND_STATUS_TEXT_MESSAGE,
  DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY,
  DEFAULT_SERVER_ERROR_RESPONSE,
  DEFAULT_STATUS_CODE_BY_METHOD
} from '../defaults';
import { errorCaptureHandler } from '../handlers';
import { serverLogger } from '../logging';
import { Request } from '../request';
import { Response } from '../response';
import { HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR, isRedirect } from '../response/status';
import { AsyncGeneratorFunction, GeneratorFunction } from '../response/utils';
import { path } from '../router';
import { setServerAdapterInstance } from '../utils/store-server';

import type { ServerAdapter } from '../adapters';
import type { ServerRequestAdapter } from '../adapters/requests';
import type { ServerResponseAdapter } from '../adapters/response';
import type { ServerRouterAdapter } from '../adapters/routers';
import type { HandlerForServerless } from '../adapters/routers/serverless';
import type { ServerlessAdapter } from '../adapters/serverless';
import type { ServerDomain } from '../domain/types';
import type { Middleware } from '../middleware';
import type { BaseRouter, MethodsRouter } from '../router/routers';
import type { HandlerType, MethodTypes, RouterOptionsType } from '../router/types';
import type { AllServerSettingsType } from '../types';

export async function loadServer(args: {
  settings: AllServerSettingsType;
  commandLineArgs: {
    keywordArgs: {
      port?: number;
    };
    positionalArgs: object;
  };
  domains: ServerDomain[];
}) {
  const serverEntries = Object.entries(args.settings.servers);
  for (const [serverName, serverSettings] of serverEntries) {
    const serverInstances = getServerInstances();
    const serverWasNotInitialized = !serverInstances.has(serverName);
    if (serverWasNotInitialized) {
      const newServerInstance = new serverSettings.server(
        serverName,
        args.settings,
        args.settings.servers[serverName],
        args.domains
      );
      const loadedServer = await newServerInstance.load(serverName, args.domains, serverSettings);

      if ((newServerInstance as ServerAdapter).$$type === '$PServerAdapter')
        setServerAdapterInstance(serverSettings.server as typeof ServerAdapter, serverName, loadedServer);

      serverInstances.set(serverName, {
        server: newServerInstance,
        settings: serverSettings,
        loadedServer
      });
      await initializeRouters(loadedServer, args.domains, serverSettings, args.settings, newServerInstance);
    }
  }
}
/**
 * By default we don't know how to handle the routes by itself. Pretty much MethodsRouter does everything
 * that we need here during runtime. So we pretty much need to extract this data "for free".
 */
export async function getRootRouterCompletePaths(
  domains: ServerDomain[],
  settings: AllServerSettingsType['servers'][string],
  isDebugModeEnabled: boolean = true
) {
  const extractedRouterInterceptors: NonNullable<
    Awaited<NonNullable<(typeof domains)[number]>['routerInterceptor']>
  >[] = [];
  const extractedRoutes: Promise<
    ReturnType<NonNullable<Awaited<NonNullable<(typeof domains)[number]>['getRoutes']>>>
  >[] = [];
  for (const domain of domains) {
    if (domain.getRoutes)
      extractedRoutes.push(
        Promise.resolve(domain.getRoutes()).then((route) => {
          const routeWithProtected = route as MethodsRouter & { __domain: MethodsRouter['__domain'] };
          routeWithProtected.__domain = domain;
          return routeWithProtected;
        })
      );
    if (domain.routerInterceptor) extractedRouterInterceptors.push(domain.routerInterceptor);
  }

  const allRoutes = await Promise.all(extractedRoutes);
  const allRoutesWithOrWithoutErrorHandler = isDebugModeEnabled
    ? allRoutes.concat([errorCaptureHandler() as any])
    : allRoutes;

  const rootRouter = path(settings.prefix ? settings.prefix : '').nested(allRoutesWithOrWithoutErrorHandler);
  const rootRouterCompletePaths = (rootRouter as any).__completePaths as BaseRouter['__completePaths'];
  if (extractedRouterInterceptors.length > 0)
    await Promise.all(
      extractedRouterInterceptors.map(async (routerInterceptor) => await routerInterceptor(rootRouterCompletePaths))
    );
  return (rootRouter as any).__completePaths as BaseRouter['__completePaths'];
}

async function* wrappedMiddlewareRequests(middlewares: Middleware[], request: Request<any, any>) {
  // We need to use this, because if we were creating another array we would be consuming an uneccesary
  // amount of memory.
  let middlewareIndex = 0;
  for (const middleware of middlewares) {
    middlewareIndex++;
    if (middleware.request) {
      const responseOrRequest = await middleware.request(request);
      // eslint-disable-next-line ts/no-unnecessary-condition
      if ((responseOrRequest as Response)?.['$$type'] === '$PResponse')
        yield [middlewareIndex, responseOrRequest as Response] as const;
      else {
        request = responseOrRequest as Request<any, any>;
        yield [middlewareIndex, responseOrRequest] as const;
      }
    }
  }
}

async function* wrappedMiddlewareResponses(
  middlewares: Middleware[],
  response: Response<any, any>,
  middlewareOnionIndex: number
) {
  for (let i = middlewareOnionIndex; i >= 0; i--) {
    const middleware = middlewares[i];
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (!middleware) continue;
    if (middleware.response) {
      response = await middleware.response(response);
      yield response;
    }
  }
}

/**
 * This will pretty much wrap call the handler500.request and return the response if it returns a response.
 * Otherwise it will throw an error.
 *
 * @param request - The new response with the error.
 * @param error - The error that was thrown or a response if a ResponseError was thrown.
 * @param handler500 - The handler500 that was set on the settings.
 */
async function appendErrorToResponseAndReturnResponseOrThrow(
  response: Response<any, any>,
  error: Error | Response<any, any>,
  handler500?: AllServerSettingsType['servers'][string]['handler500']
) {
  // eslint-disable-next-line ts/no-unnecessary-condition
  if ((error as Response)?.['$$type'] === '$PResponse') return error as Response;
  else if (!handler500) throw error;

  response = await Promise.resolve(handler500(response));
  // eslint-disable-next-line ts/no-unnecessary-condition
  if ((response as Response)?.['$$type'] === '$PResponse') return response as Response;
  else throw error;
}

/**
 * Used for appending multiple private methods and values to the Request object. Private methods and values
 * are prefixed with __. Remember that they only exist on typescript
 * not on runtime, so there is no issue when assigning a value to them. Also, we want to guarantee a nice
 * user experience so we should keep them private so that intellisense doesn't catch it.
 *
 * IMPORTANT: Don't expect any maintainer to know about those private methods, so if you need to use them in
 * a translation, flat them out! In other words: send them directly, don't send the request object.
 *
 * @param request - The request that was created by the server adapter.
 * @param serverAdapter - The server adapter that was selected to handle the server creation.
 */
function appendTranslatorToRequest(
  request: Request<any, any>,
  serverAdapter: ServerAdapter | ServerlessAdapter,
  serverInstance: any,
  serverRequestAdapter: ServerRequestAdapter,
  serverRequestAndResponseData: any,
  queryParams: BaseRouter['__queryParamsAndPath']['params'],
  urlParams: BaseRouter['__urlParamsAndPath']['params'],
  validation: AllServerSettingsType['servers'][string]['validation'],
  options: RouterOptionsType | undefined
) {
  const requestWithoutPrivateMethods = request as unknown as Omit<
    Request<any, any>,
    | '__requestAdapter'
    | '__serverInstance'
    | '__serverRequestAndResponseData'
    | '__queryParams'
    | '__urlParams'
    | '__serverAdapter'
    | '__responses'
    | '__validation'
  > & {
    __serverAdapter: ServerAdapter | ServerlessAdapter;
    __serverInstance: any;
    __requestAdapter: ServerRequestAdapter;
    __serverRequestAndResponseData: any;
    __queryParams: BaseRouter['__queryParamsAndPath']['params'];
    __urlParams: BaseRouter['__urlParamsAndPath']['params'];
    __responses: Record<string, (...args: any[]) => Response<any, any> | undefined>;
    __validation: AllServerSettingsType['servers'][string]['validation'];
  };
  if (options?.responses)
    requestWithoutPrivateMethods.__responses = Object.freeze({
      value: options.responses as any
    });
  requestWithoutPrivateMethods.__validation = validation;
  requestWithoutPrivateMethods.__serverAdapter = serverAdapter;
  requestWithoutPrivateMethods.__serverRequestAndResponseData = serverRequestAndResponseData;
  requestWithoutPrivateMethods.__requestAdapter = serverRequestAdapter;
  requestWithoutPrivateMethods.__queryParams = queryParams;
  requestWithoutPrivateMethods.__urlParams = urlParams;
  requestWithoutPrivateMethods.__serverInstance = serverInstance;
  return request;
}

function appendTranslatorToResponse(
  response: Response<any, any>,
  serverAdapter: ServerAdapter | ServerlessAdapter,
  customServerInstance: any,
  serverResponseAdapter: ServerResponseAdapter,
  serverRequestAndResponseData: any,
  options: RouterOptionsType | undefined
) {
  const responseWithoutPrivateMethods = response as unknown as Omit<
    Response<any, any>,
    '__responseAdapter' | '__serverRequestAndResponseData' | '__serverAdapter' | 'responses'
  > & {
    responses: Record<string, (...args: any[]) => Response<any, any>>;
    __serverAdapter: ServerAdapter | ServerlessAdapter;
    __serverInstance: any;
    __responseAdapter: ServerResponseAdapter;
    __serverRequestAndResponseData: any;
  };
  if (options?.responses)
    responseWithoutPrivateMethods.responses = Object.freeze({
      value: options.responses as any
    });
  responseWithoutPrivateMethods.__serverAdapter = serverAdapter;
  responseWithoutPrivateMethods.__serverInstance = customServerInstance;
  responseWithoutPrivateMethods.__serverRequestAndResponseData = serverRequestAndResponseData;
  responseWithoutPrivateMethods.__responseAdapter = serverResponseAdapter;
  return response;
}

/**
 * Responsible for translating the response to something that the selected server can understand. We translate
 * each part needed for the response internally.
 *
 * @param response - The response that was returned from the handler.
 * @param server - The server adapter that was selected.
 * @param serverRequestAndResponseData - The data that was sent by the server during the request/response lifecycle.
 */
async function translateResponseToServerResponse(
  response: Response,
  method: MethodTypes,
  server: ServerAdapter | ServerlessAdapter,
  serverInstance: any,
  serverRequestAndResponseData: any
) {
  // eslint-disable-next-line ts/no-unnecessary-condition
  const responseStatus = response.status || DEFAULT_STATUS_CODE_BY_METHOD(method);
  const isRedirectResponse = isRedirect(responseStatus);
  const isStreamResponse =
    // eslint-disable-next-line ts/no-unnecessary-condition
    (response.body && (response.body as any) instanceof GeneratorFunction) ||
    (response.body as any) instanceof AsyncGeneratorFunction;
  const isFileResponse =
    // eslint-disable-next-line ts/no-unnecessary-condition
    (response.body && (response.body as any) instanceof Blob) ||
    (response.body as any)?.$$type === '$PFileLike' ||
    (response.body as any) instanceof ArrayBuffer;
  // eslint-disable-next-line ts/no-unnecessary-condition
  if (isRedirectResponse && !response.headers?.[DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY])
    throw new RedirectionStatusCodesMustHaveALocationHeaderError();
  if (isRedirectResponse)
    return server.response.redirect(
      server,
      serverInstance,
      serverRequestAndResponseData,
      responseStatus,
      response.headers,
      (response.headers as any)[DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY] as string
    );
  if (isStreamResponse)
    return server.response.stream(
      server,
      serverInstance,
      serverRequestAndResponseData,
      responseStatus,
      response.headers as any,
      (response.body as unknown as () => AsyncGenerator<any, any, any> | Generator<any, any, any>)(),
      (response.body as any) instanceof AsyncGeneratorFunction
    );
  if (isFileResponse)
    return server.response.sendFile(
      server,
      serverInstance,
      serverRequestAndResponseData,
      responseStatus,
      response.headers as any,
      response.body as any
    );
  return server.response.send(
    server,
    serverInstance,
    serverRequestAndResponseData,
    responseStatus,
    response.headers as any,
    response.body as any
  );
}

/**
 * There are two ways of translating the path, either use {@link ServerRouterAdapter.parseHandler} which will
 * parse each handler (method) at a time. Or use {@link ServerRouterAdapter.parseHandlers} which will parse
 * all of the handlers at once.
 *
 * Since they are pretty similar and they both need to translate the path we use this factory function to extract
 * this common functionality on both of them.
 *
 * @param serverAdapter - The server adapter that was selected. We will call the {@link ServerRouterAdapter.parseRoute}
 * method on it.
 * @param customServerAdapter - The custom server instance returned from {@link ServerAdapter.load}.
 *
 * @returns - A function that can be used to translate the path.
 */
function translatePathFactory(serverAdapter: ServerAdapter | ServerlessAdapter, customServerInstance: any) {
  const translatedPathsByRawPath = new Map<string, string>();

  return (
    path: string,
    partsOfPath: Exclude<
      NonNullable<Awaited<ReturnType<ReturnType<typeof getAllHandlers>['next']>>>['value'],
      void
    >['partsOfPath'],
    urlParams: Exclude<
      NonNullable<Awaited<ReturnType<ReturnType<typeof getAllHandlers>['next']>>>['value'],
      void
    >['urlParams']
  ) => {
    let fullPath = translatedPathsByRawPath.get(path) || '';
    // Translate only once, cache the rest.
    if (fullPath === '') {
      for (const path of partsOfPath) {
        const urlParamType = path.isUrlParam ? urlParams.get(path.part) : undefined;
        let translatedPartOfPath: string | undefined = undefined;
        // eslint-disable-next-line ts/no-unnecessary-condition
        if (serverAdapter?.$$type === '$PServerlessAdapter')
          translatedPartOfPath = (serverAdapter as ServerlessAdapter).routers.parseRoute(
            serverAdapter as any,
            path.part,
            urlParamType
          );
        else
          translatedPartOfPath = (serverAdapter as ServerAdapter).routers.parseRoute(
            serverAdapter as any,
            customServerInstance,
            path.part,
            urlParamType
          );
        if (translatedPartOfPath === undefined) continue;
        fullPath += '/' + translatedPartOfPath;
      }
    }
    return fullPath;
  };
}

/**
 * Responsible for wrapping the handler and the middlewares into a single function that will be called when a
 * request is made to the server.
 *
 * The server adapter is responsible for passing the data it needs to be able to safely translate the request
 * and response during it's lifecycle.
 *
 * @param method - The method that was extracted from the router.
 * @param middlewares - The middlewares that will be applied to the request.
 * @param queryParams - The query params that were extracted from the router.
 * @param urlParams - The url params that were extracted from the router.
 * @param handler - The handler that will be called when the request is made.
 * @param server - The server adapter that was selected.
 * @param handler500 - The handler500 that was set on the settings so we can handle errors.
 */
function wrapHandlerAndMiddlewares(
  method: MethodTypes,
  middlewares: Middleware[],
  queryParams: BaseRouter['__queryParamsAndPath']['params'],
  urlParams: BaseRouter['__urlParamsAndPath']['params'],
  handler: HandlerType<string, any[]>,
  options: RouterOptionsType | undefined,
  server: ServerAdapter | ServerlessAdapter,
  customServerInstance: any,
  handler500?: AllServerSettingsType['servers'][string]['handler500'],
  validation?: AllServerSettingsType['servers'][string]['validation']
) {
  const wrappedHandler = async (serverRequestAndResponseData: any) => {
    const startTime = new Date().getTime();
    let request = appendTranslatorToRequest(
      new Request(),
      server,
      customServerInstance,
      server.request,
      serverRequestAndResponseData,
      queryParams,
      urlParams,
      validation,
      options
    );

    let response: Response | undefined = undefined;
    let wasErrorAlreadyHandledInRequestLifecycle = false;
    // This is the index of the middleware that we are currently handling for the request. So on the
    // response we start from the last to the first.
    let middlewareOnionIndex = 0;

    try {
      // Go through all of the middlewares and apply them to the request or modify the request.
      for await (const [middlewareIndex, responseOrRequest] of wrappedMiddlewareRequests(middlewares, request)) {
        middlewareOnionIndex = middlewareIndex;
        // eslint-disable-next-line ts/no-unnecessary-condition
        const isResponse = (responseOrRequest as Response)?.['$$type'] === '$PResponse';
        if (isResponse)
          response = appendTranslatorToResponse(
            responseOrRequest as Response<any, any>,
            server,
            customServerInstance,
            server.response,
            serverRequestAndResponseData,
            options
          );
        else
          request = appendTranslatorToRequest(
            responseOrRequest as Request<any, any>,
            server,
            customServerInstance,
            server.request,
            serverRequestAndResponseData,
            queryParams,
            urlParams,
            validation,
            options
          );
      }
      // If the response is set, then we can just return it from the handler.
      const responseNotSet = response === undefined;
      if (responseNotSet) {
        const handlerResponse = appendTranslatorToResponse(
          await Promise.resolve(handler(request)),
          server,
          customServerInstance,
          server.response,
          serverRequestAndResponseData,
          options
        );
        // eslint-disable-next-line ts/no-unnecessary-condition
        if (handlerResponse) response = handlerResponse;
      }
    } catch (error) {
      // eslint-disable-next-line ts/no-unnecessary-condition
      const isResponseError = (error as Response)?.['$$type'] === '$PResponse';
      const errorAsError = error as Error;
      let errorResponse: Response<any, any> = isResponseError
        ? (error as Response)
        : server.settings.debug === true
          ? DEFAULT_SERVER_ERROR_RESPONSE(errorAsError, server.allSettings, server.domains)
          : new Response(undefined, { status: HTTP_500_INTERNAL_SERVER_ERROR });
      wasErrorAlreadyHandledInRequestLifecycle = true;

      errorResponse = appendTranslatorToResponse(
        errorResponse,
        server,
        customServerInstance,
        server.response,
        serverRequestAndResponseData,
        options
      );

      errorResponse = isResponseError
        ? errorResponse
        : await appendErrorToResponseAndReturnResponseOrThrow(errorResponse, errorAsError, handler500);
      response = appendTranslatorToResponse(
        errorResponse,
        server,
        customServerInstance,
        server.response,
        serverRequestAndResponseData,
        options
      );
    }

    try {
      if (response) {
        for await (const modifiedResponse of wrappedMiddlewareResponses(middlewares, response, middlewareOnionIndex)) {
          // eslint-disable-next-line ts/no-unnecessary-condition
          const isResponse = (modifiedResponse as Response)?.['$$type'] === '$PResponse';
          if (isResponse)
            response = appendTranslatorToResponse(
              modifiedResponse,
              server,
              customServerInstance,
              server.response,
              serverRequestAndResponseData,
              options
            );
          else throw new ResponseNotReturnedFromResponseOnMiddlewareError();
        }
        serverLogger.logMessage('REQUEST_RECEIVED', {
          method: request.method,
          url: request.url,
          timePassed: new Date().getTime() - startTime
        });
        return translateResponseToServerResponse(
          response,
          method,
          server,
          customServerInstance,
          serverRequestAndResponseData
        );
      }
    } catch (error) {
      if (wasErrorAlreadyHandledInRequestLifecycle === false) {
        // eslint-disable-next-line ts/no-unnecessary-condition
        const isResponseError = (error as Response)?.['$$type'] === '$PResponse';
        let errorResponse: Response<any, any> = isResponseError
          ? (error as Response)
          : server.settings.debug === true
            ? DEFAULT_SERVER_ERROR_RESPONSE(error as Error, server.allSettings, server.domains)
            : new Response(undefined, { status: HTTP_500_INTERNAL_SERVER_ERROR });

        errorResponse = appendTranslatorToResponse(
          errorResponse,
          server,
          customServerInstance,
          server.response,
          serverRequestAndResponseData,
          options
        );

        // It it's a ResponseError then we don't need to call the handler500, because it was already handled.
        errorResponse = isResponseError
          ? errorResponse
          : await appendErrorToResponseAndReturnResponseOrThrow(errorResponse, error as Error, handler500);
        response = appendTranslatorToResponse(
          errorResponse,
          server,
          customServerInstance,
          server.response,
          serverRequestAndResponseData,
          options
        );
      }
      serverLogger.logMessage('REQUEST_RECEIVED', {
        method: request.method,
        url: request.url,
        timePassed: new Date().getTime() - startTime
      });
      if (response)
        return translateResponseToServerResponse(
          response,
          method,
          server,
          customServerInstance,
          serverRequestAndResponseData
        );
      else throw error;
    }
  };
  return wrappedHandler.bind(wrappedHandler);
}

function generateServerlessHandler(
  settings: AllServerSettingsType['servers'][string],
  allSettings: AllServerSettingsType,
  serverName: string,
  domainName: string,
  method: MethodTypes | 'all',
  path: string,
  pathOfHandler: { pathOfHandler: string }
): HandlerForServerless {
  const shouldBeTypeAnnotated = allSettings.settingsLocation.endsWith('.ts');
  const extension = allSettings.settingsLocation.split('.').pop();

  return {
    appendBody: (args) => {
      // eslint-disable-next-line ts/no-unnecessary-condition
      if (pathOfHandler === undefined) throw new Error('You should call writeFile before appendBody');

      serverLogger.logMessage('SERVERLESS_HANDLER_UPDATED', {
        method: method.toUpperCase(),
        path: pathOfHandler.pathOfHandler,
        url: path
      });

      return std.files.appendFile(
        pathOfHandler.pathOfHandler,
        `\nasync function ${args.functionName}` +
          `(${args.parameters
            .map((parameter) => {
              if (
                (shouldBeTypeAnnotated && typeof parameter !== 'object') ||
                typeof (parameter as any)?.type !== 'string'
              )
                throw new Error('The parameter must have a type when generating a serverless handler.');
              if (typeof parameter === 'object') return `${parameter.name}: ${parameter.type}`;
              return parameter;
            })
            .join(', ')}) {\n` +
          `  return Serverless.handleServerless(settings, {\n` +
          `    requestAndResponseData: ${args.requestAndResponseData},\n` +
          `    getRoute: () => ${args.getRouteFunctionBody},\n` +
          `    serverName: '${serverName}',\n` +
          `    adapter: ${args.adapter},\n` +
          `    getMethod: () => ${args.getMethodFunctionBody}${
            args.isSpecificMethod || args.isSpecificRoute ? ',' : ''
          }\n` +
          (args.isSpecificMethod ? `    method: '${method}',\n` : '') +
          (args.isSpecificRoute
            ? `    route: '${path}',\n    domainRoutes: ['${domainName}']\n`
            : `    domainRoutes: []\n`) +
          `  });\n` +
          `}\n` +
          (args.customExport
            ? args.customExport
            : args.isCJSModule
              ? `exports.${args.functionName} = ${args.functionName};`
              : args.isDefaultExport
                ? `export default ${args.functionName};`
                : `export { ${args.functionName} };\n`)
      );
    },
    writeFile: async (args) => {
      args.pathOfHandlerFile[args.pathOfHandlerFile.length - 1] =
        `${args.pathOfHandlerFile[args.pathOfHandlerFile.length - 1]}.${extension}`;

      // The serverless folder location is used to go back to the settings file. So we need to know how many
      // directories we need to go back.
      let numberOfTwoDotsOnServerlessLocation = 0;
      let numberOfDirectoriesToGoBackOnSettingsFromServerlessFolderLocation = 0;
      for (const pathParts of (settings.serverlessFolderLocation || '').split('/')) {
        if (pathParts === '..') numberOfTwoDotsOnServerlessLocation++;
        if (pathParts !== '.' && pathParts !== '..' && pathParts !== '')
          numberOfDirectoriesToGoBackOnSettingsFromServerlessFolderLocation++;
      }

      const basePathGoingBackFromServerlessLocation = await std.files.join(
        allSettings.basePath,
        ...Array.from({ length: numberOfTwoDotsOnServerlessLocation }).map(() => '..')
      );

      const pathWithoutBasePath = allSettings.settingsLocation.replace(basePathGoingBackFromServerlessLocation, '');

      const baseDirectoryOfHandlerFile = settings.serverlessFolderLocation
        ? await std.files.join(
            allSettings.basePath,
            settings.serverlessFolderLocation,
            await std.files.join(...args.pathOfHandlerFile.slice(0, -1))
          )
        : await std.files.join(allSettings.basePath, await std.files.join(...args.pathOfHandlerFile.slice(0, -1)));

      const existsDirectory = await std.files.exists(baseDirectoryOfHandlerFile);
      if (existsDirectory === false) await std.files.makeDirectory(baseDirectoryOfHandlerFile);

      const pathWithFile = await std.files.join(
        baseDirectoryOfHandlerFile,
        args.pathOfHandlerFile[args.pathOfHandlerFile.length - 1]
      );

      pathOfHandler.pathOfHandler = pathWithFile;

      const numberOfDirectoriesToGoBackOnSettings =
        numberOfDirectoriesToGoBackOnSettingsFromServerlessFolderLocation + args.pathOfHandlerFile.length - 1;

      serverLogger.logMessage('SERVERLESS_HANDLER_CREATED', {
        path: pathWithFile,
        url: path
      });
      return std.files.writeFile(
        pathWithFile,
        `import { Serverless } from '@palmares/server';\n` +
          `import { ${args.adapter.name} } from '${args.projectName}';\n` +
          `import settings from '${
            Array.from({ length: numberOfDirectoriesToGoBackOnSettings })
              .map(() => '..')
              .join('/') + pathWithoutBasePath.replace(`.${extension}`, '')
          }';\n`
      );
    }
  };
}

/**
 * This will take care of the routing. It's just used on serverless environments. On serverless you might
 * define a function but the routing is not handled by the serverless. This is a workaround for that. It's
 * not the most efficient way but it does work.
 *
 * We could use a custom server for just using the router, but not all servers support just routing so we
 * prefer to do that way.
 */
function doTheRoutingForServerlessOnly(
  serverAdapter: ServerlessAdapter,
  partsOfPath: BaseRouter['__partsOfPath'],
  urlParams: BaseRouter['__urlParamsAndPath']['params'],
  routeToFilter: string
) {
  // eslint-disable-next-line no-useless-escape
  const regex = new RegExp(
    `^(\\/?)${partsOfPath
      .map((part) => {
        if (part.isUrlParam)
          return `(${urlParams
            .get(part.part)
            ?.regex?.toString()
            .replace(/(\/(\^)?(\()?|(\))?(\$)?\/)/g, '')})`;
        return part.part;
      })
      .join('\\/')}(\\/?)$`
  );
  const groups = routeToFilter.match(regex);
  if (regex.test(routeToFilter) === false) return false;

  // We parse the url params ourselves if that doesn't exist.
  const existingRequestParams = serverAdapter.request.params;
  serverAdapter.request.params = (_server, _customServerInstance, _serverRequestAndResponseData, key) => {
    const result = existingRequestParams?.(_server, _customServerInstance, _serverRequestAndResponseData, key);
    if (result === '' || result === undefined) return groups?.groups?.[key] || '';
    return result;
  };
  return true;
}

/**
 * A generator that will yield all of the routers that were extracted from the domains and the settings.
 * Used for {@link ServerRouterAdapter.parseHandlers} function.
 */
export async function* getAllRouters(
  domains: ServerDomain[],
  settings: AllServerSettingsType['servers'][string],
  allSettings: AllServerSettingsType,
  serverAdapter: ServerAdapter | ServerlessAdapter,
  customServerInstance: any,
  options?: {
    serverless?: {
      generate: boolean;
      use: {
        method: MethodTypes;
        route: string;
      };
    };
  }
) {
  const methodToFilterWhenOnServerlessEnvironment = options?.serverless?.use.method;
  const routeToFilterWhenOnServerlessEnvironment = options?.serverless?.use.route;
  const isUseServerless =
    // eslint-disable-next-line ts/no-unnecessary-condition
    (serverAdapter as ServerlessAdapter)?.$$type === '$PServerlessAdapter' &&
    typeof options?.serverless?.use === 'object';

  const isGeneratingServerless =
    // eslint-disable-next-line ts/no-unnecessary-condition
    (serverAdapter as ServerlessAdapter)?.$$type === '$PServerlessAdapter' && options?.serverless?.generate === true;

  const translatePath = translatePathFactory(serverAdapter, customServerInstance);
  const existsRootMiddlewares = Array.isArray(settings.middlewares) && settings.middlewares.length > 0;
  const rootRouterCompletePaths = await getRootRouterCompletePaths(domains, settings, settings.debug === true);

  for (const [path, router] of rootRouterCompletePaths) {
    // eslint-disable-next-line ts/no-unnecessary-condition
    const handlerByMethod = Object.entries(router.handlers || {});
    if (handlerByMethod.length === 0) continue;
    const [, firstHandler] = handlerByMethod[0];
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (!firstHandler) continue;

    let translatedPath = '';

    // On a serverless environment, we do the routing. Not great, but it works for most cases.
    if (isUseServerless && typeof routeToFilterWhenOnServerlessEnvironment === 'string') {
      if (
        doTheRoutingForServerlessOnly(
          serverAdapter as ServerlessAdapter,
          router.partsOfPath,
          router.urlParams,
          routeToFilterWhenOnServerlessEnvironment
        ) === false
      )
        continue;
    } else translatedPath = translatePath(path, router.partsOfPath, router.urlParams);

    if (isGeneratingServerless) {
      // Update by reference for every router so we can reference it again
      // The idea is that the user can append to the body multiple times
      const pathOfHandler = { pathOfHandler: '' };
      yield {
        translatedPath,
        handlers: handlerByMethod.reduce(
          (accumulator, currentValue) => {
            const [method, handler] = currentValue;
            const routerWithProtected = router.router as MethodsRouter & { __domain: MethodsRouter['__domain'] };

            accumulator.set(method as MethodTypes | 'all', {
              handler: generateServerlessHandler(
                settings,
                allSettings,
                serverAdapter.serverName,
                routerWithProtected.__domain.name,
                method as MethodTypes,
                path,
                pathOfHandler
              ),
              options: handler.options?.customOptions
            });
            return accumulator;
          },
          new Map<
            MethodTypes | 'all',
            {
              handler: ReturnType<typeof generateServerlessHandler>;
              options?: RouterOptionsType['customOptions'];
            }
          >()
        ),
        queryParams: router.queryParams
      };
    }

    const shouldFilterMethod = isUseServerless && typeof methodToFilterWhenOnServerlessEnvironment === 'string';
    const handlersOfRouterByMethod = handlerByMethod.reduce(
      (accumulator, currentValue) => {
        const [method, handler] = currentValue;

        // On serverless we should just wrap the method that we want to use.
        const shouldBypassMethodWrapperOnServerless =
          shouldFilterMethod && method !== methodToFilterWhenOnServerlessEnvironment && method !== 'all';

        if (shouldBypassMethodWrapperOnServerless) return accumulator;

        const wrappedHandler = wrapHandlerAndMiddlewares(
          method as MethodTypes,
          existsRootMiddlewares
            ? (settings.middlewares as NonNullable<typeof settings.middlewares>).concat(router.middlewares)
            : router.middlewares,
          router.queryParams,
          router.urlParams,
          handler.handler,
          handler.options,
          serverAdapter,
          customServerInstance,
          settings.handler500,
          settings.validation
        );
        accumulator.set(method as MethodTypes | 'all', {
          handler: wrappedHandler,
          options: handler.options?.customOptions
        });
        return accumulator;
      },
      new Map<
        MethodTypes | 'all',
        {
          handler: ReturnType<typeof wrapHandlerAndMiddlewares>;
          options?: RouterOptionsType['customOptions'];
        }
      >()
    );

    yield {
      translatedPath,
      handlers: handlersOfRouterByMethod,
      queryParams: router.queryParams
    };
  }
}

/**
 * A generator that will yield all of the routers that were extracted from the domains and the
 * settings. Used for {@link ServerRouterAdapter.parseHandler} function.
 */
export async function* getAllHandlers(
  domains: ServerDomain[],
  settings: AllServerSettingsType['servers'][string],
  serverAdapter: ServerAdapter | ServerlessAdapter
) {
  const existsRootMiddlewares = Array.isArray(settings.middlewares) && settings.middlewares.length > 0;
  const rootRouterCompletePaths = await getRootRouterCompletePaths(domains, settings);

  for (const [path, router] of rootRouterCompletePaths) {
    // eslint-disable-next-line ts/no-unnecessary-condition
    const handlerByMethod = Object.entries(router.handlers || {});
    if (handlerByMethod.length === 0) continue;

    for (const [method, handler] of handlerByMethod) {
      const wrappedHandler = wrapHandlerAndMiddlewares(
        method as MethodTypes,
        existsRootMiddlewares
          ? (settings.middlewares as NonNullable<typeof settings.middlewares>).concat(router.middlewares)
          : router.middlewares,
        router.queryParams,
        router.urlParams,
        handler.handler,
        handler.options,
        serverAdapter,
        settings.handler500
      );
      yield {
        path,
        method,
        options: handler.options?.customOptions,
        handler: wrappedHandler,
        partsOfPath: router.partsOfPath,
        queryParams: router.queryParams,
        urlParams: router.urlParams
      };
    }
  }
}

export function wrap404HandlerAndRootMiddlewares(
  serverAdapter: ServerAdapter | ServerlessAdapter,
  customServerInstance: any,
  middlewares: Middleware[],
  handler404: AllServerSettingsType['servers'][string]['handler404'],
  handler500: AllServerSettingsType['servers'][string]['handler500']
) {
  async function wrapped404Handler(serverRequestAndResponseData: any) {
    if (!handler404) return;
    let response = appendTranslatorToResponse(
      new Response(undefined, { status: HTTP_404_NOT_FOUND, statusText: DEFAULT_NOT_FOUND_STATUS_TEXT_MESSAGE }),
      serverAdapter,
      customServerInstance,
      serverAdapter.response,
      serverRequestAndResponseData,
      undefined
    );

    try {
      response = await handler404(response);
      // eslint-disable-next-line ts/no-unnecessary-condition
      if (response) {
        for await (const modifiedResponse of wrappedMiddlewareResponses(
          middlewares,
          response as Response,
          middlewares.length - 1
        )) {
          // eslint-disable-next-line ts/no-unnecessary-condition
          const isResponse = (modifiedResponse as Response)?.['$$type'] === '$PResponse';
          if (isResponse)
            response = appendTranslatorToResponse(
              modifiedResponse,
              serverAdapter,
              customServerInstance,
              serverAdapter.response,
              serverRequestAndResponseData,
              undefined
            );
          else throw new ResponseNotReturnedFromResponseOnMiddlewareError();
        }

        return translateResponseToServerResponse(
          response,
          'get',
          serverAdapter,
          customServerInstance,
          serverRequestAndResponseData
        );
      }
    } catch (error) {
      if (handler500) response = await handler500(response);
      // eslint-disable-next-line ts/no-unnecessary-condition
      if (response)
        return translateResponseToServerResponse(
          response,
          'get',
          serverAdapter,
          customServerInstance,
          serverRequestAndResponseData
        );
      else throw error;
    }
  }
  return wrapped404Handler;
}

/**
 * This will initialize all of the routers in sequence, it'll extract all of the routes from all of
 * the domains and initialize them on the server.
 */
export async function initializeRouters(
  customServerInstance: any,
  domains: ServerDomain[],
  settings: AllServerSettingsType['servers'][string],
  allSettings: AllServerSettingsType,
  serverAdapter: ServerAdapter | ServerlessAdapter,
  options?: {
    serverless?: {
      generate?: boolean;
      /** An object that contains data for when running serverless functions */
      use?: {
        /** Gets the method from the request, should be lower cased */
        getMethod: () => string;
        /** Gets the path route from the request */
        getRoute: () => string;
        /** The data to send to the request during the request / response lifecycle */
        requestAndResponseData?: any;
      };
    };
  }
) {
  const generateServerless = options?.serverless?.generate === true;
  const useServerless = typeof options?.serverless?.use === 'object';
  const method = (options?.serverless?.use?.getMethod() || '').toLowerCase() as MethodTypes;
  const route = options?.serverless?.use?.getRoute();
  const serverRequestAndResponseData = options?.serverless?.use?.requestAndResponseData;

  // eslint-disable-next-line ts/require-await
  let wrapped404Handler: Parameters<NonNullable<ServerAdapter['routers']['parseHandlers']>>['5'] = async () =>
    undefined;

  if (!useServerless) {
    wrapped404Handler = wrap404HandlerAndRootMiddlewares(
      serverAdapter,
      customServerInstance,
      settings.middlewares || [],
      settings.handler404,
      settings.handler500
    );
  }

  if (serverAdapter.routers.parseHandlers || useServerless) {
    const routers = getAllRouters(domains, settings, allSettings, serverAdapter, {
      serverless: {
        generate: generateServerless,
        use: {
          method: method,
          route: route as string
        }
      }
    });
    for await (const router of routers) {
      if ((useServerless && router.handlers.has(method)) || router.handlers.get('all')) {
        if (router.handlers.has(method))
          return (router.handlers.get(method) as any)?.handler(serverRequestAndResponseData);
        else return (router.handlers.get('all') as any)?.handler(serverRequestAndResponseData);
      } else if (useServerless === false && serverAdapter.routers.parseHandlers) {
        if ((serverAdapter as ServerAdapter).$$type === '$PServerAdapter') {
          serverAdapter = serverAdapter as ServerAdapter;
          serverAdapter.routers.parseHandlers?.(
            serverAdapter,
            customServerInstance,
            router.translatedPath,
            router.handlers as Parameters<NonNullable<ServerAdapter['routers']['parseHandlers']>>['3'],
            router.queryParams,
            wrapped404Handler
          );
        } else if ((serverAdapter as ServerlessAdapter).$$type === '$PServerlessAdapter') {
          await (serverAdapter as ServerlessAdapter).routers.parseHandlers(
            serverAdapter as ServerlessAdapter,
            allSettings.basePath,
            router.translatedPath,
            router.handlers as Parameters<NonNullable<ServerlessAdapter['routers']['parseHandlers']>>['3'],
            router.queryParams,
            wrapped404Handler
          );
        }
      }
    }
    // eslint-disable-next-line ts/no-unnecessary-condition
  } else if (
    (serverAdapter as ServerAdapter).$$type === '$PServerAdapter' &&
    // eslint-disable-next-line ts/no-unnecessary-condition
    (serverAdapter as ServerAdapter).routers.parseHandler !== undefined
  ) {
    const translatePath = translatePathFactory(serverAdapter, customServerInstance);
    const handlers = getAllHandlers(domains, settings, serverAdapter);

    for await (const handler of handlers) {
      const translatedPath = translatePath(handler.path, handler.partsOfPath, handler.urlParams);
      (serverAdapter as ServerAdapter).routers.parseHandler(
        serverAdapter as ServerAdapter,
        customServerInstance,
        translatedPath,
        handler.method as MethodTypes | 'all',
        handler.handler,
        handler.queryParams,
        handler.options
      );
    }
  } else throw new HandlerOrHandlersShouldBeDefinedOnRouterAdapterError();

  if (useServerless) return wrapped404Handler(serverRequestAndResponseData);
  if (settings.handler404) serverAdapter.routers.load404(serverAdapter as any, customServerInstance, wrapped404Handler);
}
