import type { Middleware } from '.';
import type Request from '../request';
import type {
  RequestCache,
  RequestCredentials,
  RequestDestination,
  RequestMethodTypes,
  RequestMode,
  RequestRedirect,
} from '../request/types';
import Response from '../response';
import { StatusCodes } from '../response/status';

/**
 * Remove the optional properties from an object.
 *
 * @example
 * ```ts
 * type Test = {
 *   a?: string;
 *   b: number;
 *   c?: boolean;
 * };
 * type WithoutOptionals = RemoveOptionals<Test>; // { b: number }
 * ```
 */
type RemoveOptionals<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

type Exact<A, B> = (<T>() => T extends A ? 1 : 0) extends <T>() => T extends B ? 1 : 0
  ? A extends B
    ? B extends A
      ? true
      : false
    : false
  : false;

/**
 * This will extract the request type by inferring the return type (when they are {@link Request}) of the `request` function of the middlewares.
 *
 * Important: Take extra care when changing this type because it's used for inferring the request type on the handler but also on the
 * middleware, so it's used in a lot of places and can break things.
 *
 * @generics TPath - The path from the router, this is the full path by joining all the routers together.
 * @generics TMiddlewares - All the middlewares used by the router, from the root router to the handler. This will be recursive, and it's used for inferring the request type.
 * @generics TMethod - The method used for the handler. Eg. 'GET' | 'POST', etc.
 * @generics TResponses - The responses that the handler can return. This is used for inferring the response type. Instead of using `Response.json()` the user will be able to use
 * `Response.json()` and the type will be inferred.
 * @generics TFinalRequest - This should not be defined, it's used for recursion.
 *
 * @returns - A new inferred {@link Request} instance.
 */
export type ExtractRequestsFromMiddlewaresForServer<
  TPath extends string,
  TMiddlewares extends readonly Middleware[],
  TMethod extends RequestMethodTypes = RequestMethodTypes,
  TResponses extends
    | {
        [TKey in StatusCodes]?: (...args: any[]) => Response<
          any,
          {
            context?: unknown;
            headers?: Record<string, string> | unknown;
            status: TKey;
          }
        >;
      }
    | undefined = undefined,
  TFinalRequest extends Request<any, any> = Request<
    TPath,
    {
      method: TMethod;
      headers: unknown;
      body: unknown;
      context: unknown;
      mode: RequestMode;
      cache: RequestCache;
      credentials: RequestCredentials;
      integrity: string;
      responses: TResponses extends object ? TResponses : undefined;
      destination: RequestDestination;
      referrer: string;
      referrerPolicy: ReferrerPolicy;
      redirect: RequestRedirect;
    }
  >
