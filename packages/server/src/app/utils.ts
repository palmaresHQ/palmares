import ServerAdapter from '../adapters';
import ServerRequestAdapter from '../adapters/requests';
import ServerResponseAdapter from '../adapters/response';
import {
  DEFAULT_NOT_FOUND_STATUS_TEXT_MESSAGE,
  DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY,
  DEFAULT_SERVER_ERROR_RESPONSE,
  DEFAULT_STATUS_CODE_BY_METHOD,
} from '../defaults';
import { errorCaptureHandler } from '../handlers';
import { ServerDomain } from '../domain/types';
import { Middleware } from '../middleware';
import Request from '../request';
import Response from '../response';
import { HTTP_404_NOT_FOUND, isRedirect } from '../response/status';
import { path } from '../router';
import { BaseRouter } from '../router/routers';
import { HandlerType, MethodTypes, RouterOptionsType } from '../router/types';
import { AllServerSettingsType } from '../types';
import {
  HandlerOrHandlersShouldBeDefinedOnRouterAdapterError,
  RedirectionStatusCodesMustHaveALocationHeaderError,
  ResponseNotReturnedFromResponseOnMiddlewareError,
} from './exceptions';

import type ServerRouterAdapter from '../adapters/routers';
import { AsyncGeneratorFunction, FileLike, GeneratorFunction } from '../response/utils';

/**
 * By default we don't know how to handle the routes by itself. Pretty much MethodsRouter does everything that we need here during runtime.
 * So we pretty much need to extract this data "for free".
 */
export async function getRootRouterCompletePaths(
  domains: ServerDomain[],
  settings: AllServerSettingsType['servers'][string],
  isDebugModeEnabled: boolean = true
) {
  const extractedRouterInterceptors: NonNullable<Awaited<NonNullable<typeof domains[number]>['routerInterceptor']>>[] =
    [];
  const extractedRoutes: Promise<ReturnType<NonNullable<Awaited<NonNullable<typeof domains[number]>['getRoutes']>>>>[] =
    [];
  for (const domain of domains) {
    if (domain.getRoutes) extractedRoutes.push(Promise.resolve(domain.getRoutes()));
    if (domain.routerInterceptor) extractedRouterInterceptors.push(domain.routerInterceptor);
  }

  const allRoutes = await Promise.all(extractedRoutes);
  const allRoutesWithOrWithoutErrorHandler = isDebugModeEnabled
    ? allRoutes.concat([errorCaptureHandler() as any])
    : allRoutes;
  const rootRouter = path(settings?.prefix ? settings.prefix : '').nested(allRoutesWithOrWithoutErrorHandler);
  const rootRouterCompletePaths = (rootRouter as any).__completePaths as BaseRouter['__completePaths'];
  if (extractedRouterInterceptors.length > 0)
    await Promise.all(
      extractedRouterInterceptors.map(async (routerInterceptor) => await routerInterceptor(rootRouterCompletePaths))
    );
  return (rootRouter as any).__completePaths as BaseRouter['__completePaths'];
}

