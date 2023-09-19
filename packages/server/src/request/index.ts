import ServerRequestAdapter from '../adapters/requests';
import { parseParamsValue, parseQueryParams, formDataLikeFactory } from './utils';
import { BaseRouter } from '../router/routers';
import ServerAdapter from '../adapters';

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

  method!: TRequest['Method'];
  private __query!: ProxyHandler<ExtractQueryParamsFromPathType<TRoutePath>>;
  private __headers!: {
    wasDirectlySet: boolean;
    data: TRequest['Headers'];
  };
  private __params!: ProxyHandler<ExtractUrlParamsFromPathType<TRoutePath>>;
  readonly body!: TRequest['Body'];
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
    this.method = options?.method;
    this.body = options?.body;

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

  async arrayBuffer() {
    return undefined;
  }

  async json(options?: any) {
    if (this.__serverRequestAndResponseData && this.__requestAdapter && this.__serverAdapter)
      return this.__requestAdapter.toJson(this.__serverAdapter, this.__serverRequestAndResponseData, options);
    return this.body;
  }

  async blob() {
    if (this.__serverRequestAndResponseData && this.__requestAdapter && this.__serverAdapter)
      return this.__requestAdapter.toBlob(this.__serverAdapter, this.__serverRequestAndResponseData) as Promise<Blob>;
    return undefined;
  }

  async formData(options?: any): Promise<InstanceType<FormDataLike<TRequest['Body']>> | undefined> {
    if (this.__serverRequestAndResponseData && this.__requestAdapter && this.__serverAdapter)
      return this.__requestAdapter.toFormData(
        this.__serverAdapter,
        this.__serverRequestAndResponseData,
        formDataLikeFactory(),
        options
      ) as unknown as Promise<InstanceType<FormDataLike<TRequest['Body']>> | undefined>;
    return undefined;
  }

  async text() {
    if (this.__serverRequestAndResponseData && this.__requestAdapter && this.__serverAdapter)
      return this.__requestAdapter.toText(this.__serverAdapter, this.__serverRequestAndResponseData);
    return undefined;
  }
}
