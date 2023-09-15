import ServerAdapter from '../adapters';
import ServerRequestAdapter from '../adapters/requests';
import ServerResponseAdapter from '../adapters/response';
import { DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY, DEFAULT_STATUS_CODE_BY_METHOD } from '../defaults';
import { ServerDomain } from '../domain/types';
import { Middleware } from '../middleware';
import Request from '../request';
import Response from '../response';
import { isRedirect } from '../response/status';
import { path } from '../router';
import { BaseRouter } from '../router/routers';
import { HandlerType, MethodTypes } from '../router/types';
import { AllServerSettingsType } from '../types';
import {
  RedirectionStatusCodesMustHaveALocationHeaderError,
  ResponseNotReturnedFromResponseOnMiddlewareError,
} from './exceptions';

/**
 * By default we don't know how to handle the routes by itself. Pretty much MethodsRouter does everything that we need here during runtime.
 * So we pretty much need to extract this data "for free".
 */
export async function getRootRouterCompletePaths(
  domains: ServerDomain[],
  settings: AllServerSettingsType['servers'][string]
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
  const rootRouter = path(settings?.prefix ? settings.prefix : '').nested(allRoutes);
  const rootRouterCompletePaths = (rootRouter as any).__completePaths as BaseRouter['__completePaths'];
  if (extractedRouterInterceptors.length > 0)
    await Promise.all(
      extractedRouterInterceptors.map(async (routerInterceptor) => await routerInterceptor(rootRouterCompletePaths))
    );
  return (rootRouter as any).__completePaths as BaseRouter['__completePaths'];
}

async function* wrappedMiddlewareRequests(middlewares: Middleware[], request: Request) {
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
  response: Response,
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
 * @param request - The request that was being handled when the error happened.
 * @param error - The error that was thrown.
 * @param handler500 - The handler500 that was set on the settings.
 */
async function appendErrorToRequestAndReturnResponseOrThrow(
  request: Request,
  error: Error,
  handler500?: AllServerSettingsType['servers'][string]['handler500']
) {
  (request as unknown as Omit<Request<any, any>, '__error'> & { __error: Error }).__error = error as Error;
  if (handler500?.request) {
    const responseOrRequest = await handler500.request(request as Request<any, any>);
    const isResponse = responseOrRequest instanceof Response;
    if (isResponse) return responseOrRequest;
    else throw error;
  } else throw error;
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
  request: Request,
  serverAdapter: ServerAdapter,
  serverRequestAdapter: ServerRequestAdapter,
  serverRequestAndResponseData: any,
  queryParams: BaseRouter['__queryParamsAndPath']['params'],
  urlParams: BaseRouter['__urlParamsAndPath']['params']
) {
  const requestWithoutPrivateMethods = request as unknown as Omit<
    Request<any, any>,
    '__requestAdapter' | '__serverRequestAndResponseData' | '__queryParams' | '__urlParams' | '__serverAdapter'
  > & {
    __serverAdapter: ServerAdapter;
    __requestAdapter: ServerRequestAdapter;
    __serverRequestAndResponseData: any;
    __queryParams: BaseRouter['__queryParamsAndPath']['params'];
    __urlParams: BaseRouter['__urlParamsAndPath']['params'];
  };
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
  serverRequestAndResponseData: any
) {
  const responseWithoutPrivateMethods = response as unknown as Omit<
    Response<any, any>,
    '__responseAdapter' | '__serverRequestAndResponseData' | '__serverAdapter'
  > & {
    __serverAdapter: ServerAdapter;
    __responseAdapter: ServerResponseAdapter;
    __serverRequestAndResponseData: any;
  };
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
  return server.response.send(server, serverRequestAndResponseData, responseStatus, response.headers, response.body);
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
  handler: HandlerType<string, []>,
  server: ServerAdapter,
  handler500?: AllServerSettingsType['servers'][string]['handler500']
) {
  const wrappedHandler = async (serverRequestAndResponseData: any) => {
    let request = appendTranslatorToRequest(
      new Request(),
      server,
      server.request,
      serverRequestAndResponseData,
      queryParams,
      urlParams
    );

    let response: Response | undefined = undefined;
    let wasErrorAlreadyHandled = false;
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
            serverRequestAndResponseData
          );
        else
          request = appendTranslatorToRequest(
            responseOrRequest,
            server,
            server.request,
            serverRequestAndResponseData,
            queryParams,
            urlParams
          );
      }
      // If the response is set, then we can just return it from the handler.
      const responseNotSet = response === undefined;
      if (responseNotSet)
        response = appendTranslatorToResponse(
          await Promise.resolve(handler(request)),
          server,
          server.response,
          serverRequestAndResponseData
        );
    } catch (error) {
      wasErrorAlreadyHandled = true;
      response = appendTranslatorToResponse(
        await appendErrorToRequestAndReturnResponseOrThrow(request, error as Error, handler500),
        server,
        server.response,
        serverRequestAndResponseData
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
              serverRequestAndResponseData
            );
          else throw new ResponseNotReturnedFromResponseOnMiddlewareError();
        }

        return translateResponseToServerResponse(response, method, server, serverRequestAndResponseData);
      }
    } catch (error) {
      if (!wasErrorAlreadyHandled)
        response = appendTranslatorToResponse(
          await appendErrorToRequestAndReturnResponseOrThrow(request, error as Error, handler500),
          server,
          server.response,
          serverRequestAndResponseData
        );
      if (response) return translateResponseToServerResponse(response, method, server, serverRequestAndResponseData);
      else throw error;
    }
  };
  return wrappedHandler.bind(wrappedHandler);
}

export async function* getAllHandlers(
  domains: ServerDomain[],
  settings: AllServerSettingsType['servers'][string],
  serverAdapter: ServerAdapter
) {
  const rootRouterCompletePaths = await getRootRouterCompletePaths(domains, settings);
  for (const [path, router] of rootRouterCompletePaths) {
    console;
    const handlerByMethod = Object.entries(router.handlers || {});
    if (handlerByMethod.length === 0) continue;
    for (const [method, handler] of handlerByMethod) {
      const wrappedHandler = wrapHandlerAndMiddlewares(
        method as MethodTypes,
        router.middlewares,
        router.queryParams,
        router.urlParams,
        handler,
        serverAdapter,
        settings.handler500
      );
      yield {
        path,
        method,
        handler: wrappedHandler,
        partsOfPath: router.partsOfPath,
        queryParams: router.queryParams,
        urlParams: router.urlParams,
      };
    }
  }
}

/**
 * This will initialize all of the routers in sequence, it'll extract all of the routes from all of the domains and initialize them on the server.
 */
export async function initializeRouters(
  domains: ServerDomain[],
  settings: AllServerSettingsType['servers'][string],
  serverAdapter: ServerAdapter
) {
  const handlers = getAllHandlers(domains, settings, serverAdapter);
  for await (const handler of handlers) {
    let fullPath = '';
    for (const path of handler.partsOfPath) {
      const urlParamType = path.isUrlParam ? handler.urlParams.get(path.part) : undefined;
      const translatedPartOfPath = serverAdapter.routers.parseRoute(serverAdapter, path.part, urlParamType);
      if (translatedPartOfPath === undefined) continue;
      fullPath += '/' + translatedPartOfPath;
    }
    serverAdapter.routers.parseHandler(serverAdapter, fullPath, handler.method, handler.handler, handler.queryParams);
  }
}
