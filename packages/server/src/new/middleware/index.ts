import type { DefaultRouterType } from '../router/types';
import type { ExtractRequestsFromMiddlewaresForServer } from './types';
import type { DefaultRequestType } from '../request/types';
import type { BaseRouter } from '../router/routers';
import type Request from '../request';
import type Response from '../response';
import type {
  DefaultResponseType,
  ExtractResponsesFromMiddlewaresRequestAndRouterHandlers,
} from '../response/types';

export class Middleware2 {
  request:
    | ((
        request: DefaultRequestType
      ) => Promise<DefaultRequestType> | DefaultRequestType)
    | undefined = undefined;
  response:
    | ((
        response: DefaultResponseType
      ) => Promise<DefaultResponseType> | DefaultResponseType)
    | undefined = undefined;
}

export function middleware<
  TRouter extends DefaultRouterType,
  TRouterMiddlewares = TRouter extends BaseRouter<
    any,
    any,
    infer TInferMiddlewares,
    any
  >
    ? TInferMiddlewares extends readonly Middleware2[]
      ? TInferMiddlewares
      : never
    : never,
  TReturn extends DefaultRequestType = Request<
    string,
    {
      Body: unknown;
      Headers: unknown;
      Context: unknown;
      Cookies: unknown;
    }
  >,
  TResponse extends DefaultResponseType = Response<{
    Status: undefined;
    Body: undefined;
    Headers: unknown;
    Context: unknown;
  }>,
  TRequestFunction = (
    request: TRouterMiddlewares extends readonly Middleware2[]
      ? ExtractRequestsFromMiddlewaresForServer<
          TRouter['path'],
          TRouterMiddlewares
        >
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

  return new (class extends Middleware2 {
    request = options.request as TypeValidRequestFunction;
    response = options.response as TypeValidResponseFunction;
  })() as Middleware2 & {
    request: TRequestFunction;
    response: TResponseFunction;
  };
}

export function nestedMiddleware<TRouter extends DefaultRouterType>() {
  return <
    TRouterMiddlewares = TRouter extends BaseRouter<
      any,
      any,
      infer TInferMiddlewares,
      any
    >
      ? TInferMiddlewares extends readonly Middleware2[]
        ? TInferMiddlewares
        : never
      : never,
    TReturn extends Request<
      string,
      {
        Body: unknown;
        Headers: unknown;
        Context: unknown;
        Cookies: unknown;
      }
    > = Request<
      string,
      {
        Body: unknown;
        Headers: unknown;
        Context: unknown;
        Cookies: unknown;
      }
    >,
    TResponse extends DefaultResponseType = Response<{
      Status: undefined;
      Body: undefined;
      Headers: unknown;
      Context: unknown;
    }>,
    TRequestFunction = (
      request: TRouterMiddlewares extends readonly Middleware2[]
        ? ExtractRequestsFromMiddlewaresForServer<
            TRouter['path'],
            TRouterMiddlewares
          >
        : Request<
            string,
            {
              Body: unknown;
              Headers: unknown;
              Context: unknown;
              Cookies: unknown;
            }
          >
    ) => Promise<TReturn> | TReturn,
    TResponseFunction = (
      response: ExtractResponsesFromMiddlewaresRequestAndRouterHandlers<
        [TRouter]
      >
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

    return new (class extends Middleware2 {
      request = options.request as TypeValidRequestFunction;
      response = options.response as TypeValidResponseFunction;
    })() as Middleware2 & {
      request: TRequestFunction;
      response: TResponseFunction;
    };
  };
}