async function* wrappedMiddlewareRequests(middlewares: Middleware[], request: Request<any, any>) {
  // We need to use this, because if we were creating another array we would be consuming an uneccesary amount of memory.
  let middlewareIndex = 0;
  for (const middleware of middlewares) {
    middlewareIndex++;
    if (middleware.request) {
      const responseOrRequest = await middleware.request(request);
      if (responseOrRequest instanceof Response) yield [middlewareIndex, responseOrRequest] as const;
      else {
        request = responseOrRequest;
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
    if (!middleware) continue;
    if (middleware.response) {
      response = await middleware.response(response);
      yield response;
    }
  }
}

/**
 * This will pretty much wrap call the handler500.request and return the response if it returns a response. Otherwise it will throw an error.
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
  if (error instanceof Response) return error;
  else if (!handler500) throw error;

  response = await Promise.resolve(handler500(response));
  if (response instanceof Response) return response;
  else throw error;
}

/**
 * Used for appending multiple private methods and values to the Request object. Private methods and values are prefixed with __. Remember that they only exist on typescript
 * not on runtime, so there is no issue when assigning a value to them. Also, we want to guarantee a nice user experience so we should keep them private so that intellisense
 * doesn't catch it.
 *
 * IMPORTANT: Don't expect any maintainer to know about those private methods, so if you need to use them in a translation, flat them out! In other words: send them directly,
 * don't send the request object.
 *
 * @param request - The request that was created by the server adapter.
 * @param serverAdapter - The server adapter that was selected to handle the server creation.
 */
function appendTranslatorToRequest(
  request: Request<any, any>,
  serverAdapter: ServerAdapter,
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
    | '__serverRequestAndResponseData'
    | '__queryParams'
    | '__urlParams'
    | '__serverAdapter'
    | '__responses'
    | '__validation'
  > & {
    __serverAdapter: ServerAdapter;
    __requestAdapter: ServerRequestAdapter;
    __serverRequestAndResponseData: any;
    __queryParams: BaseRouter['__queryParamsAndPath']['params'];
    __urlParams: BaseRouter['__urlParamsAndPath']['params'];
    __responses: Record<string, (...args: any[]) => Response<any, any> | undefined>;
    __validation: AllServerSettingsType['servers'][string]['validation'];
  };
  if (options?.responses)
    requestWithoutPrivateMethods.__responses = Object.freeze({
      value: options?.responses as any,
    });
  requestWithoutPrivateMethods.__validation = validation;
  requestWithoutPrivateMethods.__serverAdapter = serverAdapter;
  requestWithoutPrivateMethods.__serverRequestAndResponseData = serverRequestAndResponseData;
  requestWithoutPrivateMethods.__requestAdapter = serverRequestAdapter;
  requestWithoutPrivateMethods.__queryParams = queryParams;
  requestWithoutPrivateMethods.__urlParams = urlParams;
  return request;
}

function appendTranslatorToResponse(
  response: Response<any, any>,
  serverAdapter: ServerAdapter,
  serverResponseAdapter: ServerResponseAdapter,
  serverRequestAndResponseData: any,
  options: RouterOptionsType | undefined
) {
  const responseWithoutPrivateMethods = response as unknown as Omit<
    Response<any, any>,
    '__responseAdapter' | '__serverRequestAndResponseData' | '__serverAdapter' | 'responses'
  > & {
    responses: Record<string, (...args: any[]) => Response<any, any>>;
    __serverAdapter: ServerAdapter;
    __responseAdapter: ServerResponseAdapter;
    __serverRequestAndResponseData: any;
  };
  if (options?.responses)
    responseWithoutPrivateMethods.responses = Object.freeze({
      value: options?.responses as any,
    });
  responseWithoutPrivateMethods.__serverAdapter = serverAdapter;
  responseWithoutPrivateMethods.__serverRequestAndResponseData = serverRequestAndResponseData;
  responseWithoutPrivateMethods.__responseAdapter = serverResponseAdapter;
  return response;
}

/**
 * Responsible for translating the response to something that the selected server can understand. We translate each part needed for the response internally.
 *
 * @param response - The response that was returned from the handler.
 * @param server - The server adapter that was selected.
 * @param serverRequestAndResponseData - The data that was sent by the server during the request/response lifecycle.
 */
async function translateResponseToServerResponse(
  response: Response,
  method: MethodTypes,
  server: ServerAdapter,
  serverRequestAndResponseData: any
) {
  const responseStatus = response.status || DEFAULT_STATUS_CODE_BY_METHOD(method);
  const isRedirectResponse = isRedirect(responseStatus);
  const isStreamResponse =
    (response.body && (response.body as any) instanceof GeneratorFunction) ||
    (response.body as any) instanceof AsyncGeneratorFunction;
  const isFileResponse =
    (response.body && (response.body as any) instanceof Blob) ||
    (response.body as any) instanceof FileLike ||
    (response.body as any) instanceof ArrayBuffer;
  if (isRedirectResponse && !response.headers?.[DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY])
    throw new RedirectionStatusCodesMustHaveALocationHeaderError();
  if (isRedirectResponse)
    return server.response.redirect(
      server,
      serverRequestAndResponseData,
      responseStatus,
      response.headers,
      (response.headers as any)[DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY] as string
    );
  if (isStreamResponse)
    return server.response.stream(
      server,
      serverRequestAndResponseData,
      responseStatus,
      response.headers as any,
      (response.body as unknown as () => AsyncGenerator<any, any, any> | Generator<any, any, any>)() as
        | AsyncGenerator<any, any, any>
        | Generator<any, any, any>,
      (response.body as any) instanceof AsyncGeneratorFunction
    );
  if (isFileResponse)
    return server.response.sendFile(
      server,
      serverRequestAndResponseData,
      responseStatus,
      response.headers as any,
      response.body as any
    );
  return server.response.send(
    server,
    serverRequestAndResponseData,
    responseStatus,
    response.headers as any,
    response.body as any
  );
}

/**
 * There are two ways of translating the path, either use {@link ServerRouterAdapter.parseHandler} which will parse each handler (method) at a time. Or use
 * {@link ServerRouterAdapter.parseHandlers} which will parse all of the handlers at once.
 *
 * Since they are pretty similar and they both need to translate the path we use this factory function to extract this common functionality on both of them.
 *
 * @param serverAdapter - The server adapter that was selected. We will call the {@link ServerRouterAdapter.parseRoute} method on it.
 *
 * @returns - A function that can be used to translate the path.
 */
function translatePathFactory(serverAdapter: ServerAdapter) {
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
        const translatedPartOfPath = serverAdapter.routers.parseRoute(serverAdapter, path.part, urlParamType);
        if (translatedPartOfPath === undefined) continue;
        fullPath += '/' + translatedPartOfPath;
      }
    }
    return fullPath;
  };
}

