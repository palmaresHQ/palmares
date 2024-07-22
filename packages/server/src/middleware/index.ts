import type { ExtractRequestsFromMiddlewaresForServer, MiddlewareOptions } from './types';
import type Request from '../request';
import type {
  DefaultRequestType,
  RequestCache,
  RequestCredentials,
  RequestDestination,
  RequestMethodTypes,
  RequestMode,
  RequestRedirect,
} from '../request/types';
import type Response from '../response';
import type { DefaultResponseType, ExtractResponsesFromMiddlewaresRequestAndRouterHandlers } from '../response/types';
import type { BaseRouter } from '../router/routers';
import type { DefaultRouterType } from '../router/types';

/**
 * This class is used to create a new {@link Middleware} instance.
 *
 * First, it's important to understand how middlewares work: Middlewares are executed in the order they are declared: `middlewares([middleware1, middleware2])`
 *
 * The execution lifecycle will be
 * _____________________________________________________________
 * |   V  middleware1.request  |   //>   middleware1.response  |
 * |--||-----------------------|--||---------------------------|
 * |  ||  middleware2.request  |  || middleware2.response      |
 * |--||-----------------------|--||---------------------------|
 * |  \\>  handler ------------|--^                           |
 * |-------------------------- |-------------------------------|
 *
 * In other words:
 * 1. middleware1.request is executed
 * 2. middleware2.request is executed
 * 3. handler is executed
 * 4. middleware2.response is executed
 * 5. middleware1.response is executed
 *
 * It works like an onion (the vegetable), we go IN the onion, the center is the handler and then we go OUT of the onion on the reversed order. Let's say we return a {@link Response}
 * on middleware1.request, the handler will not be executed, and `middleware2.response` will never be executed, just `middleware1.response`.
 *
 * Second, on the middleware, during the request lifecycle, there are two types of things you can do:
 * 1. You usually use a middleware to change the request until it reaches the handler
 * 2. OR you can use a middleware to respond to the request before it reaches the handler.
 *
 * This means the `request` can have return either a {@link Request} or a {@link Response}.
 *
 * The only usage of `response` is to make changes to {@link Response} before it is sent to the client, like filtering out properties, adding headers, whatever.
 *
 * @example
 * ```ts
 * import { Middleware, Response, HTTP_401_UNAUTHORIZED } from '@palmares/server';
 *
 * export class AuthenticateMiddleware extends Middleware {
 *    request: async (request) => {
 *      const bearerAuth = request.headers['Authorization'];
 *      // make validation
 *      if (isValid) {
 *         const user = await getUserFromToken(bearerAuth);
 *         const requestWithUser = request.clone({
 *            context: { user },
 *         });
 *         return requestWithUser;
 *      }
 *      return Response.json({ message: 'Unauthorized' }, { status: HTTP_401_UNAUTHORIZED });
 *   },
 *   response: (response) => {
 *     const responseWithHeaders = response.clone({
 *        headers: {
 *          'X-Server': 'Palmares',
 *        },
 *      });
 *     return responseWithHeaders;
 *   },
 * }
 * ```
 */
export class Middleware<TRouter extends DefaultRouterType = DefaultRouterType> {
  /**
   * This function is executed during the request lifecycle. It can return a {@link Request} or a {@link Response}.
   *
   * If it returns a {@link Request}, the request will be passed to the next middleware or handler. If it's a {@link Response}, the response
   * will be sent to the passed middlewares until it's sent to the client.
   *
   * ### IMPORTANT
   *
   * Using `middleware` function it's nice if you explicitly define how the {@link Request} will enter the function. This way we can correctly type the Request on the client. We will know
   * how the data needs to be sent to the server.
   *
   * ### IMPORTANT2
   *
   * If you don't explicitly type the Request, at least explicitly type the returned {@link Request}. This way we can correctly type the request on the handler.
   *
   * @example
   * ```ts
   * import { Middleware, Response, HTTP_401_UNAUTHORIZED } from '@palmares/server';
   *
   * export class AuthenticateMiddleware extends Middleware {
   *    request: async (request: Request<string, { headers: { 'x-string'}}) => {
   *      const bearerAuth = request.headers['Authorization'];
   *      // make validation
   *      if (isValid) {
   *        const user = await getUserFromToken(bearerAuth);
   *       const requestWithUser = request.clone({
   *         context: { user },
   *       });
   *      return requestWithUser;
   *    }
   *    return Response.json({ message: 'Unauthorized' }, { status: HTTP_401_UNAUTHORIZED });
   *  },
   * }
   * ```
   *
   * @param request - An instance of {@link Request} with the data.
   *
   * @returns - A {@link Request} instance with the modified data or a {@link Response} instance if you want to break the middleware chain.
   */
  request:
    | ((
        request: ExtractRequestsFromMiddlewaresForServer<
          TRouter['path'],
          TRouter extends BaseRouter<any, any, infer TInferMiddlewares, any>
            ? TInferMiddlewares extends readonly Middleware[]
              ? TInferMiddlewares
              : []
            : []
        >
      ) => Promise<DefaultRequestType | DefaultResponseType> | DefaultRequestType | DefaultResponseType)
    | undefined = undefined;

