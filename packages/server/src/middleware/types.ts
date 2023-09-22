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
//import type Response from '../response';
//import { DefaultRequestType } from '../request/types';

type Exact<A, B> = (<T>() => T extends A ? 1 : 0) extends <T>() => T extends B ? 1 : 0
  ? A extends B
    ? B extends A
      ? true
      : false
    : false
  : false;

export type ExtractRequestsFromMiddlewaresForServer<
  TPath extends string,
  TMiddlewares extends readonly Middleware[],
  TMethod extends RequestMethodTypes = RequestMethodTypes,
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
      destination: RequestDestination;
      referrer: string;
      referrerPolicy: ReferrerPolicy;
      redirect: RequestRedirect;
    }
  >
> = TMiddlewares extends readonly [infer TFirstMiddie, ...infer TRestMiddlewares]
  ? TFirstMiddie extends Middleware
    ? TFirstMiddie['request'] extends (request: Request<any, any>) => Promise<infer TRequest> | infer TRequest
      ? TRequest extends Request<any, any>
        ? ExtractRequestsFromMiddlewaresForServer<
            TPath,
            TRestMiddlewares extends readonly Middleware[] ? TRestMiddlewares : [],
            TMethod,
            TPath extends string
              ? Request<
                  TPath,
                  {
                    body: TRequest['body'] & TFinalRequest['body'];
                    headers: TRequest['headers'] & TFinalRequest['headers'];
                    context: TRequest['context'] & TFinalRequest['context'];
                    method: TMethod;
                    mode: TRequest['mode'] extends RequestMode
                      ? TRequest['mode']
                      : TFinalRequest['mode'] extends RequestMode
                      ? TFinalRequest['mode']
                      : RequestMode;
                    cache: TRequest['cache'] extends RequestCache
                      ? TRequest['cache']
                      : TFinalRequest['cache'] extends RequestCache
                      ? TFinalRequest['cache']
                      : RequestCache;
                    credentials: TRequest['credentials'] extends RequestCredentials
                      ? TRequest['credentials']
                      : TFinalRequest['credentials'] extends RequestCredentials
                      ? TFinalRequest['credentials']
                      : RequestCredentials;
                    integrity: TRequest['integrity'] extends string
                      ? TRequest['integrity']
                      : TFinalRequest['integrity'] extends string
                      ? TFinalRequest['integrity']
                      : string;
                    destination: TRequest['destination'] extends RequestDestination
                      ? TRequest['destination']
                      : TFinalRequest['destination'] extends RequestDestination
                      ? TFinalRequest['destination']
                      : RequestDestination;
                    referrer: TRequest['referrer'] extends string
                      ? TRequest['referrer']
                      : TFinalRequest['referrer'] extends string
                      ? TFinalRequest['referrer']
                      : string;
                    referrerPolicy: TRequest['referrer'] extends ReferrerPolicy
                      ? TRequest['referrer']
                      : TFinalRequest['referrer'] extends ReferrerPolicy
                      ? TFinalRequest['referrer']
                      : ReferrerPolicy;
                    redirect: TRequest['redirect'] extends RequestRedirect
                      ? TRequest['redirect']
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
            TPath extends string
              ? Request<
                  TPath,
                  {
                    method: TMethod;
                    mode: TFinalRequest['mode'];
                    body: TFinalRequest['body'];
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
      : TFirstMiddie['request']
    : ExtractRequestsFromMiddlewaresForServer<
        TPath,
        TRestMiddlewares extends readonly Middleware[] ? TRestMiddlewares : [],
        TMethod,
        TPath extends string
          ? Request<
              TPath,
              {
                method: TMethod;
                mode: TFinalRequest['mode'];
                body: TFinalRequest['body'];
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