> = TMiddlewares extends readonly [infer TFirstMiddie, ...infer TRestMiddlewares]
  ? TFirstMiddie extends Middleware
    // On this use case the user might not have defined the request function, so we need to check if it's defined. If we don't do this, it'll return never.
    ? ReturnType<
        TFirstMiddie['request'] extends (...args: any[]) => any ? TFirstMiddie['request'] : (...args: any[]) => never
      > extends Promise<never> | never
      ? ExtractRequestsFromMiddlewaresForServer<
          TPath,
          TRestMiddlewares extends readonly Middleware[] ? TRestMiddlewares : [],
          TMethod,
          TResponses,
          TPath extends string
            ? Request<
              TPath,
              {
                method: TMethod;
                mode: TFinalRequest['mode'];
                body: TFinalRequest['body'];
                responses: TFirstMiddie extends { options: { responses: infer TResponses extends MiddlewareOptions['responses'] } }
                  ? RemoveOptionals<TResponses>
                  : undefined;
                headers: TFinalRequest['headers'];
                context: TFinalRequest['context'];
                cache: TFinalRequest['cache'];
                credentials: TFinalRequest['credentials'];
                integrity: TFinalRequest['integrity'];
                destination: TFinalRequest['destination'];
                referrer: TFinalRequest['referrer'];
                referrerPolicy: TFinalRequest['referrerPolicy'];
                redirect: TFinalRequest['redirect'];
              }
            >
            : TFinalRequest
        >
      : TFirstMiddie['request'] extends (request: Request<any, any>) => Promise<infer TRequest> | infer TRequest
      ? Extract<TRequest, Request<any, any>> extends Request<any, any>
        ? ExtractRequestsFromMiddlewaresForServer<
            TPath,
            TRestMiddlewares extends readonly Middleware[] ? TRestMiddlewares : [],
            TMethod,
            TResponses,
            TPath extends string
              ? Request<
                  TPath,
                  {
                    body: Extract<TRequest, Request<any, any>>['body'] & TFinalRequest['body'];
                    headers: Extract<TRequest, Request<any, any>>['headers'] & TFinalRequest['headers'];
                    context: Extract<TRequest, Request<any, any>>['context'] & TFinalRequest['context'];
                    responses: RemoveOptionals<Extract<TRequest, Request<any, any>>['responses']> &
                      RemoveOptionals<TFinalRequest['responses']> & RemoveOptionals<TResponses>;
                    method: TMethod;
                    mode: Extract<TRequest, Request<any, any>>['mode'] extends RequestMode
                      ? Extract<TRequest, Request<any, any>>['mode']
                      : TFinalRequest['mode'] extends RequestMode
                      ? TFinalRequest['mode']
                      : RequestMode;
                    cache: Extract<TRequest, Request<any, any>>['cache'] extends RequestCache
                      ? Extract<TRequest, Request<any, any>>['cache']
                      : TFinalRequest['cache'] extends RequestCache
                      ? TFinalRequest['cache']
                      : RequestCache;
                    credentials: Extract<TRequest, Request<any, any>>['credentials'] extends RequestCredentials
                      ? Extract<TRequest, Request<any, any>>['credentials']
                      : TFinalRequest['credentials'] extends RequestCredentials
                      ? TFinalRequest['credentials']
                      : RequestCredentials;
                    integrity: Extract<TRequest, Request<any, any>>['integrity'] extends string
                      ? Extract<TRequest, Request<any, any>>['integrity']
                      : TFinalRequest['integrity'] extends string
                      ? TFinalRequest['integrity']
                      : string;
                    destination: Extract<TRequest, Request<any, any>>['destination'] extends RequestDestination
                      ? Extract<TRequest, Request<any, any>>['destination']
                      : TFinalRequest['destination'] extends RequestDestination
                      ? TFinalRequest['destination']
                      : RequestDestination;
                    referrer: Extract<TRequest, Request<any, any>>['referrer'] extends string
                      ? Extract<TRequest, Request<any, any>>['referrer']
                      : TFinalRequest['referrer'] extends string
                      ? TFinalRequest['referrer']
                      : string;
                    referrerPolicy: Extract<TRequest, Request<any, any>>['referrer'] extends ReferrerPolicy
                      ? Extract<TRequest, Request<any, any>>['referrer']
                      : TFinalRequest['referrer'] extends ReferrerPolicy
                      ? TFinalRequest['referrer']
                      : ReferrerPolicy;
                    redirect: Extract<TRequest, Request<any, any>>['redirect'] extends RequestRedirect
                      ? Extract<TRequest, Request<any, any>>['redirect']
                      : TFinalRequest['redirect'] extends RequestRedirect
                      ? TFinalRequest['redirect']
                      : RequestRedirect;
                  }
                >
              : TFinalRequest
          >
        : ExtractRequestsFromMiddlewaresForServer<
            TPath,
            TRestMiddlewares extends readonly Middleware[] ? TRestMiddlewares : [],
            TMethod,
            TResponses,
            TPath extends string
              ? Request<
                  TPath,
                  {
                    method: TMethod;
                    mode: TFinalRequest['mode'];
                    body: TFinalRequest['body'];
                    responses: undefined extends TResponses
                      ? TFinalRequest['responses']
                      : undefined extends TFinalRequest['responses']
                      ? TResponses
                      : TResponses & TFinalRequest['responses'];
                    headers: TFinalRequest['headers'];
                    context: TFinalRequest['context'];
                    cache: TFinalRequest['cache'];
                    credentials: TFinalRequest['credentials'];
                    integrity: TFinalRequest['integrity'];
                    destination: TFinalRequest['destination'];
                    referrer: TFinalRequest['referrer'];
                    referrerPolicy: TFinalRequest['referrerPolicy'];
                    redirect: TFinalRequest['redirect'];
                  }
                >
              : TFinalRequest
          >
      : ExtractRequestsFromMiddlewaresForServer<
          TPath,
          TRestMiddlewares extends readonly Middleware[] ? TRestMiddlewares : [],
          TMethod,
          TResponses,
          TPath extends string
            ? Request<
                TPath,
                {
                  method: TMethod;
                  mode: TFinalRequest['mode'];
                  body: TFinalRequest['body'];
                  responses: undefined extends TResponses
                    ? TFinalRequest['responses']
                    : undefined extends TFinalRequest['responses']
                    ? TResponses
                    : TResponses & TFinalRequest['responses'];
                  headers: TFinalRequest['headers'];
                  context: TFinalRequest['context'];
                  cache: TFinalRequest['cache'];
                  credentials: TFinalRequest['credentials'];
                  integrity: TFinalRequest['integrity'];
                  destination: TFinalRequest['destination'];
                  referrer: TFinalRequest['referrer'];
                  referrerPolicy: TFinalRequest['referrerPolicy'];
                  redirect: TFinalRequest['redirect'];
                }
              >
            : TFinalRequest
        >
    : ExtractRequestsFromMiddlewaresForServer<
        TPath,
        TRestMiddlewares extends readonly Middleware[] ? TRestMiddlewares : [],
        TMethod,
        TResponses,
        TPath extends string
          ? Request<
              TPath,
              {
                method: TMethod;
                mode: TFinalRequest['mode'];
                body: TFinalRequest['body'];
                responses: undefined extends TResponses
                  ? TFinalRequest['responses']
                  : undefined extends TFinalRequest['responses']
                  ? TResponses
                  : TResponses & TFinalRequest['responses'];
                headers: TFinalRequest['headers'];
                context: TFinalRequest['context'];
                cache: TFinalRequest['cache'];
                credentials: TFinalRequest['credentials'];
                integrity: TFinalRequest['integrity'];
                destination: TFinalRequest['destination'];
                referrer: TFinalRequest['referrer'];
                referrerPolicy: TFinalRequest['referrerPolicy'];
                redirect: TFinalRequest['redirect'];
              }
            >
          : TFinalRequest
      >
  : TFinalRequest;