  /**
   * This function is executed during the response lifecycle. It needs to return a {@link Response} instance. Usually you will use this to either change the sent response entirely or
   * to add some headers/data to the response or filter out some properties.
   *
   * @example
   * ```ts
   * import { Middleware, Response, HTTP_401_UNAUTHORIZED } from '@palmares/server';
   *
   * export class HelmetMiddleware extends Middleware {
   *    response: async (response) => {
   *      // Filter out properties
   *      const responseWithHeaders = response.clone({
   *         headers: newHeaders
   *      });
   *      return responseWithHeaders;
   *    },
   * };
   * ```
   *
   * @param response - An instance of {@link Response} with the data.
   *
   * @returns - A {@link Response} instance with the modified data.
   */
  response:
    | ((
        response: ExtractResponsesFromMiddlewaresRequestAndRouterHandlers<[TRouter]>
      ) => Promise<DefaultResponseType> | DefaultResponseType)
    | undefined = undefined;

  options?: MiddlewareOptions | undefined = undefined;
}

/**
 * This function is used to create a new {@link Middleware} instance. It's a syntatic sugar over the inheritance/class approach.
 *
 * First, it's important to understand how middlewares work: Middlewares are executed in the order they are declared: `middlewares([middleware1, middleware2])`
 *
 * The execution lifecycle will be
 * _____________________________________________________________
 * |   V  middleware1.request  |   //>   middleware1.response  |
 * |--||-----------------------|--||---------------------------|
 * |  ||  middleware2.request  |  || middleware2.response      |
 * |--||-----------------------|--||---------------------------|
 * |  \\>  handler ------------|--^                           |
 * |-------------------------- |-------------------------------|
 *
 * In other words:
 * 1. middleware1.request is executed
 * 2. middleware2.request is executed
 * 3. handler is executed
 * 4. middleware2.response is executed
 * 5. middleware1.response is executed
 *
 * It works like an onion (the vegetable), we go IN the onion, the center is the handler and then we go OUT of the onion on the reversed order. Let's say we return a {@link Response}
 * on middleware1.request, the handler will not be executed, and `middleware2.response` will never be executed, just `middleware1.response`.
 *
 * Second, on the middleware, during the request lifecycle, there are two types of things you can do:
 * 1. You usually use a middleware to change the request until it reaches the handler
 * 2. OR you can use a middleware to respond to the request before it reaches the handler.
 *
 * This means the `request` can have return either a {@link Request} or a {@link Response}.
 *
 * The only usage of `response` is to make changes to {@link Response} before it is sent to the client, like filtering out properties, adding headers, whatever.
 *
 * @example
 * ```ts
 * import { middleware, Response, HTTP_401_UNAUTHORIZED } from '@palmares/server';
 *
 * export const authenticateMiddleware = middleware({
 *    request: (request) => {
 *      const bearerAuth = request.headers['Authorization'];
 *      // make validation
 *      if (isValid) {
 *         const user = await getUserFromToken(bearerAuth);
 *         const requestWithUser = request.clone({
 *            context: { user },
 *         });
 *         return requestWithUser;
 *      }
 *      return Response.json({ message: 'Unauthorized' }, { status: HTTP_401_UNAUTHORIZED });
 *   },
 *   response: (response) => {
 *     const responseWithHeaders = response.clone({
 *        headers: {
 *          'X-Server': 'Palmares',
 *        },
 *      });
 *     return responseWithHeaders;
 *   },
 * });
 * ```
 */
export function middleware<
  TRouter extends DefaultRouterType,
  TOptions extends MiddlewareOptions,
  TReturnOfResponseFunction extends Response<any, any> = never,
  TReturnOfRequestFunction extends Request<any, any> | Response<any, any> = never,
  TRouterMiddlewares = TRouter extends BaseRouter<any, any, infer TInferMiddlewares, any>
    ? TInferMiddlewares extends readonly Middleware[]
      ? TInferMiddlewares
      : never
    : never,
  TRequest extends Request<any, any> | undefined = undefined,
