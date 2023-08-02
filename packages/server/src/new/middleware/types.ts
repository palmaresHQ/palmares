import type { Middleware2 } from '.';
import type Request from '../request';
//import type Response from '../response';
//import { DefaultRequestType } from '../request/types';

type Exact<A, B> = (<T>() => T extends A ? 1 : 0) extends <T>() => T extends B
  ? 1
  : 0
  ? A extends B
    ? B extends A
      ? true
      : false
    : false
  : false;

export type ExtractRequestsFromMiddlewaresForServer<
  TPath extends string,
  TMiddlewares extends readonly Middleware2[],
  TFinalRequest extends Request<
    any,
    { Body: unknown; Headers: unknown; Cookies: unknown; Context: unknown }
  > = Request<
    string,
    { Body: unknown; Headers: unknown; Cookies: unknown; Context: unknown }
  >
> = TMiddlewares extends readonly [
  infer TFirstMiddie,
  ...infer TRestMiddlewares
]
  ? TFirstMiddie extends Middleware2
    ? TFirstMiddie['request'] extends (
        request: Request<
          any,
          { Body: any; Context: any; Headers: any; Cookies: any }
        >
      ) => Promise<infer TRequest> | infer TRequest
      ? TRequest extends Request<any, any>
        ? ExtractRequestsFromMiddlewaresForServer<
            TPath,
            TRestMiddlewares extends readonly Middleware2[]
              ? TRestMiddlewares
              : [],
            TPath extends string
              ? Request<
                  TPath,
                  {
                    Body: TRequest['body'] & TFinalRequest['body'];
                    Headers: TRequest['headers'] & TFinalRequest['headers'];
                    Cookies: TRequest['cookies'] & TFinalRequest['cookies'];
                    Context: TRequest['context'] & TFinalRequest['context'];
                  }
                >
              : TFinalRequest
          >
        : ExtractRequestsFromMiddlewaresForServer<
            TPath,
            TRestMiddlewares extends readonly Middleware2[]
              ? TRestMiddlewares
              : [],
            TPath extends string
              ? Request<
                  TPath,
                  {
                    Body: TFinalRequest['body'];
                    Headers: TFinalRequest['headers'];
                    Cookies: TFinalRequest['cookies'];
                    Context: TFinalRequest['context'];
                  }
                >
              : TFinalRequest
          >
      : never
    : ExtractRequestsFromMiddlewaresForServer<
        TPath,
        TRestMiddlewares extends readonly Middleware2[] ? TRestMiddlewares : [],
        TPath extends string
          ? Request<
              TPath,
              {
                Body: TFinalRequest['body'];
                Headers: TFinalRequest['headers'];
                Cookies: TFinalRequest['cookies'];
                Context: TFinalRequest['context'];
              }
            >
          : TFinalRequest
      >
  : TFinalRequest;

export type ExtractRequestsFromMiddlewaresForClient<
  TPath extends string,
  TMiddlewares extends readonly Middleware2[],
  TPreviousServerRequest extends Request<
    any,
    { Body: unknown; Headers: unknown; Cookies: unknown; Context: unknown }
  > = Request<
    string,
    { Body: unknown; Headers: unknown; Cookies: unknown; Context: unknown }
  >,
  TFinalRequestClient extends Request<
    any,
    { Body: unknown; Headers: unknown; Cookies: unknown; Context: unknown }
  > = Request<
    string,
    { Body: unknown; Headers: unknown; Cookies: unknown; Context: unknown }
  >
> = TMiddlewares extends readonly [
  infer TFirstMiddie,
  ...infer TRestMiddlewares
]
  ? TFirstMiddie extends Middleware2
    ? TFirstMiddie['request'] extends (
        request: infer TRequestClient
      ) => Promise<infer TRequestServer> | infer TRequestServer
      ? TRequestClient extends Request<any, any>
        ? TRequestServer extends Request<any, any>
          ? TPreviousServerRequest extends Request<any, any>
            ? Exact<
                {
                  Body: TRequestClient['body'];
                  Headers: TRequestClient['headers'];
                  Cookies: TRequestClient['cookies'];
                  Context: TRequestClient['context'];
                },
                {
                  Body: TPreviousServerRequest['body'];
                  Headers: TPreviousServerRequest['headers'];
                  Cookies: TPreviousServerRequest['cookies'];
                  Context: TPreviousServerRequest['context'];
                }
              > extends false // Prevents adding the requests modified by the middlewares, we should guarantee that the request is explicitly defined by the user.
              ? ExtractRequestsFromMiddlewaresForClient<
                  TPath,
                  TRestMiddlewares extends readonly Middleware2[]
                    ? TRestMiddlewares
                    : [],
                  TRequestServer,
                  TPath extends string
                    ? Request<
                        TPath,
                        {
                          Body: TRequestClient['body'] &
                            TFinalRequestClient['body'];
                          Headers: TRequestClient['headers'] &
                            TFinalRequestClient['headers'];
                          Cookies: TRequestClient['cookies'] &
                            TFinalRequestClient['cookies'];
                          Context: TRequestClient['context'] &
                            TFinalRequestClient['context'];
                        }
                      >
                    : TFinalRequestClient
                >
              : ExtractRequestsFromMiddlewaresForClient<
                  TPath,
                  TRestMiddlewares extends readonly Middleware2[]
                    ? TRestMiddlewares
                    : [],
                  TRequestServer,
                  TFinalRequestClient
                >
            : never
          : never
        : never
      : never
    : never
  : TFinalRequestClient;
