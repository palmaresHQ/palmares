import type Response from '.';
import type { Middleware2 } from '../middleware';
import type Request from '../request';
import type { BaseRouter } from '../router/routers';
import type {
  DefaultRouterType,
  ExtractAllHandlersType,
} from '../router/types';

// This is used to extract the Response modifier from the middlewares. When you return a response from `response` method/function
// We understand that you are making a modification to the response. This means you are attaching stuff to that response.
type ModifiedResponsesFromMiddlewares<
  TFinalResponse extends Response<{
    Body: any;
    Context: any;
    Headers: any;
    Status: any;
  }>,
  TMiddlewares extends readonly Middleware2[] = []
> = TMiddlewares extends [...infer TRestMiddlewares, infer TLastMiddleware]
  ? TLastMiddleware extends Middleware2
    ? TLastMiddleware['response'] extends (
        response: Response<any>
      ) => Promise<infer TResponse> | infer TResponse
      ? TResponse extends Response<any>
        ? ModifiedResponsesFromMiddlewares<
            Response<{
              Body: TResponse['body'] extends undefined
                ? TFinalResponse['body']
                : TResponse['body'];
              Status: TFinalResponse['status'];
              Headers: TResponse['headers'] & TFinalResponse['headers'];
              Context: TResponse['context'] & TFinalResponse['context'];
            }>,
            TRestMiddlewares extends readonly Middleware2[]
              ? TRestMiddlewares
              : []
          >
        : never
      : never
    : ModifiedResponsesFromMiddlewares<
        TFinalResponse,
        TRestMiddlewares extends readonly Middleware2[] ? TRestMiddlewares : []
      >
  : TFinalResponse;

// Used for extracting the response from the handlers and of the middlewares
export type ExtractResponsesFromMiddlewaresRequestAndRouterHandlers<
  TRouters extends DefaultRouterType[] | Omit<DefaultRouterType, never>[]
> =
  | (ExtractAllHandlersType<TRouters> extends (
      request: any
    ) => infer TResponse | Promise<infer TResponse>
      ? TResponse extends Response<any>
        ? TResponse
        : never
      : never)
  | ExtractResponsesFromMiddlewaresRequestFromRouters<TRouters>
  | Response;

// This will extract all of the responses from the middlewares of a tuple of routers.
// You pass first a tuple of routers and then it will extract all of the responses from the `request` function
// of those middlewares. It gets the children routers as well.
export type ExtractResponsesFromMiddlewaresRequestFromRouters<
  TRouters extends DefaultRouterType[] | Omit<DefaultRouterType, never>[]
> = TRouters extends [infer TFirstRouter, ...infer TRestRouters]
  ? TFirstRouter extends
      | BaseRouter<any, infer TRouterChildren, infer TMiddlewares, any, any>
      | Omit<
          BaseRouter<any, infer TRouterChildren, infer TMiddlewares, any, any>,
          never
        >
    ? TMiddlewares extends readonly Middleware2[]
      ?
          | ExtractResponsesFromMiddlewaresRequest<TMiddlewares>
          | (TRouterChildren extends
              | DefaultRouterType[]
              | Omit<DefaultRouterType, never>[]
              ? ExtractResponsesFromMiddlewaresRequestFromRouters<TRouterChildren>
              : never)
          | (TRestRouters extends
              | DefaultRouterType[]
              | Omit<DefaultRouterType, never>[]
              ? ExtractResponsesFromMiddlewaresRequestFromRouters<TRestRouters>
              : never)
      :
          | (TRouterChildren extends
              | DefaultRouterType[]
              | Omit<DefaultRouterType, never>[]
              ? ExtractResponsesFromMiddlewaresRequestFromRouters<TRouterChildren>
              : never)
          | (TRestRouters extends
              | DefaultRouterType[]
              | Omit<DefaultRouterType, never>[]
              ? ExtractResponsesFromMiddlewaresRequestFromRouters<TRestRouters>
              : never)
    : TRestRouters extends
        | DefaultRouterType[]
        | Omit<DefaultRouterType, never>[]
    ? ExtractResponsesFromMiddlewaresRequestFromRouters<TRestRouters>
    : never
  : never;

// This is used to extract all the responses from the `request` functions of the middlewares.
// This works as an recursion that keeps track of the previous middlewares, so when a request fires a response
// we can know how this response will be modified by the previous middlewares.
export type ExtractResponsesFromMiddlewaresRequest<
  TMiddlewares extends readonly Middleware2[],
  TMiddlewaresPassed extends readonly Middleware2[] = [],
  TFinalResponses extends Response<{
    Body: any;
    Context: any;
    Headers: any;
    Status: any;
  }> = never
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
      ) => Promise<infer TResponseOrRequest> | infer TResponseOrRequest
      ? Exclude<TResponseOrRequest, Request<any, any>> extends never
        ? ExtractResponsesFromMiddlewaresRequest<
            TRestMiddlewares extends readonly Middleware2[]
              ? TRestMiddlewares
              : [],
            [...TMiddlewaresPassed, TFirstMiddie],
            TFinalResponses
          >
        : TResponseOrRequest extends Response<any>
        ? ExtractResponsesFromMiddlewaresRequest<
            TRestMiddlewares extends readonly Middleware2[]
              ? TRestMiddlewares
              : [],
            [...TMiddlewaresPassed, TFirstMiddie],
            | ModifiedResponsesFromMiddlewares<
                Exclude<TResponseOrRequest, Request<any, any>>,
                [...TMiddlewaresPassed, TFirstMiddie]
              >
            | TFinalResponses
          >
        : never
      : never
    : never
  : TFinalResponses;

export type DefaultResponseType = Response<{
  Status: any;
  Body: any;
  Headers: any;
  Context: any;
}>;
