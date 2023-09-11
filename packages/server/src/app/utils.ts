import ServerAdapter from '../adapters';
import ServerRequestAdapter from '../adapters/requests';
import ServerResponseAdapter from '../adapters/response';
import { ServerDomain } from '../domain/types';
import { Middleware, middleware } from '../middleware';
import Request from '../request';
import Response from '../response';
import { path } from '../router';
import { MethodsRouter } from '../router/routers';
import { HandlerType, MethodTypes } from '../router/types';
import { AllServerSettingsType, ServerSettingsType } from '../types';
import { ResponseNotReturnedFromResponseOnMiddlewareError } from './exceptions';

/**
 * By default we don't know how to handle the routes by itself. Pretty much MethodsRouter does everything that we need here during runtime.
 * So we pretty much need to extract this data "for free".
 */
export async function getRootRouterCompletePaths(domains: ServerDomain[], settings: AllServerSettingsType) {
  const extractedRoutes: Promise<ReturnType<NonNullable<Awaited<NonNullable<typeof domains[number]>['getRoutes']>>>>[] =
    [];
  for (const domain of domains) {
    if (domain.getRoutes) extractedRoutes.push(Promise.resolve(domain.getRoutes()));
  }

  const allRoutes = await Promise.all(extractedRoutes);
  const rootRouter = path(settings?.prefix ? settings.prefix : '').nested(allRoutes);
  return (rootRouter as any).__completePaths as Map<
    string,
    {
      middlewares: Middleware[];
      urlParams: Map<
        string,
        {
          type: ('number' | 'string' | 'boolean')[];
          regex: RegExp;
        }
      >;
      queryPath: string;
      urlPath: string;
      queryParams: Map<
        string,
        {
          type: ('number' | 'string' | 'boolean')[];
          isArray: boolean;
          regex: RegExp;
        }
      >;
      router: MethodsRouter;
      handlers: {
        [method in MethodTypes]?: HandlerType<string, Middleware[]>;
      };
    }
  >;
}

async function* wrappedMiddlewareRequests(middlewares: Middleware[], request: Request) {
  for (const middleware of middlewares) {
    if (middleware.request) {
      const responseOrRequest = await middleware.request(request);
      if (responseOrRequest instanceof Response) yield responseOrRequest;
      else {
        request = responseOrRequest;
        yield responseOrRequest;
      }
    }
  }
}

async function* wrappedMiddlewareResponses(middlewares: Middleware[], response: Response) {
  for (let i = middlewares.length - 1; i >= 0; i--) {
    const middleware = middlewares[i];
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
  handler500?: ServerSettingsType['handler500']
) {
  (request as unknown as Omit<Request<any, any>, '__error'> & { __error: Error }).__error = error as Error;
  if (handler500?.request) {
    const responseOrRequest = await handler500.request(request as Request<any, any>);
    const isResponse = responseOrRequest instanceof Response;
    if (isResponse) return responseOrRequest;
    else throw error;
  } else throw error;
}

function appendTranslatorToRequest(
  request: Request,
  serverRequestAdapter: ServerRequestAdapter,
  serverRequestAndResponseData: any
) {
  const requestWithoutPrivateMethods = request as unknown as Omit<
    Request<any, any>,
    '__requestAdapter' | '__serverRequestAndResponseData'
  > & {
    __requestAdapter: ServerRequestAdapter;
    __serverRequestAndResponseData: any;
  };
  requestWithoutPrivateMethods.__serverRequestAndResponseData = serverRequestAndResponseData;
  requestWithoutPrivateMethods.__requestAdapter = serverRequestAdapter;
  return request;
}

function appendTranslatorToResponse(
  response: Response,
  serverResponseAdapter: ServerResponseAdapter,
  serverRequestAndResponseData: any
) {
  const responseWithoutPrivateMethods = response as unknown as Omit<
    Response<any>,
    '__responseAdapter' | '__serverRequestAndResponseData'
  > & {
    __responseAdapter: ServerResponseAdapter;
    __serverRequestAndResponseData: any;
  };
  responseWithoutPrivateMethods.__serverRequestAndResponseData = serverRequestAndResponseData;
  responseWithoutPrivateMethods.__responseAdapter = serverResponseAdapter;
  return response;
}

function wrapHandlerAndMiddlewares(
  middlewares: Middleware[],
  handler: HandlerType<string, []>,
  server: ServerAdapter,
  handler500?: ServerSettingsType['handler500']
) {
  const wrappedHandler = async (serverRequestAndResponseData: any) => {
    let request = appendTranslatorToRequest(new Request(), server.request, serverRequestAndResponseData);

    let response: Response | undefined = undefined;
    let wasErrorAlreadyHandled = false;

    try {
      // Go through all of the middlewares and apply them to the request or modify the request.
      for await (const responseOrRequest of wrappedMiddlewareRequests(middlewares, request)) {
        const isResponse = responseOrRequest instanceof Response;
        if (isResponse)
          response = appendTranslatorToResponse(responseOrRequest, server.response, serverRequestAndResponseData);
        else request = appendTranslatorToRequest(responseOrRequest, server.request, serverRequestAndResponseData);
      }
      // If the response is set, then we can just return it from the handler.
      const responseNotSet = response === undefined;
      if (responseNotSet)
        response = appendTranslatorToResponse(
          await Promise.resolve(handler(request)),
          server.response,
          serverRequestAndResponseData
        );
    } catch (error) {
      wasErrorAlreadyHandled = true;
      response = appendTranslatorToResponse(
        await appendErrorToRequestAndReturnResponseOrThrow(request, error as Error, handler500),
        server.response,
        serverRequestAndResponseData
      );
    }

    try {
      if (response) {
        for await (const modifiedResponse of wrappedMiddlewareResponses(middlewares, response as Response)) {
          const isResponse = modifiedResponse instanceof Response;
          if (isResponse)
            response = appendTranslatorToResponse(modifiedResponse, server.response, serverRequestAndResponseData);
          else throw new ResponseNotReturnedFromResponseOnMiddlewareError();
        }
        return response;
      }
    } catch (error) {
      if (!wasErrorAlreadyHandled)
        response = appendTranslatorToResponse(
          await appendErrorToRequestAndReturnResponseOrThrow(request, error as Error, handler500),
          server.response,
          serverRequestAndResponseData
        );
    }
  };
  return wrappedHandler.bind(wrappedHandler);
}

export async function* getAllHandlers(
  domains: ServerDomain[],
  settings: AllServerSettingsType,
  serverAdapter: ServerAdapter
) {
  const rootRouterCompletePaths = await getRootRouterCompletePaths(domains, settings);
  for (const [path, router] of rootRouterCompletePaths) {
    const handlerByMethod = Object.entries(router.handlers || {});
    if (handlerByMethod.length === 0) continue;
    for (const [method, handler] of handlerByMethod) {
      const wrappedHandler = wrapHandlerAndMiddlewares(router.middlewares, handler, serverAdapter, settings.handler500);
      yield { path, method, handler: wrappedHandler };
    }
  }
}
