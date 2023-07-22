import type { DefaultRouterType } from '../router/types';
import type { ExtractRequestsFromMiddlewares } from './types';
import type { DefaultRequestType } from '../request/types';
import type { BaseRouter } from '../router/routers';
import type Request from '../request';

export class Middleware2 {
  request:
    | ((
        request: DefaultRequestType
      ) => Promise<DefaultRequestType> | DefaultRequestType)
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
      Data: unknown;
      Headers: unknown;
      Context: unknown;
      Cookies: unknown;
    }
  >,
  TRequestFunction = (
    request: TRouterMiddlewares extends readonly Middleware2[]
      ? ExtractRequestsFromMiddlewares<TRouter['path'], TRouterMiddlewares>
      : never
  ) => Promise<TReturn> | TReturn
>(options: { request: TRequestFunction }) {
  type TypeValidRequestFunction = TRequestFunction extends (
    request: DefaultRequestType
  ) => Promise<DefaultRequestType> | DefaultRequestType
    ? TRequestFunction
    : undefined;

  return new (class extends Middleware2 {
    request = options.request as TypeValidRequestFunction;
  })() as Middleware2 & { request: TRequestFunction };
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
        Data: unknown;
        Headers: unknown;
        Context: unknown;
        Cookies: unknown;
      }
    > = Request<
      string,
      {
        Data: unknown;
        Headers: unknown;
        Context: unknown;
        Cookies: unknown;
      }
    >,
    TRequestFunction = (
      request: TRouterMiddlewares extends readonly Middleware2[]
        ? ExtractRequestsFromMiddlewares<TRouter['path'], TRouterMiddlewares>
        : never
    ) => Promise<TReturn> | TReturn
  >(options: {
    request: TRequestFunction;
  }) => {
    type TypeValidRequestFunction = TRequestFunction extends (
      request: DefaultRequestType
    ) => Promise<DefaultRequestType> | DefaultRequestType
      ? TRequestFunction
      : undefined;

    return new (class extends Middleware2 {
      request = options.request as TypeValidRequestFunction;
    })() as Middleware2 & { request: TRequestFunction };
  };
}