/**
 * Responsible for wrapping the handler and the middlewares into a single function that will be called when a request is made to the server.
 *
 * The server adapter is responsible for passing the data it needs to be able to safely translate the request and response during it's lifecycle.
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
  server: ServerAdapter,
  handler500?: AllServerSettingsType['servers'][string]['handler500'],
  validation?: AllServerSettingsType['servers'][string]['validation']
) {
  const wrappedHandler = async (serverRequestAndResponseData: any) => {
    let request = appendTranslatorToRequest(
      new Request(),
      server,
      server.request,
      serverRequestAndResponseData,
      queryParams,
      urlParams,
      validation,
      options
    );

    let response: Response | undefined = undefined;
    let wasErrorAlreadyHandledInRequestLifecycle = false;
    // This is the index of the middleware that we are currently handling for the request. So on the response we start from the last to the first.
    let middlewareOnionIndex = 0;

    try {
      // Go through all of the middlewares and apply them to the request or modify the request.
      for await (const [middlewareIndex, responseOrRequest] of wrappedMiddlewareRequests(middlewares, request)) {
        middlewareOnionIndex = middlewareIndex;
        const isResponse = responseOrRequest instanceof Response;
        if (isResponse)
          response = appendTranslatorToResponse(
            responseOrRequest,
            server,
            server.response,
            serverRequestAndResponseData,
            options
          );
        else
          request = appendTranslatorToRequest(
            responseOrRequest,
            server,
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
      if (responseNotSet)
        response = appendTranslatorToResponse(
          await Promise.resolve(handler(request)),
          server,
          server.response,
          serverRequestAndResponseData,
          options
        );
    } catch (error) {
      const isResponseError = error instanceof Response;
      const errorAsError = error as Error;
      let errorResponse: Response = isResponseError
        ? (error as Response<any, any>)
        : DEFAULT_SERVER_ERROR_RESPONSE(errorAsError, server.settings, server.domains);
      wasErrorAlreadyHandledInRequestLifecycle = true;

      errorResponse = appendTranslatorToResponse(
        errorResponse,
        server,
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
        server.response,
        serverRequestAndResponseData,
        options
      );
    }

    try {
      if (response) {
        for await (const modifiedResponse of wrappedMiddlewareResponses(
          middlewares,
          response as Response,
          middlewareOnionIndex
        )) {
          const isResponse = modifiedResponse instanceof Response;
          if (isResponse)
            response = appendTranslatorToResponse(
              modifiedResponse,
              server,
              server.response,
              serverRequestAndResponseData,
              options
            );
          else throw new ResponseNotReturnedFromResponseOnMiddlewareError();
        }

        return translateResponseToServerResponse(response, method, server, serverRequestAndResponseData);
      }
    } catch (error) {
      if (wasErrorAlreadyHandledInRequestLifecycle === false) {
        const isResponseError = error instanceof Response;
        let errorResponse: Response = isResponseError
          ? (error as Response<any, any>)
          : DEFAULT_SERVER_ERROR_RESPONSE(error as Error, server.settings, server.domains);

        errorResponse = appendTranslatorToResponse(
          errorResponse,
          server,
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
          server.response,
          serverRequestAndResponseData,
          options
        );
      }
      if (response) return translateResponseToServerResponse(response, method, server, serverRequestAndResponseData);
      else throw error;
    }
  };
  return wrappedHandler.bind(wrappedHandler);
}

/**
 * A generator that will yield all of the routers that were extracted from the domains and the settings. Used for {@link ServerRouterAdapter.parseHandlers} function.
 */
