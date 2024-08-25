import type Response from '.';
import type { Middleware } from '../middleware';
import type Request from '../request';
import type { BaseRouter } from '../router/routers';
import type { DefaultRouterType, ExtractAllHandlersType } from '../router/types';

// This is used to extract the Response modifier from the middlewares. When you return a response from
// `response` method/function
// We understand that you are making a modification to the response. This means you are attaching stuff
// to that response.
type ModifiedResponsesFromMiddlewares<
  TFinalResponse extends Response<
    any,
    {
      context: any;
      headers: any;
      status: any;
    }
  >,
  TMiddlewares extends readonly Middleware[] = []
> = TMiddlewares extends [...infer TRestMiddlewares, infer TLastMiddleware]
  ? TLastMiddleware extends Middleware
    ? TLastMiddleware['response'] extends (response: Response<any, any>) => Promise<infer TResponse> | infer TResponse
      ? TResponse extends Response<any, any>
        ? ModifiedResponsesFromMiddlewares<
            Response<
              TResponse['body'] extends undefined ? TFinalResponse['body'] : TResponse['body'],
              {
                status: TFinalResponse['status'];
                headers: TResponse['headers'] & TFinalResponse['headers'];
                context: TResponse['context'] & TFinalResponse['context'];
              }
            >,
            TRestMiddlewares extends readonly Middleware[] ? TRestMiddlewares : []
          >
        : never
      : never
    : ModifiedResponsesFromMiddlewares<
        TFinalResponse,
        TRestMiddlewares extends readonly Middleware[] ? TRestMiddlewares : []
      >
  : TFinalResponse;

// Used for extracting the response from the handlers and of the middlewares
export type ExtractResponsesFromMiddlewaresRequestAndRouterHandlers<
  TRouters extends DefaultRouterType[] | Omit<DefaultRouterType, never>[]
> =
  | (ExtractAllHandlersType<TRouters> extends (request: any) => infer TResponse | Promise<infer TResponse>
      ? TResponse extends Response<any, any>
        ? TResponse
        : never
      : never)
  | ExtractResponsesFromMiddlewaresRequestFromRouters<TRouters>
  | Response;

/**
 * This will extract all of the responses from the middlewares of a tuple of routers.
 * You pass first a tuple of routers and then it will extract all of the responses from the `request`
 * function of those middlewares. It gets the children routers as well.
 *
 * @generics TRouters - A tuple of routers that will be used for extracting the responses from the
 * middlewares. We will traverse through the parent and all it's children.
 * @generics TFinalResponses - The final type of the responses, this is used for recursion and should not
 * be explicitly set.
 *
 * @returns - A union of {@link Response} instances
 */
export type ExtractResponsesFromMiddlewaresRequestFromRouters<
  TRouters extends DefaultRouterType[] | Omit<DefaultRouterType, never>[],
  TFinalResponses extends Response<any, any> = never
