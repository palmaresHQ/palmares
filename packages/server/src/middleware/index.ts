import type { DefaultRouterType } from '../router/types';
import type { ExtractRequestsFromMiddlewaresForServer } from './types';
import type {
  DefaultRequestType,
  RequestCache,
  RequestCredentials,
  RequestDestination,
  RequestMethodTypes,
  RequestMode,
  RequestRedirect,
} from '../request/types';
import type { BaseRouter } from '../router/routers';
import type Request from '../request';
import type Response from '../response';
import type { DefaultResponseType, ExtractResponsesFromMiddlewaresRequestAndRouterHandlers } from '../response/types';

export class Middleware {
  request:
    | ((
        request: DefaultRequestType
      ) => Promise<DefaultRequestType | DefaultResponseType> | DefaultRequestType | DefaultResponseType)
    | undefined = undefined;
  response: ((response: DefaultResponseType) => Promise<DefaultResponseType> | DefaultResponseType) | undefined =
    undefined;
}

export function middleware<
  TRouter extends DefaultRouterType,
  TRouterMiddlewares = TRouter extends BaseRouter<any, any, infer TInferMiddlewares, any>
    ? TInferMiddlewares extends readonly Middleware[]
      ? TInferMiddlewares
      : never
    : never,
  TReturn extends DefaultRequestType = Request<
    string,
    {
      method: RequestMethodTypes;
      headers: unknown;
      body: unknown;
      context: unknown;
      mode: RequestMode;
      cache: RequestCache;
      credentials: RequestCredentials;
      integrity: string;
      destination: RequestDestination;
      referrer: string;
      referrerPolicy: ReferrerPolicy;
      redirect: RequestRedirect;
    }
  >,
  TResponse extends DefaultResponseType = Response<
    undefined,
    {
      status: undefined;
      headers: unknown;
      context: unknown;
    }
  >,
  TRequestFunction = (
    request: TRouterMiddlewares extends readonly Middleware[]
      ? ExtractRequestsFromMiddlewaresForServer<TRouter['path'], TRouterMiddlewares>
      : never
  ) => Promise<TReturn> | TReturn,
  TResponseFunction = (
    response: ExtractResponsesFromMiddlewaresRequestAndRouterHandlers<[TRouter]>
  ) => Promise<TResponse> | TResponse
>(options: { request?: TRequestFunction; response?: TResponseFunction }) {
  type TypeValidRequestFunction = TRequestFunction extends (
    request: DefaultRequestType
  ) => Promise<DefaultRequestType> | DefaultRequestType
    ? TRequestFunction
    : undefined;
  type TypeValidResponseFunction = TResponseFunction extends (
    response: DefaultResponseType
  ) => Promise<DefaultResponseType> | DefaultResponseType
    ? TResponseFunction
    : undefined;

  return new (class extends Middleware {
    request = options.request as TypeValidRequestFunction;
    response = options.response as TypeValidResponseFunction;
  })() as Middleware & {
    request: TRequestFunction;
    response: TResponseFunction;
  };
}

export function nestedMiddleware<TRouter extends DefaultRouterType>() {
  return <
    TRouterMiddlewares = TRouter extends BaseRouter<any, any, infer TInferMiddlewares, any>
      ? TInferMiddlewares extends readonly Middleware[]
        ? TInferMiddlewares
        : never
      : never,
    TReturn extends Request<
      string,
      {
        method: RequestMethodTypes;
        headers: unknown;
        body: unknown;
        context: unknown;
        mode: RequestMode;
        cache: RequestCache;
        credentials: RequestCredentials;
        integrity: string;
        destination: RequestDestination;
        referrer: string;
        referrerPolicy: ReferrerPolicy;
        redirect: RequestRedirect;
      }
    > = Request<
      string,
      {
        method: RequestMethodTypes;
        headers: unknown;
        body: unknown;
        context: unknown;
        mode: RequestMode;
        cache: RequestCache;
        credentials: RequestCredentials;
        integrity: string;
        destination: RequestDestination;
        referrer: string;
        referrerPolicy: ReferrerPolicy;
        redirect: RequestRedirect;
      }
    >,
    TResponse extends DefaultResponseType = Response<
      undefined,
      {
        status: undefined;
        headers: unknown;
        context: unknown;
      }
    >,
    TRequestFunction = (
      request: TRouterMiddlewares extends readonly Middleware[]
        ? ExtractRequestsFromMiddlewaresForServer<TRouter['path'], TRouterMiddlewares>
        : Request<
            string,
            {
              method: RequestMethodTypes;
              headers: unknown;
              body: unknown;
              context: unknown;
              mode: RequestMode;
              cache: RequestCache;
              credentials: RequestCredentials;
              integrity: string;
              destination: RequestDestination;
              referrer: string;
              referrerPolicy: ReferrerPolicy;
              redirect: RequestRedirect;
            }
          >
    ) => Promise<TReturn> | TReturn,
    TResponseFunction = (
      response: ExtractResponsesFromMiddlewaresRequestAndRouterHandlers<[TRouter]>
    ) => Promise<TResponse> | TResponse
  >(options: {
    request?: TRequestFunction;
    response?: TResponseFunction;
  }) => {
    type TypeValidRequestFunction = TRequestFunction extends (
      request: DefaultRequestType
    ) => Promise<DefaultRequestType> | DefaultRequestType
      ? TRequestFunction
      : undefined;
    type TypeValidResponseFunction = TResponseFunction extends (
      response: DefaultResponseType
    ) => Promise<DefaultResponseType> | DefaultResponseType
      ? TResponseFunction
      : undefined;

    return new (class extends Middleware {
      request = options.request as TypeValidRequestFunction;
      response = options.response as TypeValidResponseFunction;
    })() as Middleware & {
      request: TRequestFunction;
      response: TResponseFunction;
    };
  };
}