>(options: {
  /**
   * This function is executed during the request lifecycle. It can return a {@link Request} or a {@link Response}.
   *
   * If it returns a {@link Request}, the request will be passed to the next middleware or handler. If it's a {@link Response}, the response
   * will be sent to the passed middlewares until it's sent to the client.
   *
   * ### IMPORTANT
   *
   * Using `middleware` function it's nice if you explicitly define how the {@link Request} will enter the function. This way we can correctly type the Request on the client. We will know
   * how the data needs to be sent to the server.
   *
   * ### IMPORTANT2
   *
   * If you don't explicitly type the Request, at least explicitly type the returned {@link Request}. This way we can correctly type the request on the handler.
   *
   * @example
   * ```ts
   * import { middleware, Response, HTTP_401_UNAUTHORIZED } from '@palmares/server';
   *
   * export const authenticateMiddleware = middleware({
   *    request: (request: Request<string, { headers: { 'x-string'}}) => {
   *      const bearerAuth = request.headers['Authorization'];
   *      // make validation
   *      if (isValid) {
   *        const user = await getUserFromToken(bearerAuth);
   *       const requestWithUser = request.clone({
   *         context: { user },
   *       });
   *      return requestWithUser;
   *    }
   *    return Response.json({ message: 'Unauthorized' }, { status: HTTP_401_UNAUTHORIZED });
   *  },
   * });
   * ```
   *
   * @param request - An instance of {@link Request} with the data.
   *
   * @returns - A {@link Request} instance with the modified data or a {@link Response} instance if you want to break the middleware chain.
   */
  request?: (
    request: TRouterMiddlewares extends readonly Middleware[]
      ? ExtractRequestsFromMiddlewaresForServer<
          TRouter['path'],
          TRouterMiddlewares,
          RequestMethodTypes,
          TOptions['responses']
        >
      : Request<
          TRouter['path'],
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
            responses: TOptions['responses'];
            referrerPolicy: ReferrerPolicy;
            redirect: RequestRedirect;
          }
        >
  ) => TReturnOfRequestFunction | Promise<TReturnOfRequestFunction>;
  /**
   * This function is executed during the response lifecycle. It needs to return a {@link Response} instance. Usually you will use this to either change the sent response entirely or
   * to add some headers/data to the response or filter out some properties.
   *
   * @example
   * ```ts
   * import { middleware, Response, HTTP_401_UNAUTHORIZED } from '@palmares/server';
   *
   * export const helmetMiddleware = middleware({
   *    response: (response) => {
   *      // Filter out properties
   *      const responseWithHeaders = response.clone({
   *         headers: newHeaders
   *      });
   *      return responseWithHeaders;
   *    },
   * });
   * ```
   *
   * @param response - An instance of {@link Response} with the data.
   *
   * @returns - A {@link Response} instance with the modified data.
   */
  response?: (
    response: (
      | Exclude<TReturnOfRequestFunction, Request<any, any>>
      | ExtractResponsesFromMiddlewaresRequestAndRouterHandlers<[TRouter]>
    ) & {
      responses: TRouterMiddlewares extends readonly Middleware[]
        ? ExtractRequestsFromMiddlewaresForServer<
            TRouter['path'],
            TRouterMiddlewares,
            RequestMethodTypes,
            TOptions['responses']
          >['responses']
        : TOptions['responses'];
    }
  ) => Promise<TReturnOfResponseFunction> | TReturnOfResponseFunction;

  /**
   * Options are custom options that you can pass to the middleware. Usually, those options will exist on the {@link Request} or {@link Response} instances.
   *
   * @example
   * ```ts
   * import { middleware, Response, path } from '@palmares/server';
   *
   * export const helmetMiddleware = middleware({
   *    options: {
   *      responses: {
   *       '200': (message: string) => Response.json({ message }, { status: 200 }),
   *      }
   *   },
   * });
   *
   * path('/test').middlewares([helmetMiddleware]).get((request) => {
   *   // return Response.json({ aDifferentBody: 20 }) // this will fail
   *   return request.responses['200']('hello');
   * });
   * ```
   *
   * @param options - The options passed to the middleware.
   * @param options.responses - The responses that the middleware can return, this will enforce that the response returned from the handler
   * is one of the responses defined here.
   */
  options?: TOptions;
}) {
  return new (class extends Middleware {
    request = options.request as any;
    response = options.response as any;
    options = options.options as any;
  })() as Omit<Middleware, 'options'> & {
    request: (
      request: TRouterMiddlewares extends readonly Middleware[]
        ? ExtractRequestsFromMiddlewaresForServer<
            TRouter['path'],
            TRouterMiddlewares,
            RequestMethodTypes,
            TOptions['responses']
          >
        : string
    ) => TReturnOfRequestFunction | Promise<TReturnOfRequestFunction>;
    response: (
      response: (
        | Exclude<TReturnOfRequestFunction, Request<any, any>>
        | ExtractResponsesFromMiddlewaresRequestAndRouterHandlers<[TRouter]>
      ) & {
        responses: TRouterMiddlewares extends readonly Middleware[]
          ? ExtractRequestsFromMiddlewaresForServer<
              TRouter['path'],
              TRouterMiddlewares,
              RequestMethodTypes,
              TOptions['responses']
            >['responses']
          : TOptions['responses'];
      }
    ) => Promise<TReturnOfResponseFunction> | TReturnOfResponseFunction;
    options: TOptions extends undefined ? undefined : TOptions;
  };
}