export type ExtractRequestsFromMiddlewaresForClient<
  TPath extends string,
  TMiddlewares extends readonly Middleware[],
  TPreviousServerRequest extends Request<any, any> = Request<
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
  TFinalRequestClient extends Request<any, any> = Request<
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
> = TMiddlewares extends readonly [infer TFirstMiddie, ...infer TRestMiddlewares]
  ? TFirstMiddie extends Middleware
    ? TFirstMiddie['request'] extends (
        request: infer TRequestClient
      ) => Promise<infer TRequestServer> | infer TRequestServer
      ? TRequestClient extends Request<any, any>
        ? TRequestServer extends Request<any, any>
          ? TPreviousServerRequest extends Request<any, any>
            ? Exact<
                {
                  method: TRequestClient['method'];
                  headers: TRequestClient['headers'];
                  body: TRequestClient['body'];
                  context: TRequestClient['context'];
                  mode: TRequestClient['mode'];
                  cache: TRequestClient['cache'];
                  credentials: TRequestClient['credentials'];
                  integrity: TRequestClient['integrity'];
                  destination: TRequestClient['destination'];
                  referrer: TRequestClient['referrer'];
                  referrerPolicy: TRequestClient['referrerPolicy'];
                  redirect: TRequestClient['redirect'];
                },
                {
                  method: TPreviousServerRequest['method'];
                  headers: TPreviousServerRequest['headers'];
                  body: TPreviousServerRequest['body'];
                  context: TPreviousServerRequest['context'];
                  mode: TPreviousServerRequest['mode'];
                  cache: TPreviousServerRequest['cache'];
                  credentials: TPreviousServerRequest['credentials'];
                  integrity: TPreviousServerRequest['integrity'];
                  destination: TPreviousServerRequest['destination'];
                  referrer: TPreviousServerRequest['referrer'];
                  referrerPolicy: TRequestClient['referrerPolicy'];
                  redirect: TPreviousServerRequest['redirect'];
                }
              > extends false // Prevents adding the requests modified by the middlewares, we should guarantee that the request is explicitly defined by the user.
              ? ExtractRequestsFromMiddlewaresForClient<
                  TPath,
                  TRestMiddlewares extends readonly Middleware[] ? TRestMiddlewares : [],
                  TRequestServer,
                  TPath extends string
                    ? Request<
                        TPath,
                        {
                          body: TRequestClient['body'] & TFinalRequestClient['body'];
                          headers: TRequestClient['headers'] & TFinalRequestClient['headers'];
                          context: TRequestClient['context'] & TFinalRequestClient['context'];
                          method: TRequestClient['method'] extends RequestMethodTypes
                            ? TRequestClient['method']
                            : TFinalRequestClient['method'] extends RequestMethodTypes
                            ? TFinalRequestClient['method']
                            : RequestMethodTypes;
                          mode: TRequestClient['mode'] extends RequestMode
                            ? TRequestClient['mode']
                            : TFinalRequestClient['mode'] extends RequestMode
                            ? TFinalRequestClient['mode']
                            : RequestMode;
                          cache: TRequestClient['cache'] extends RequestCache
                            ? TRequestClient['cache']
                            : TFinalRequestClient['cache'] extends RequestCache
                            ? TFinalRequestClient['cache']
                            : RequestCache;
                          credentials: TRequestClient['credentials'] extends RequestCredentials
                            ? TRequestClient['credentials']
                            : TFinalRequestClient['credentials'] extends RequestCredentials
                            ? TFinalRequestClient['credentials']
                            : RequestCredentials;
                          integrity: TRequestClient['integrity'] extends string
                            ? TRequestClient['integrity']
                            : TFinalRequestClient['integrity'] extends string
                            ? TFinalRequestClient['integrity']
                            : string;
                          destination: TRequestClient['destination'] extends RequestDestination
                            ? TRequestClient['destination']
                            : TFinalRequestClient['destination'] extends RequestDestination
                            ? TFinalRequestClient['destination']
                            : RequestDestination;
                          referrer: TRequestClient['referrer'] extends string
                            ? TFinalRequestClient['referrer']
                            : TFinalRequestClient['referrer'] extends string
                            ? TFinalRequestClient['referrer']
                            : string;
                          referrerPolicy: TRequestClient['referrer'] extends ReferrerPolicy
                            ? TRequestClient['referrer']
                            : TFinalRequestClient['referrer'] extends ReferrerPolicy
                            ? TFinalRequestClient['referrer']
                            : ReferrerPolicy;
                          redirect: TRequestClient['redirect'] extends RequestRedirect
                            ? TRequestClient['redirect']
                            : TFinalRequestClient['redirect'] extends RequestRedirect
                            ? TFinalRequestClient['redirect']
                            : RequestRedirect;
                        }
                      >
                    : TFinalRequestClient
                >
              : ExtractRequestsFromMiddlewaresForClient<
                  TPath,
                  TRestMiddlewares extends readonly Middleware[] ? TRestMiddlewares : [],
                  TRequestServer,
                  TFinalRequestClient
                >
            : never
          : never
        : never
      : never
    : never
  : TFinalRequestClient;

/**
 * This defines the options for the middleware, those are custom options that you pass to your middleware that will either be available
 * to the handler or to the {@link Request} or {@link Response} objects.
 */
export type MiddlewareOptions = {
  responses?:
    | {
        [TKey in StatusCodes]?: (...args: any[]) => Response<
          any,
          {
            context?: unknown;
            headers?: Record<string, string> | unknown;
            status: TKey;
          }
        >;
      }
    | undefined;
};