export async function* getAllRouters(
  domains: ServerDomain[],
  settings: AllServerSettingsType['servers'][string],
  serverAdapter: ServerAdapter
) {
  const translatePath = translatePathFactory(serverAdapter);
  const existsRootMiddlewares = Array.isArray(settings.middlewares) && settings.middlewares.length > 0;
  const rootRouterCompletePaths = await getRootRouterCompletePaths(domains, settings);

  for (const [path, router] of rootRouterCompletePaths) {
    const handlerByMethod = Object.entries(router.handlers || {});
    if (handlerByMethod.length === 0) continue;
    const [, firstHandler] = handlerByMethod[0];
    if (!firstHandler) continue;

    const translatedPath = translatePath(path, router.partsOfPath, router.urlParams);

    const convertedHandlersToMap = handlerByMethod.reduce(
      (accumulator, currentValue) => {
        const [method, handler] = currentValue;
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
          settings.handler500,
          settings.validation
        );
        accumulator.set(method as MethodTypes | 'all', {
          handler: wrappedHandler,
          options: handler?.options?.customRouterOptions,
        });
        return accumulator;
      },
      new Map<
        MethodTypes | 'all',
        {
          handler: ReturnType<typeof wrapHandlerAndMiddlewares>;
          options?: RouterOptionsType['customRouterOptions'];
        }
      >()
    );

    yield {
      translatedPath,
      handlers: convertedHandlersToMap,
      queryParams: router.queryParams,
    };
  }
}

/**
 * A generator that will yield all of the routers that were extracted from the domains and the settings. Used for {@link ServerRouterAdapter.parseHandler} function.
 */
export async function* getAllHandlers(
  domains: ServerDomain[],
  settings: AllServerSettingsType['servers'][string],
  serverAdapter: ServerAdapter
) {
  const existsRootMiddlewares = Array.isArray(settings.middlewares) && settings.middlewares.length > 0;
  const rootRouterCompletePaths = await getRootRouterCompletePaths(domains, settings);

  for (const [path, router] of rootRouterCompletePaths) {
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
        options: handler?.options?.customRouterOptions,
        handler: wrappedHandler,
        partsOfPath: router.partsOfPath,
        queryParams: router.queryParams,
        urlParams: router.urlParams,
      };
    }
  }
}

export function wrap404HandlerAndRootMiddlewares(
  serverAdapter: ServerAdapter,
  middlewares: Middleware[],
  handler404: AllServerSettingsType['servers'][string]['handler404'],
  handler500: AllServerSettingsType['servers'][string]['handler500']
) {
  async function wrapped404Handler(serverRequestAndResponseData: any) {
    if (!handler404) return;
    let response = appendTranslatorToResponse(
      new Response(undefined, { status: HTTP_404_NOT_FOUND, statusText: DEFAULT_NOT_FOUND_STATUS_TEXT_MESSAGE }),
      serverAdapter,
      serverAdapter.response,
      serverRequestAndResponseData,
      undefined
    );

    try {
      response = await handler404(response);
      if (response) {
        for await (const modifiedResponse of wrappedMiddlewareResponses(
          middlewares,
          response as Response,
          middlewares.length - 1
        )) {
          const isResponse = modifiedResponse instanceof Response;
          if (isResponse)
            response = appendTranslatorToResponse(
              modifiedResponse,
              serverAdapter,
              serverAdapter.response,
              serverRequestAndResponseData,
              undefined
            );
          else throw new ResponseNotReturnedFromResponseOnMiddlewareError();
        }

        return translateResponseToServerResponse(response, 'get', serverAdapter, serverRequestAndResponseData);
      }
    } catch (error) {
      if (handler500) response = await handler500(response);
      if (response)
        return translateResponseToServerResponse(response, 'get', serverAdapter, serverRequestAndResponseData);
      else throw error;
    }
  }
  return wrapped404Handler;
}

/**
 * This will initialize all of the routers in sequence, it'll extract all of the routes from all of the domains and initialize them on the server.
 */
export async function initializeRouters(
  domains: ServerDomain[],
  settings: AllServerSettingsType['servers'][string],
  serverAdapter: ServerAdapter
) {
  const wrapped404Handler = wrap404HandlerAndRootMiddlewares(
    serverAdapter,
    settings.middlewares || [],
    settings.handler404,
    settings.handler500
  );
  if (serverAdapter.routers.parseHandlers) {
    const routers = getAllRouters(domains, settings, serverAdapter);
    for await (const router of routers) {
      serverAdapter.routers.parseHandlers(
        serverAdapter,
        router.translatedPath,
        router.handlers,
        router.queryParams,
        wrapped404Handler
      );
    }
  } else if (serverAdapter.routers.parseHandler) {
    const translatePath = translatePathFactory(serverAdapter);
    const handlers = getAllHandlers(domains, settings, serverAdapter);

    for await (const handler of handlers) {
      const translatedPath = translatePath(handler.path, handler.partsOfPath, handler.urlParams);
      serverAdapter.routers.parseHandler(
        serverAdapter,
        translatedPath,
        handler.method as MethodTypes | 'all',
        handler.handler,
        handler.options,
        handler.queryParams
      );
    }
  } else throw new HandlerOrHandlersShouldBeDefinedOnRouterAdapterError();

  if (settings.handler404) serverAdapter.routers.load404(serverAdapter, wrapped404Handler);
}