> = TRouters extends [infer TFirstRouter, ...infer TRestRouters]
  ? TFirstRouter extends
      | BaseRouter<any, infer TRouterChildren, infer TMiddlewares, any, any>
      | Omit<BaseRouter<any, infer TRouterChildren, infer TMiddlewares, any, any>, never>
    ? TMiddlewares extends readonly Middleware[]
      ? TMiddlewares extends readonly [infer TFirstMiddie, ...infer TRestMiddlewares]
        ? TFirstMiddie extends {
            request: (request: Request<any, any>) => Promise<infer TResponseOrRequest> | infer TResponseOrRequest;
            response: (response: any) => Promise<infer TResponse> | infer TResponse;
          }
          ?
              | ExtractResponsesFromMiddlewaresRequestFromRouters<
                  TRestRouters extends DefaultRouterType[] | Omit<DefaultRouterType, never>[] ? TRestRouters : [],
                  | (TResponseOrRequest extends Response<any, any> ? TResponseOrRequest : never)
                  | (TResponse extends Response<any, any> ? TResponse : never)
                >
              | ExtractResponsesFromMiddlewaresRequestFromRouters<
                  TRouterChildren extends DefaultRouterType[] | Omit<DefaultRouterType, never>[] ? TRouterChildren : [],
                  | (TResponseOrRequest extends Response<any, any> ? TResponseOrRequest : never)
                  | (TResponse extends Response<any, any> ? TResponse : never)
                >
              | ExtractResponsesFromMiddlewaresRequestFromRouters<
                  [
                    BaseRouter<
                      any,
                      any,
                      TRestMiddlewares extends readonly Middleware[] ? TRestMiddlewares : [],
                      any,
                      any
                    >
                  ],
                  | (TResponseOrRequest extends Response<any, any> ? TResponseOrRequest : never)
                  | (TResponse extends Response<any, any> ? TResponse : never)
                >
          :
              | ExtractResponsesFromMiddlewaresRequestFromRouters<
                  TRestRouters extends DefaultRouterType[] | Omit<DefaultRouterType, never>[] ? TRestRouters : [],
                  TFinalResponses
                >
              | ExtractResponsesFromMiddlewaresRequestFromRouters<
                  TRouterChildren extends DefaultRouterType[] | Omit<DefaultRouterType, never>[] ? TRouterChildren : [],
                  TFinalResponses
                >
              | ExtractResponsesFromMiddlewaresRequestFromRouters<
                  [
                    BaseRouter<
                      any,
                      any,
                      TRestMiddlewares extends readonly Middleware[] ? TRestMiddlewares : [],
                      any,
                      any
                    >
                  ],
                  TFinalResponses
                >
        : TFinalResponses
      :
          | ExtractResponsesFromMiddlewaresRequestFromRouters<
              TRestRouters extends DefaultRouterType[] | Omit<DefaultRouterType, never>[] ? TRestRouters : [],
              TFinalResponses
            >
          | ExtractResponsesFromMiddlewaresRequestFromRouters<
              TRouterChildren extends DefaultRouterType[] | Omit<DefaultRouterType, never>[] ? TRouterChildren : [],
              TFinalResponses
            >
    : TFinalResponses
  : TFinalResponses;

// This is used to extract all the responses from the `request` functions of the middlewares.
// This works as an recursion that keeps track of the previous middlewares, so when a request fires a response
// we can know how this response will be modified by the previous middlewares.
export type ExtractResponsesFromMiddlewaresRequest<
  TMiddlewares extends readonly Middleware[],
  TMiddlewaresPassed extends readonly Middleware[] = [],
  TFinalResponses extends Response<
    any,
    {
      context: any;
      headers: any;
      status: any;
    }
  > = never
> = TMiddlewares extends readonly [infer TFirstMiddie, ...infer TRestMiddlewares]
  ? TFirstMiddie extends Middleware
    ? TFirstMiddie['request'] extends (
        request: Request<any, any>
      ) => Promise<infer TResponseOrRequest> | infer TResponseOrRequest
      ? Exclude<TResponseOrRequest, Request<any, any>> extends never
        ? ExtractResponsesFromMiddlewaresRequest<
            TRestMiddlewares extends readonly Middleware[] ? TRestMiddlewares : [],
            [...TMiddlewaresPassed, TFirstMiddie],
            TFinalResponses
          >
        : TResponseOrRequest extends Response<any, any>
          ? ExtractResponsesFromMiddlewaresRequest<
              TRestMiddlewares extends readonly Middleware[] ? TRestMiddlewares : [],
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

export type DefaultResponseType = Response<
  any,
  {
    status: any;
    headers: any;
    context: any;
  }
>;

export type ResponseTypeType = 'basic' | 'cors' | 'error' | 'opaque' | 'opaqueredirect';

