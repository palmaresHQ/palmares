import ServerRequestAdapter from '../adapters/requests';
import { parseParamsValue, parseQueryParams, formDataLikeFactory } from './utils';
import { BaseRouter } from '../router/routers';
import ServerAdapter from '../adapters';
import {
  DEFAULT_REQUEST_CONTENT_HEADER_VALUE_URLENCODED,
  DEFAULT_REQUEST_HEADERS_CONTENT_HEADER_KEY,
} from '../defaults';

import type { ExtractQueryParamsFromPathType, ExtractUrlParamsFromPathType, FormDataLike } from './types';

export default class Request<
  TRoutePath extends string = string,
  TRequest extends {
    Method?: 'GET' | 'POST';
    Body?: unknown;
    Headers?: object | unknown;
    Cookies?: object | unknown;
    Context?: unknown;
  } = {
    Body: string;
    Headers: unknown;
    Cookies: unknown;
    Context: unknown;
  }
> {
  /**
   * All of those private methods are not really private, we use them internally so we do a typescript mangling to use them.
   *
   * But the intellisense on VSCODE or other editors will not show them.
   */
  private __queryParams: BaseRouter['__queryParamsAndPath']['params'] | undefined = undefined;
  private __urlParams: BaseRouter['__urlParamsAndPath']['params'] | undefined = undefined;
  private __serverAdapter: ServerAdapter | undefined = undefined;
  private __requestAdapter: ServerRequestAdapter | undefined = undefined;
  /**
   * This is data sent by the server, you can use it to translate your request and response during the lifecycle of Request/Response.
   *
   * Think like that, on express:
   *
   * ```ts
   * app.use((req, res, next) => {
   *   const serverRequestAndResponseData = { req, res };
   *   await wrappedHandler(serverRequestAndResponseData);
   * });
   * ```
   */
  private __serverRequestAndResponseData: any = undefined;

  private __query!: ProxyHandler<ExtractQueryParamsFromPathType<TRoutePath>>;
  private __headers!: {
    wasDirectlySet: boolean;
    data: TRequest['Headers'];
  };
  private __cachedMethod!: { value: TRequest['Method'] };
  private __params!: ProxyHandler<ExtractUrlParamsFromPathType<TRoutePath>>;
  private __body!: { value: TRequest['Body'] };
  readonly cookies!: TRequest['Cookies'];
  context!: TRequest['Context'];

  readonly cache!: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
  readonly credentials!: 'omit' | 'same-origin' | 'include';
  readonly mode!: 'same-origin' | 'no-cors' | 'cors' | 'navigate' | 'websocket';
  readonly redirect!: 'follow' | 'error' | 'manual';
  readonly referrer!: 'no-referrer' | 'client';
  readonly url!: string;

  constructor(options?: {
    method?: TRequest['Method'];
    body?: TRequest['Body'];
    headers?: TRequest['Headers'];
    cookies?: TRequest['Cookies'];
  }) {
    if (options?.method) this.__cachedMethod = Object.freeze({ value: options.method });
    if (options?.body) this.__body = Object.freeze({ value: options.body });

    const wasHeadersDirectlySet = options?.headers !== undefined;
    this.__headers = {
      wasDirectlySet: wasHeadersDirectlySet,
      data: new Proxy(options?.headers || {}, {
        set: (target, prop, value) => {
          const propAsString = prop as string;
          (target as any)[propAsString] = value;
          return true;
        },
        get: (target, prop) => {
          const propAsString = prop as string;
          if (this.__requestAdapter) {
            const propNotYetCached = !(prop in target);

            if (propNotYetCached) {
              const dataFromHeader = this.__requestAdapter.headers(
                this.__serverAdapter as NonNullable<Request['__serverAdapter']>,
                this.__serverRequestAndResponseData,
                propAsString
              );
              if (dataFromHeader) (target as any)[propAsString] = dataFromHeader;
            }
            return (target as any)[propAsString];
          }

          return undefined;
        },
      }),
    };

    this.cookies = options?.cookies;
  }

  /**
   * This is the method that will be used to get the method of the request, it will be lazy loaded and cached and cannot be changed.
   *
   * @example
   * ```ts
   * const request = new Request({ method: 'GET' });
   * request.method; //'GET'
   *
   * path('/test').get((request) => {
   *   request.method; //'GET'
   * });
   * ```
   *
   * @returns - The method of the request. For reference, see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
   */
  get method(): TRequest['Method'] {
    if (this.__cachedMethod?.value) return this.__cachedMethod.value;
    else if (this.__requestAdapter && this.__serverAdapter) {
      const method = this.__requestAdapter.method(
        this.__serverAdapter as NonNullable<Request['__serverAdapter']>,
        this.__serverRequestAndResponseData
      );
      const upperCased = method?.toUpperCase() as TRequest['Method'];
      this.__cachedMethod = Object.freeze({ value: upperCased });
      return this.__cachedMethod.value;
    } else return undefined;
  }

  /**
   * By default this will return nothing, you need to use one of the following methods {@link formData()}, {@link json()}, {@link text()}, {@link blob()} or {@link arrayBuffer()} to get the body.
   * This is because we don't want to parse the body if the user doesn't need it. This will JUST have a value if you use either use {@link clone()} passing
   * a new body or if you create a new instance of Request passing a body. Otherwise it will always be undefined.
   *
   * @example
   * ```ts
   * const request = new Request({ body: 'Hello World' });
   * request.body; //'Hello World'
   *
   * path('/test').get((request) => {
   *   request.body; //undefined
   * })
   * ```
   *
   * @returns - The body of the request.
   */
  get body(): TRequest['Body'] {
    return this.__body.value;
  }

  /**
   * This will lazy load the headers of the request. Instead of returning the headers directly it is a proxy, so it's only parsed and translated when needed.
   *
   * @example
   * ```ts
   * const request = new Request({ headers: { 'Content-Type': 'application/json' } });
   * request.headers; // { 'Content-Type': 'application/json' }
   *
   * path('/test').get((request) => {
   *   request.headers; // Proxy instance
   *   request.headers['Content-Type']; // 'application/json'
   *   JSON.stringify(request.headers); // '{"Content-Type":"application/json"}'
   * });
   * ```
   *
   * @returns - Returns a proxy that will lazy load the headers of the request.
   */
  get headers(): TRequest['Headers'] {
    return this.__headers.data;
  }

  /**
   * This is an extraction of a piece of code that repeats inside of `query` getter.
   *
   * @param target - The target to append the parsed query param.
   * @param key - The key of the query param.
   */
  private __appendUrlParamParsedToTarget(target: any, key: string) {
    if (!this.__urlParams) return undefined;
    const nonNullableRequestAdapter = this.__requestAdapter as NonNullable<typeof this.__requestAdapter>;
    const parsedData = this.__urlParams.get(key);
    const dataFromUrl = nonNullableRequestAdapter.params(
      this.__serverAdapter as NonNullable<Request['__serverAdapter']>,
      this.__serverRequestAndResponseData,
      key
    );
    if (dataFromUrl) (target as any)[key] = parseParamsValue(dataFromUrl, parsedData as NonNullable<typeof parsedData>);
  }

  /**
   * Same as query params but for url parameters, like `/user/<id: number>`. Nothing really special once you know how we lazy load and parse the query/param data.
   */
  get params(): ExtractUrlParamsFromPathType<TRoutePath> {
    if (this.__requestAdapter && this.__serverAdapter) {
      if (this.__params instanceof Proxy) return this.__params as ExtractUrlParamsFromPathType<TRoutePath>;
      else {
        const paramsProxy = new Proxy(
          {},
          {
            get: (target, prop) => {
              // Reference: https://dev.to/jankapunkt/how-stringify-proxy-to-json-10oe
              // The toJSON method is called whenever JSON.stringify is called on the proxy.
              if (prop.toString() === 'toJSON') {
                if (this.__requestAdapter && this.__urlParams) {
                  return () => {
                    if (!this.__urlParams) return undefined;

                    for (const key of this.__urlParams.keys()) {
                      if (key in target) continue;
                      this.__appendUrlParamParsedToTarget(target, key);
                    }
                    return target;
                  };
                }
                return undefined;
              }

              const propAsString = prop as string;
              const existsDataOnQuery = this.__urlParams && this.__urlParams.has(propAsString);
              if (this.__requestAdapter && existsDataOnQuery) {
                const propNotYetCached = !(prop in target);

                if (propNotYetCached) this.__appendUrlParamParsedToTarget(target, propAsString);
                return (target as any)[propAsString];
              }

              return undefined;
            },
          }
        );
        this.__params = paramsProxy;
        return paramsProxy as ExtractUrlParamsFromPathType<TRoutePath>;
      }
    } else return {} as ExtractUrlParamsFromPathType<TRoutePath>;
  }

  /**
   * This is an extraction of a piece of code that repeats inside of `query` getter.
   *
   * @param target - The target to append the parsed query param.
   * @param key - The key of the query param.
   */
  private __appendQueryParamParsedToTarget(target: any, key: string) {
    if (!this.__queryParams) return undefined;
    const nonNullableRequestAdapter = this.__requestAdapter as NonNullable<typeof this.__requestAdapter>;
    const parserData = this.__queryParams.get(key);
    const dataFromQuery = nonNullableRequestAdapter.query(
      this.__serverAdapter as NonNullable<Request['__serverAdapter']>,
      this.__serverRequestAndResponseData,
      key
    );
    if (dataFromQuery) {
      (target as any)[key] = parseQueryParams(dataFromQuery, parserData as NonNullable<typeof parserData>);
    }
  }

  /**
   * Lazily extract the query params from the request and translate it to the type of the query params only when needed.
   *
   * This should make everything run smooth and fast. The translation will only happen when the query params are accessed.
   */
  get query(): ExtractQueryParamsFromPathType<TRoutePath> {
    if (this.__requestAdapter) {
      if (this.__query instanceof Proxy) return this.__query as ExtractQueryParamsFromPathType<TRoutePath>;
      else {
        const queryProxy = new Proxy(
          {},
          {
            get: (target, prop) => {
              // Reference: https://dev.to/jankapunkt/how-stringify-proxy-to-json-10oe
              // The toJSON method is called whenever JSON.stringify is called on the proxy.
              if (prop.toString() === 'toJSON') {
                if (this.__requestAdapter && this.__queryParams) {
                  return () => {
                    if (!this.__queryParams) return undefined;

                    for (const key of this.__queryParams.keys()) {
                      if (key in target) continue;
                      this.__appendQueryParamParsedToTarget(target, key);
                    }
                    return target;
                  };
                }
                return undefined;
              }

              const propAsString = prop as string;
              const existsDataOnQuery = this.__queryParams && this.__queryParams.has(propAsString);

              if (this.__requestAdapter && existsDataOnQuery) {
                const propNotYetCached = !(prop in target);

                if (propNotYetCached) this.__appendQueryParamParsedToTarget(target, propAsString);
                return (target as any)[propAsString];
              }

              return undefined;
            },
          }
        );
        this.__query = queryProxy;
        return queryProxy as ExtractQueryParamsFromPathType<TRoutePath>;
      }
    } else return {} as ExtractQueryParamsFromPathType<TRoutePath>;
  }

  clone<
    TNewRequest extends {
      Method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'CONNECT' | 'TRACE';
      Body?: unknown;
      Headers?: object | unknown;
      Cookies?: object | unknown;
      Context?: unknown;
    } = {
      Data: unknown;
      Headers: unknown;
      Cookies: unknown;
      Context: unknown;
    }
  >() {
    return new Request<
      TRoutePath,
      {
        Method: TRequest['Method'];
        Body: TRequest['Body'] & TNewRequest['Body'];
        Headers: TRequest['Headers'] & TNewRequest['Headers'];
        Cookies: TRequest['Cookies'] & TNewRequest['Cookies'];
        Context: TRequest['Context'] & TNewRequest['Context'];
      }
    >();
  }

  serverData<T>(): T {
    return this.__serverRequestAndResponseData;
  }

  async arrayBuffer(options?: any) {
    if (this.__serverRequestAndResponseData && this.__requestAdapter && this.__serverAdapter)
      return this.__requestAdapter.toArrayBuffer(this.__serverAdapter, this.__serverRequestAndResponseData, options);
    return this.body;
  }

  async json(options?: any) {
    if (this.__serverRequestAndResponseData && this.__requestAdapter && this.__serverAdapter)
      return this.__requestAdapter.toJson(this.__serverAdapter, this.__serverRequestAndResponseData, options);
    return this.body;
  }

  async blob(options?: any) {
    if (this.__serverRequestAndResponseData && this.__requestAdapter && this.__serverAdapter)
      return this.__requestAdapter.toBlob(
        this.__serverAdapter,
        this.__serverRequestAndResponseData,
        options
      ) as Promise<Blob>;
    return undefined;
  }

  /**
   * This should contain data when the 'Content-Type' on the request is a `multipart/form-data` or `application/x-www-form-urlencoded`.
   * Otherwise it should be undefined.
   *
   * This should be used for retrieving a FormData-like instance. FormData is not available on Node.js and other runtimes,
   * so in order to support it we have created a FormData-like class that has the same API as the original FormData.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/API/FormData
   *
   * @param options - Those options are custom options you want to pass to the underlying framework instance when retrieving the form data.
   */
  async formData(options?: any): Promise<InstanceType<FormDataLike<TRequest['Body']>> | undefined> {
    if (this.__serverRequestAndResponseData && this.__requestAdapter && this.__serverAdapter)
      return this.__requestAdapter.toFormData(
        this.__serverAdapter,
        this.__serverRequestAndResponseData,
        formDataLikeFactory(),
        (this.headers as any)[DEFAULT_REQUEST_HEADERS_CONTENT_HEADER_KEY] ===
          DEFAULT_REQUEST_CONTENT_HEADER_VALUE_URLENCODED,
        options
      ) as unknown as Promise<InstanceType<FormDataLike<TRequest['Body']>> | undefined>;
    return undefined;
  }

  async text(options?: any) {
    if (this.__serverRequestAndResponseData && this.__requestAdapter && this.__serverAdapter)
      return this.__requestAdapter.toText(this.__serverAdapter, this.__serverRequestAndResponseData, options);
    return undefined;
  }
}