/**
 * This functions is used to create a new {@link Middleware} instance. It's a syntatic sugar over the inheritance/class approach.
 * This function is pretty much the same as {@link middleware}, but it is preferred over {@link middleware} when you want to create a middleware typesafe middleware for a specific router.
 *
 * See {@link middleware} for more information about how middlewares work in Palmares and it's lifecycle.
 *
 * @example
 * ```ts
 * import { nestedMiddleware, Response, HTTP_401_UNAUTHORIZED } from '@palmares/server';
 *
 * import type { baseRouter } from './routes';
 *
 * export const typingTestAuthenticateUserMiddleware = nestedMiddleware<typeof baseRouter>()({
 *    // This request is fully typed from the router, it contains the properties and the path of the router
 *    request: (request) => {
 *      const customRequest = request.clone<{
 *        context: { user: number };
 *      }>();
 *     return customRequest;
 *   },
 *   // This response is fully typed from the router, it will contain the properties you return from the router handlers.
 *   response: (response) => {
 *     const modifiedResponse = response.clone();
 *     return modifiedResponse;
 *   },
 * });
 * ```
 */
export function nestedMiddleware<TRouter extends DefaultRouterType>() {
  return <
    TOptions extends MiddlewareOptions,
    TReturnOfResponseFunction extends Response<any, any> = never,
    TReturnOfRequestFunction extends Request<any, any> | Response<any, any> = never,
    TRouterMiddlewares = TRouter extends BaseRouter<any, any, infer TInferMiddlewares, any>
      ? TInferMiddlewares extends readonly Middleware[]
        ? TInferMiddlewares
        : never
      : never,
  >(options: {
    /**
     * This function is executed during the request lifecycle. It can return a {@link Request} or a {@link Response}.
     *
     * If it returns a {@link Request}, the request will be passed to the next middleware or handler. If it's a {@link Response}, the response
     * will be sent to the passed middlewares until it's sent to the client.
     *
     * ### IMPORTANT
     *
     * Using `middleware` function it's nice if you explicitly define how the {@link Request} will enter the function. This way we can correctly type the Request on the client. We will know
     * how the data needs to be sent to the server.
     *
     * ### IMPORTANT2
     *
     * If you don't explicitly type the Request, at least explicitly type the returned {@link Request}. This way we can correctly type the request on the handler.
     *
     * @example
     * ```ts
     * import { middleware, Response, HTTP_401_UNAUTHORIZED } from '@palmares/server';
     *
     * export const authenticateMiddleware = middleware({
     *    request: (request: Request<string, { headers: { 'x-string'}}) => {
     *      const bearerAuth = request.headers['Authorization'];
     *      // make validation
     *      if (isValid) {
     *        const user = await getUserFromToken(bearerAuth);
     *       const requestWithUser = request.clone({
     *         context: { user },
     *       });
     *      return requestWithUser;
     *    }
     *    return Response.json({ message: 'Unauthorized' }, { status: HTTP_401_UNAUTHORIZED });
     *  },
     * });
     * ```
     *
     * @param request - An instance of {@link Request} with the data.
     *
     * @returns - A {@link Request} instance with the modified data or a {@link Response} instance if you want to break the middleware chain.
     */
    request?: (
      request: TRouterMiddlewares extends readonly Middleware[]
        ? ExtractRequestsFromMiddlewaresForServer<
            TRouter['path'],
            TRouterMiddlewares,
            RequestMethodTypes,
            TOptions['responses']
          >
        : Request<
            TRouter['path'],
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
              responses: TOptions['responses'];
              referrerPolicy: ReferrerPolicy;
              redirect: RequestRedirect;
            }
          >
    ) => TReturnOfRequestFunction | Promise<TReturnOfRequestFunction>;
    /**
     * This function is executed during the response lifecycle. It needs to return a {@link Response} instance. Usually you will use this to either change the sent response entirely or
     * to add some headers/data to the response or filter out some properties.
     *
     * @example
     * ```ts
     * import { middleware, Response, HTTP_401_UNAUTHORIZED } from '@palmares/server';
     *
     * export const helmetMiddleware = middleware({
     *    response: (response) => {
     *      // Filter out properties
     *      const responseWithHeaders = response.clone({
     *         headers: newHeaders
     *      });
     *      return responseWithHeaders;
     *    },
     * });
     * ```
     *
     * @param response - An instance of {@link Response} with the data.
     *
     * @returns - A {@link Response} instance with the modified data.
     */
    response?: (
      response: (
        | Exclude<TReturnOfRequestFunction, Request<any, any>>
        | ExtractResponsesFromMiddlewaresRequestAndRouterHandlers<[TRouter]>
      ) & {
        responses: TRouterMiddlewares extends readonly Middleware[]
          ? ExtractRequestsFromMiddlewaresForServer<
              TRouter['path'],
              TRouterMiddlewares,
              RequestMethodTypes,
              TOptions['responses']
            >['responses']
          : TOptions['responses'];
      }
    ) => Promise<TReturnOfResponseFunction> | TReturnOfResponseFunction;

    /**
     * Options are custom options that you can pass to the middleware. Usually, those options will exist on the {@link Request} or {@link Response} instances.
     *
     * @example
     * ```ts
     * import { middleware, Response, path } from '@palmares/server';
     *
     * export const helmetMiddleware = middleware({
     *    options: {
     *      responses: {
     *       '200': (message: string) => Response.json({ message }, { status: 200 }),
     *      }
     *   },
     * });
     *
     * path('/test').middlewares([helmetMiddleware]).get((request) => {
     *   // return Response.json({ aDifferentBody: 20 }) // this will fail
     *   return request.responses['200']('hello');
     * });
     * ```
     *
     * @param options - The options passed to the middleware.
     * @param options.responses - The responses that the middleware can return, this will enforce that the response returned from the handler
     * is one of the responses defined here.
     */
    options?: TOptions;
  }) => {
    return new (class extends Middleware {
      request = options.request as any;
      response = options.response as any;
      options = options.options as any;
    })() as Omit<Middleware, 'options'> & {
      options: TOptions extends undefined ? undefined : TOptions;
      request: (
        request: TRouterMiddlewares extends readonly Middleware[]
          ? ExtractRequestsFromMiddlewaresForServer<
              TRouter['path'],
              TRouterMiddlewares,
              RequestMethodTypes,
              TOptions['responses']
            >
          : Request<
              TRouter['path'],
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
                responses: TOptions['responses'];
                referrerPolicy: ReferrerPolicy;
                redirect: RequestRedirect;
              }
            >
      ) => TReturnOfRequestFunction | Promise<TReturnOfRequestFunction>;
      response: (
        response: ExtractResponsesFromMiddlewaresRequestAndRouterHandlers<[TRouter]>
      ) => Promise<TReturnOfResponseFunction> | TReturnOfResponseFunction;
    };
  };
}