export type MimeTypes =
  | 'audio/aac'
  | 'video/x-msvideo'
  | 'image/avif'
  | 'video/av1'
  | 'application/octet-stream'
  | 'image/bmp'
  | 'text/css'
  | 'text/csv'
  | 'application/vnd.ms-fontobject'
  | 'application/epub+zip'
  | 'image/gif'
  | 'application/gzip'
  | 'text/html'
  | 'image/x-icon'
  | 'text/calendar'
  | 'image/jpeg'
  | 'text/javascript'
  | 'application/json'
  | 'application/ld+json'
  | 'audio/x-midi'
  | 'audio/mpeg'
  | 'video/mp4'
  | 'video/mpeg'
  | 'audio/ogg'
  | 'video/ogg'
  | 'application/ogg'
  | 'audio/opus'
  | 'font/otf'
  | 'application/pdf'
  | 'image/png'
  | 'application/rtf'
  | 'image/svg+xml'
  | 'image/tiff'
  | 'video/mp2t'
  | 'font/ttf'
  | 'text/plain'
  | 'application/wasm'
  | 'video/webm'
  | 'audio/webm'
  | 'image/webp'
  | 'font/woff'
  | 'font/woff2'
  | 'application/xhtml+xml'
  | 'application/xml'
  | 'application/zip'
  | 'video/3gpp'
  | 'video/3gpp2'
  | 'model/gltf+json'
  | 'model/gltf-binary';

type ResponseHeaderTypes =
  | 'Access-Control-Allow-Credentials'
  | 'Access-Control-Allow-Headers'
  | 'Access-Control-Allow-Methods'
  | 'Access-Control-Allow-Origin'
  | 'Access-Control-Expose-Headers'
  | 'Access-Control-Max-Age'
  | 'Age'
  | 'Allow'
  | 'Cache-Control'
  | 'Clear-Site-Data'
  | 'Content-Disposition'
  | 'Content-Encoding'
  | 'Content-Language'
  | 'Content-Length'
  | 'Content-Location'
  | 'Content-Range'
  | 'Content-Security-Policy'
  | 'Content-Security-Policy-Report-Only'
  | 'Content-Type'
  | 'Cookie'
  | 'Cross-Origin-Embedder-Policy'
  | 'Cross-Origin-Opener-Policy'
  | 'Cross-Origin-Resource-Policy'
  | 'Date'
  | 'ETag'
  | 'Expires'
  | 'Last-Modified'
  | 'Location'
  | 'Permissions-Policy'
  | 'Pragma'
  | 'Retry-After'
  | 'Save-Data'
  | 'Sec-CH-Prefers-Color-Scheme'
  | 'Sec-CH-Prefers-Reduced-Motion'
  | 'Sec-CH-UA'
  | 'Sec-CH-UA-Arch'
  | 'Sec-CH-UA-Bitness'
  | 'Sec-CH-UA-Form-Factor'
  | 'Sec-CH-UA-Full-Version'
  | 'Sec-CH-UA-Full-Version-List'
  | 'Sec-CH-UA-Mobile'
  | 'Sec-CH-UA-Model'
  | 'Sec-CH-UA-Platform'
  | 'Sec-CH-UA-Platform-Version'
  | 'Sec-CH-UA-WoW64'
  | 'Sec-Fetch-Dest'
  | 'Sec-Fetch-Mode'
  | 'Sec-Fetch-Site'
  | 'Sec-Fetch-User'
  | 'Sec-GPC'
  | 'Server'
  | 'Server-Timing'
  | 'Service-Worker-Navigation-Preload'
  | 'Set-Cookie'
  | 'Strict-Transport-Security'
  | 'Timing-Allow-Origin'
  | 'Trailer'
  | 'Transfer-Encoding'
  | 'Upgrade'
  | 'Vary'
  | 'WWW-Authenticate'
  | 'Warning'
  | 'X-Content-Type-Options'
  | 'X-DNS-Prefetch-Control'
  | 'X-Frame-Options'
  | 'X-Permitted-Cross-Domain-Policies'
  | 'X-Powered-By'
  | 'X-Robots-Tag'
  | 'X-XSS-Protection';

export type HeadersType =
  | Record<'Content-Type', MimeTypes>
  | Record<ResponseHeaderTypes, string | string[]>
  | Record<string, string | string[]>;