export function requestMiddleware<
  TRequest extends Request<any, any>,
  TRouter extends DefaultRouterType = DefaultRouterType,
>() {
  return <
    TOptions extends MiddlewareOptions,
    TReturnOfResponseFunction extends Response<any, any> = never,
    TReturnOfRequestFunction extends Request<any, any> | Response<any, any> = never,
    TRouterMiddlewares = TRouter extends BaseRouter<any, any, infer TInferMiddlewares, any>
      ? TInferMiddlewares extends readonly Middleware[]
        ? TInferMiddlewares
        : never
      : never,
  >(options: {
    /**
     * This function is executed during the request lifecycle. It can return a {@link Request} or a {@link Response}.
     *
     * If it returns a {@link Request}, the request will be passed to the next middleware or handler. If it's a {@link Response}, the response
     * will be sent to the passed middlewares until it's sent to the client.
     *
     * ### IMPORTANT
     *
     * Using `middleware` function it's nice if you explicitly define how the {@link Request} will enter the function. This way we can correctly type the Request on the client. We will know
     * how the data needs to be sent to the server.
     *
     * ### IMPORTANT2
     *
     * If you don't explicitly type the Request, at least explicitly type the returned {@link Request}. This way we can correctly type the request on the handler.
     *
     * @example
     * ```ts
     * import { middleware, Response, HTTP_401_UNAUTHORIZED } from '@palmares/server';
     *
     * export const authenticateMiddleware = middleware({
     *    request: (request: Request<string, { headers: { 'x-string'}}) => {
     *      const bearerAuth = request.headers['Authorization'];
     *      // make validation
     *      if (isValid) {
     *        const user = await getUserFromToken(bearerAuth);
     *       const requestWithUser = request.clone({
     *         context: { user },
     *       });
     *      return requestWithUser;
     *    }
     *    return Response.json({ message: 'Unauthorized' }, { status: HTTP_401_UNAUTHORIZED });
     *  },
     * });
     * ```
     *
     * @param request - An instance of {@link Request} with the data.
     *
     * @returns - A {@link Request} instance with the modified data or a {@link Response} instance if you want to break the middleware chain.
     */
    request?: (request: TRequest) => TReturnOfRequestFunction | Promise<TReturnOfRequestFunction>;
    /**
     * This function is executed during the response lifecycle. It needs to return a {@link Response} instance. Usually you will use this to either change the sent response entirely or
     * to add some headers/data to the response or filter out some properties.
     *
     * @example
     * ```ts
     * import { middleware, Response, HTTP_401_UNAUTHORIZED } from '@palmares/server';
     *
     * export const helmetMiddleware = middleware({
     *    response: (response) => {
     *      // Filter out properties
     *      const responseWithHeaders = response.clone({
     *         headers: newHeaders
     *      });
     *      return responseWithHeaders;
     *    },
     * });
     * ```
     *
     * @param response - An instance of {@link Response} with the data.
     *
     * @returns - A {@link Response} instance with the modified data.
     */
    response?: (
      response: (
        | Exclude<TReturnOfRequestFunction, Request<any, any>>
        | ExtractResponsesFromMiddlewaresRequestAndRouterHandlers<[TRouter]>
      ) & {
        responses: TRouterMiddlewares extends readonly Middleware[]
          ? ExtractRequestsFromMiddlewaresForServer<
              TRouter['path'],
              TRouterMiddlewares,
              RequestMethodTypes,
              TOptions['responses']
            >['responses']
          : TOptions['responses'];
      }
    ) => Promise<TReturnOfResponseFunction> | TReturnOfResponseFunction;

    /**
     * Options are custom options that you can pass to the middleware. Usually, those options will exist on the {@link Request} or {@link Response} instances.
     *
     * @example
     * ```ts
     * import { middleware, Response, path } from '@palmares/server';
     *
     * export const helmetMiddleware = middleware({
     *    options: {
     *      responses: {
     *       '200': (message: string) => Response.json({ message }, { status: 200 }),
     *      }
     *   },
     * });
     *
     * path('/test').middlewares([helmetMiddleware]).get((request) => {
     *   // return Response.json({ aDifferentBody: 20 }) // this will fail
     *   return request.responses['200']('hello');
     * });
     * ```
     *
     * @param options - The options passed to the middleware.
     * @param options.responses - The responses that the middleware can return, this will enforce that the response returned from the handler
     * is one of the responses defined here.
     */
    options?: TOptions;
  }) => {
    return new (class extends Middleware {
      request = options.request as any;
      response = options.response as any;
      options = options.options as any;
    })() as Omit<Middleware, 'options'> & {
      options: TOptions extends undefined ? undefined : TOptions;
      request: (
        request: TRouterMiddlewares extends readonly Middleware[]
          ? ExtractRequestsFromMiddlewaresForServer<
              TRouter['path'],
              TRouterMiddlewares,
              RequestMethodTypes,
              TOptions['responses']
            >
          : Request<
              TRouter['path'],
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
                responses: TOptions['responses'];
                referrerPolicy: ReferrerPolicy;
                redirect: RequestRedirect;
              }
            >
      ) => TReturnOfRequestFunction | Promise<TReturnOfRequestFunction>;
      response: (
        response: ExtractResponsesFromMiddlewaresRequestAndRouterHandlers<[TRouter]>
      ) => Promise<TReturnOfResponseFunction> | TReturnOfResponseFunction;
    };
  };
}
