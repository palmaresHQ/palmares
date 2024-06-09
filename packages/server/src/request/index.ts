import ServerRequestAdapter from '../adapters/requests';
import { parseParamsValue, parseQueryParams, formDataLikeFactory } from './utils';
import { BaseRouter } from '../router/routers';
import ServerAdapter from '../adapters';
import {
  DEFAULT_REQUEST_CONTENT_HEADER_VALUE_URLENCODED,
  DEFAULT_REQUEST_HEADERS_CONTENT_HEADER_KEY,
  DEFAULT_SERVER_ERROR_INVALID_QUERY_OR_PARAMS,
} from '../defaults';

import type {
  ExtractQueryParamsFromPathType,
  ExtractUrlParamsFromPathType,
  FormDataLike,
  RequestMethodTypes,
  RequestCache,
  RequestCredentials,
  RequestDestination,
  RequestMode,
  RequestRedirect,
} from './types';
import { AbortedRequestError } from './exceptions';
import Response from '../response';
import { AllServerSettingsType } from '../types';

export default class Request<
  TRoutePath extends string = string,
  TRequest extends {
    method?: RequestMethodTypes;
    headers?: object | unknown;
    body?: unknown;
    responses?: Record<string, (...args: any[]) => Response<any, any> | Promise<Response<any, any>>> | undefined;
    context?: unknown;
    mode?: RequestMode;
    cache?: RequestCache;
    credentials?: RequestCredentials;
    integrity?: string;
    destination?: RequestDestination;
    referrer?: string;
    redirect?: RequestRedirect;
    referrerPolicy?: ReferrerPolicy;
  } = {
    method: RequestMethodTypes;
    headers: unknown;
    body: unknown;
    context: unknown;
    mode: RequestMode;
    cache: RequestCache;
    credentials: RequestCredentials;
    integrity: string;
    responses: undefined;
    destination: RequestDestination;
    referrer: string;
    redirect: RequestRedirect;
    referrerPolicy: ReferrerPolicy;
  },
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
   * @example
   * ```ts
   * app.use((req, res, next) => {
   *   const serverRequestAndResponseData = { req, res };
   *   await wrappedHandler(serverRequestAndResponseData);
   * });
   * ```
   */
  private __serverRequestAndResponseData: any = undefined;

  private __query?: ProxyHandler<ExtractQueryParamsFromPathType<TRoutePath>>;
  private __headers!: ProxyHandler<TRequest['headers'] extends object ? TRequest['headers'] : object>;
  private __destination?: { value: TRequest['destination'] };
  private __cachedMethod!: { value: TRequest['method'] };
  private __params?: ProxyHandler<ExtractUrlParamsFromPathType<TRoutePath>>;
  private __body?: { value: TRequest['body'] };
  private __cache?: { value: TRequest['cache'] };
  private __credentials?: { value: TRequest['credentials'] };
  private __mode?: { value: TRequest['mode'] };
  private __redirect?: { value: TRequest['redirect'] };
  private __referrer?: { value: string };
  private __referrerPolicy?: { value: ReferrerPolicy };
  private __integrity?: { value: string };
  private __signal: {
    signal: AbortSignal;
    controller: AbortController;
  };
  private __validationErrors?: {
    query?: Record<
      keyof ExtractQueryParamsFromPathType<TRoutePath>,
      {
        data: any;
        errorOn: keyof Parameters<BaseRouter['__queryParamsAndPath']['params']['set']>[1][];
        type: Parameters<BaseRouter['__queryParamsAndPath']['params']['set']>[1];
      }
    >;
    url?: Record<
      keyof ExtractUrlParamsFromPathType<TRoutePath>,
      {
        data: any;
        errorOn: keyof Parameters<BaseRouter['__urlParamsAndPath']['params']['set']>[1][];
        type: Parameters<BaseRouter['__urlParamsAndPath']['params']['set']>[1];
      }
    >;
  };
  private __url?: { value: string };
  private __responses?: { value: TRequest['responses'] };
  private __validation?: AllServerSettingsType['servers'][string]['validation'];

  context: TRequest['context'];

  /**
   * @deprecated - DO NOT create an instance of Request directly, unless you know what you are doing. If you want to change the request use {@link clone()} instead.
   */
  constructor(options?: TRequest) {
    const abortController = new AbortController();
    this.__signal = {
      controller: abortController,
      signal: abortController.signal,
    };

    this.context = options?.context;
    if (options?.destination) this.__destination = Object.freeze({ value: options.destination });
    if (options?.cache) this.__cache = Object.freeze({ value: options.cache });
    if (options?.credentials) this.__credentials = Object.freeze({ value: options.credentials });
    if (options?.mode) this.__mode = Object.freeze({ value: options.mode });
    if (options?.redirect) this.__redirect = Object.freeze({ value: options.redirect });
    if (options?.referrer) this.__referrer = Object.freeze({ value: options.referrer });
    if (options?.integrity) this.__integrity = Object.freeze({ value: options.integrity });
    if (options?.method) this.__cachedMethod = Object.freeze({ value: options.method });
    if (options?.body) this.__body = Object.freeze({ value: options.body });

    this.__headers = new Proxy(options?.headers || {}, {
      set: (target, prop, value) => {
        const propAsString = prop as string;
        (target as any)[propAsString] = value;
        return true;
      },
      get: (target, prop) => {
        const propAsString = prop as string;
        if (this.__requestAdapter) {
          const propNotYetCached = !(prop in (target as any));

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
    });
  }

  /**
   * This is the method that will be used to get the url of the request, it will be lazy loaded and cached and cannot be changed.
   * This is because we don't want to parse the url if the user doesn't need it.
   *
   * @example
   * ```ts
   * const request = new Request({ url: '/test' });
   * request.url; //'/test'
   *
   * path('/test').get((request) => {
   *  request.url; //'http:mycustomdomain.com/test'
   * });
   * ```
   *
   * @returns - The url of the request.
   */
  get url(): `${string}${TRoutePath}` {
    if (this.__url?.value) return this.__url.value as `${string}${TRoutePath}`;
    if (this.__requestAdapter && this.__serverAdapter) {
      const url = this.__requestAdapter.url(
        this.__serverAdapter as NonNullable<Request['__serverAdapter']>,
        this.__serverRequestAndResponseData
      );
      this.__url = Object.freeze({ value: url });
      return url as `${string}${TRoutePath}`;
    } else return '' as `${string}${TRoutePath}`;
  }

  get cache(): TRequest['cache'] {
    return this.__cache?.value;
  }

  get credentials(): TRequest['credentials'] {
    return this.__credentials?.value;
  }

  get mode(): TRequest['mode'] {
    return this.__mode?.value;
  }

  get redirect(): TRequest['redirect'] {
    return this.__redirect?.value;
  }

  get referrer(): string | undefined {
    if (this.__referrer?.value) return this.__referrer.value;
    else {
      const value = (this.headers as any)['Referer'];
      if (value) {
        this.__referrer = Object.freeze({ value });
        return value;
      }
    }
  }

  get referrerPolicy(): ReferrerPolicy | undefined {
    if (this.__referrerPolicy?.value) return this.__referrerPolicy.value;
    else {
      const value = (this.headers as any)['Referrer-Policy'];
      if (value) {
        this.__referrerPolicy = Object.freeze({ value });
        return value;
      }
    }
  }

  get integrity(): string | undefined {
    return this.__integrity?.value;
  }

  get destination(): RequestDestination | undefined {
    return this.__destination?.value;
  }

  get signal(): AbortSignal | undefined {
    return this.__signal?.signal;
  }

  get responses(): TRequest['responses'] {
    return this.__responses?.value;
  }

  /**
   * This will show the errors that happened on the request. This way you can validate them during the request response lifecycle.
   *
   * By default we give you the data parsed, we just parse the data when you use it. So in other words. If the request is made and you don't use the data we just don't validate.
   *
   * This is nice to keep your application fast and don't get in your way.
   */
  get validationErrors() {
    return this.__validationErrors as unknown as {
      query?: Record<
        keyof ExtractQueryParamsFromPathType<TRoutePath>,
        {
          data: any;
          errorOn: keyof Parameters<BaseRouter['__queryParamsAndPath']['params']['set']>[1][];
          type: Parameters<BaseRouter['__queryParamsAndPath']['params']['set']>[1];
        }
      >;
      url?: Record<
        keyof ExtractUrlParamsFromPathType<TRoutePath>,
        {
          data: any;
          errorOn: keyof Parameters<BaseRouter['__urlParamsAndPath']['params']['set']>[1][];
          type: Parameters<BaseRouter['__urlParamsAndPath']['params']['set']>[1];
        }
      >;
    };
  }

  /**
   * This will cancel the request lifecycle and will return an 500 error to the client.
   *
   * @example
   * ```ts
   * path('/test').get((request) => {
   *   request.abort();
   * });
   *
   * fetch('/test'); // 500 error
   * ```
   *
   * @param reason - The reason why the request was aborted.
   */
  abort(reason?: string) {
    this.__signal.controller.abort();
    throw new AbortedRequestError(reason);
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
  get method(): TRequest['method'] {
    if (this.__cachedMethod?.value) return this.__cachedMethod.value;
    else if (this.__requestAdapter && this.__serverAdapter) {
      const method = this.__requestAdapter.method(
        this.__serverAdapter as NonNullable<Request['__serverAdapter']>,
        this.__serverRequestAndResponseData
      );
      const upperCased = method?.toUpperCase() as TRequest['method'];
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
  get body(): TRequest['body'] {
    return this.__body?.value;
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
  get headers(): TRequest['headers'] {
    return this.__headers;
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
    const parserData = this.__urlParams.get(key);
    const dataFromUrl = nonNullableRequestAdapter.params(
      this.__serverAdapter as NonNullable<Request['__serverAdapter']>,
      this.__serverRequestAndResponseData,
      key
    );
    if (dataFromUrl && parserData) {
      const parsedData = parseParamsValue(dataFromUrl, parserData);

      this.__validateParamsAndThrow(key, parsedData, parserData);
      (target as any)[key] = parsedData;
    }
  }

  /**
   * This is really similar to {@link headers} but it's used for url params instead.
   * This will lazy load and parse the url parameters of the request. Instead of returning the params directly it is a proxy, so it's only parsed and translated when needed.
   *
   * @example
   * ```ts
   * path('/test/<filter: string>').get((request) => {
   *   request.params; // Proxy instance
   *   request.params['filter']; // string type
   *   JSON.stringify(request.headers); // '{"filter":"string"}'
   * });
   * ```
   *
   * @returns - Returns a proxy that will lazy load the headers of the request.
   */
  get params(): ExtractUrlParamsFromPathType<TRoutePath> {
    if (this.__requestAdapter && this.__serverAdapter) {
      if (this.__params !== undefined) return this.__params as ExtractUrlParamsFromPathType<TRoutePath>;
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

  private __validateQueryParamsAndThrow(
    name: string,
    data: any,
    type: Parameters<BaseRouter['__queryParamsAndPath']['params']['set']>[1]
  ) {
    const queryParamIsNotOptional = type?.isOptional !== true;
    const isDataFromQueryUndefinedOrNull = data === undefined || data === null;
    const isRequiredQueryParamUndefinedOrNull = isDataFromQueryUndefinedOrNull && queryParamIsNotOptional;
    const isArrayQueryParamEmpty = queryParamIsNotOptional && Array.isArray(data) && type.isArray && data.length === 0;
    const isStringQueryParamEmpty = queryParamIsNotOptional && typeof data === 'string' && data === '';
    const errorsOn = [];
    if (isArrayQueryParamEmpty) errorsOn.push('isArray');
    if (isRequiredQueryParamUndefinedOrNull) errorsOn.push('isOptional', 'type');
    if (type.regex) errorsOn.push('regex');

    if (isRequiredQueryParamUndefinedOrNull || isArrayQueryParamEmpty || isStringQueryParamEmpty) {
      const errorData = {
        [name]: {
          data,
          errorsOn,
          type,
        },
      };
      (this.__validationErrors as any) = Object.freeze({
        query: errorData,
      });
      if (this.__validation?.handler) throw this.__validation.handler?.(this);
      else throw DEFAULT_SERVER_ERROR_INVALID_QUERY_OR_PARAMS();
    }
  }

  private __validateParamsAndThrow(
    name: string,
    data: any,
    type: Parameters<BaseRouter['__urlParamsAndPath']['params']['set']>[1]
  ) {
    const isDataFromParamUndefinedOrNull = data === undefined || data === null;
    const isStringParamEmpty = typeof data === 'string' && data === '';

    if (isDataFromParamUndefinedOrNull || isStringParamEmpty) {
      const errorData = {
        [name]: {
          data,
          errorsOn: type.regex ? ['type', 'regex'] : ['type'],
          type,
        },
      };

      (this.__validationErrors as any) = Object.freeze({
        url: errorData,
      });
      if (this.__validation?.handler) throw this.__validation.handler?.(this);
      else throw DEFAULT_SERVER_ERROR_INVALID_QUERY_OR_PARAMS();
    }
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
    if (parserData) {
      if (dataFromQuery === undefined && parserData.isOptional !== true)
        this.__validateQueryParamsAndThrow(key, dataFromQuery, parserData);

      const parsedData = parseQueryParams(dataFromQuery, parserData as NonNullable<typeof parserData>);
      this.__validateQueryParamsAndThrow(key, parsedData, parserData);

      (target as any)[key] = parsedData;
    }
  }

  /**
   * This is really similar to {@link headers} but it's used for query params instead.
   * This will lazy load and parse query parameters of the request. Instead of returning the query params directly it is a proxy, so it's only parsed and translated when needed.
   *
   * @example
   * ```ts
   * path('/test?filter=string&world=string[]?').get((request) => {
   *   request.query; // Proxy instance
   *   request.query['filter']; // string type
   *   request.query['world']; // string[] | undefined type
   *   JSON.stringify(request.headers); // '{"filter":"string"}'
   * });
   * ```
   *
   * @returns - Returns a proxy that will lazy load the headers of the request.
   */
  get query(): ExtractQueryParamsFromPathType<TRoutePath> {
    if (this.__requestAdapter) {
      if (this.__query !== undefined) return this.__query as ExtractQueryParamsFromPathType<TRoutePath>;
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

  /**
   * This function is used to clone the object, it is the only and the prefered way to make changes to your request (besides making changes to the `context`)
   * You can use it to change the headers, body, context, mode, cache, credentials, integrity, destination, referrer and redirect. To improve performance this
   * will change the values in-place. This means it will change itself and return it again, but you can do a copy of the object using `{ options: inPlace: false }`
   *
   * @example
   * ```ts
   * const request = new Request({ headers: { 'Content-Type': 'application/json' } });
   * const newRequest = request.clone({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
   * request.headers; // { 'Content-Type': 'application/x-www-form-urlencoded' }
   * newRequest.headers; // { 'Content-Type': 'application/x-www-form-urlencoded' }
   *
   * const request = new Request({ headers: { 'Content-Type': 'application/json' } });
   * const newRequest = request.clone({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }, { inPlace: false });
   * request.headers; // { 'Content-Type': 'application/json' }
   * newRequest.headers; // { 'Content-Type': 'application/x-www-form-urlencoded' }
   * ```
   *
   * @param args - The new values you want to set on the request, the values you don't pass will not be overridden.
   * @param options - The options you want to use when cloning the request.
   * @param options.inPlace - If you want to clone the request or change it in-place. By default it will change it in-place. IMPORTANT: The header will NOT
   * be overridden you can just change an existing value or add a new one.
   *
   * @returns - Either a new Request instance or the same instance with new values.
   */
  clone<
    TNewRequest extends {
      headers?: object | unknown;
      body?: unknown;
      context?: object;
      mode?: RequestMode;
      cache?: RequestCache;
      credentials?: RequestCredentials;
      integrity?: string;
      destination?: RequestDestination;
      referrer?: string;
      referrerPolicy?: ReferrerPolicy;
      redirect?: RequestRedirect;
    } = {
      headers: unknown;
      body: undefined;
      context: object;
      mode: RequestMode;
      cache: RequestCache;
      credentials: RequestCredentials;
      integrity: string;
      destination: RequestDestination;
      referrer: string;
      referrerPolicy: ReferrerPolicy;
      redirect: RequestRedirect;
    },
  >(args?: TNewRequest, options?: { inPlace: boolean }) {
    const isInPlace = options?.inPlace !== false;
    const newRequest = isInPlace
      ? this
      : new Request<
          TRoutePath,
          {
            body: TNewRequest['body'] extends object | string ? TNewRequest['body'] : TRequest['body'];
            headers: TNewRequest['headers'] extends object ? TNewRequest['headers'] : TRequest['headers'];
            context: TNewRequest['context'] extends object ? TNewRequest['context'] : TRequest['context'];
            method: TRequest['method'];
            mode: TNewRequest['mode'] extends RequestMode
              ? TNewRequest['mode']
              : TRequest['mode'] extends RequestMode
              ? TRequest['mode']
              : RequestMode;
            cache: TNewRequest['cache'] extends RequestCache
              ? TNewRequest['cache']
              : TRequest['cache'] extends RequestCache
              ? TRequest['cache']
              : RequestCache;
            credentials: TNewRequest['credentials'] extends RequestCredentials
              ? TNewRequest['credentials']
              : TRequest['credentials'] extends RequestCredentials
              ? TRequest['credentials']
              : RequestCredentials;
            integrity: TNewRequest['integrity'] extends string
              ? TNewRequest['integrity']
              : TRequest['integrity'] extends string
              ? TRequest['integrity']
              : string;
            destination: TNewRequest['destination'] extends RequestDestination
              ? TNewRequest['destination']
              : TRequest['destination'] extends RequestDestination
              ? TRequest['destination']
              : RequestDestination;
            referrer: TNewRequest['referrer'] extends string
              ? TNewRequest['referrer']
              : TRequest['referrer'] extends string
              ? TRequest['referrer']
              : string;
            redirect: TNewRequest['redirect'] extends RequestRedirect
              ? TNewRequest['redirect']
              : TRequest['redirect'] extends RequestRedirect
              ? TRequest['redirect']
              : RequestRedirect;
            referrerPolicy: TNewRequest['referrerPolicy'] extends ReferrerPolicy
              ? TNewRequest['referrerPolicy']
              : TRequest['referrerPolicy'] extends ReferrerPolicy
              ? TRequest['referrerPolicy']
              : ReferrerPolicy;
            responses: TRequest['responses'];
          }
        >();
    if (args?.body) newRequest.__body = Object.freeze({ value: args.body });
    else newRequest.__body = this.__body;

    if (args?.headers) {
      const allHeaders = isInPlace
        ? args.headers
        : Object.assign(JSON.parse(JSON.stringify(this.__headers)), args.headers);
      for (const key of Object.keys(allHeaders)) (newRequest.__headers as any)[key] = (args.headers as any)[key];
    } else newRequest.__headers = this.__headers;

    if (args?.context) newRequest.context = Object.assign(this.context || {}, args.context);
    else newRequest.context = this.context as any;

    if (args?.mode) newRequest.__mode = Object.freeze({ value: args.mode });
    else newRequest.__mode = this.__mode as any;

    if (args?.cache) newRequest.__cache = Object.freeze({ value: args.cache });
    else newRequest.__cache = this.__cache as any;

    if (args?.credentials) newRequest.__credentials = Object.freeze({ value: args.credentials });
    else newRequest.__credentials = this.__credentials as any;

    if (args?.integrity) newRequest.__integrity = Object.freeze({ value: args.integrity });
    else newRequest.__integrity = this.__integrity as any;

    if (args?.destination) newRequest.__destination = Object.freeze({ value: args.destination });
    else newRequest.__destination = this.__destination as any;

    if (args?.referrer) newRequest.__referrer = Object.freeze({ value: args.referrer });
    else newRequest.__referrer = this.__referrer as any;

    if (args?.redirect) newRequest.__redirect = Object.freeze({ value: args.redirect });
    else newRequest.__redirect = this.__redirect as any;

    if (args?.referrerPolicy) newRequest.__referrerPolicy = Object.freeze({ value: args.referrerPolicy });
    else newRequest.__referrerPolicy = this.__referrerPolicy as any;

    newRequest.__validation = this.__validation;
    newRequest.__responses = this.__responses;
    newRequest.__queryParams = this.__queryParams;
    newRequest.__urlParams = this.__urlParams;
    newRequest.__serverAdapter = this.__serverAdapter;
    newRequest.__requestAdapter = this.__requestAdapter;
    newRequest.__serverRequestAndResponseData = this.__serverRequestAndResponseData;

    return newRequest as Request<
      TRoutePath,
      {
        body: TNewRequest['body'] extends object | string ? TNewRequest['body'] : TRequest['body'];
        headers: TNewRequest['headers'] extends object ? TNewRequest['headers'] : TRequest['headers'];
        context: TNewRequest['context'] extends object ? TNewRequest['context'] : TRequest['context'];
        method: TRequest['method'];
        mode: TNewRequest['mode'] extends RequestMode
          ? TNewRequest['mode']
          : TRequest['mode'] extends RequestMode
          ? TRequest['mode']
          : RequestMode;
        cache: TNewRequest['cache'] extends RequestCache
          ? TNewRequest['cache']
          : TRequest['cache'] extends RequestCache
          ? TRequest['cache']
          : RequestCache;
        credentials: TNewRequest['credentials'] extends RequestCredentials
          ? TNewRequest['credentials']
          : TRequest['credentials'] extends RequestCredentials
          ? TRequest['credentials']
          : RequestCredentials;
        integrity: TNewRequest['integrity'] extends string
          ? TNewRequest['integrity']
          : TRequest['integrity'] extends string
          ? TRequest['integrity']
          : string;
        destination: TNewRequest['destination'] extends RequestDestination
          ? TNewRequest['destination']
          : TRequest['destination'] extends RequestDestination
          ? TRequest['destination']
          : RequestDestination;
        referrer: TNewRequest['referrer'] extends string
          ? TNewRequest['referrer']
          : TRequest['referrer'] extends string
          ? TRequest['referrer']
          : string;
        redirect: TNewRequest['redirect'] extends RequestRedirect
          ? TNewRequest['redirect']
          : TRequest['redirect'] extends RequestRedirect
          ? TRequest['redirect']
          : RequestRedirect;
        referrerPolicy: TNewRequest['referrerPolicy'] extends ReferrerPolicy
          ? TNewRequest['referrerPolicy']
          : TRequest['referrerPolicy'] extends ReferrerPolicy
          ? TRequest['referrerPolicy']
          : ReferrerPolicy;
        responses: TRequest['responses'];
      }
    >;
  }

  /**
   * This is the underlying serverData. The documentation of this should be provided by the framework you are using underlined with Palmares.
   * So, the idea is simple, when a request is made, the underlying framework will call a callback we provide passing the data it needs to handle both
   * the request and the response. For Express.js for example this will be an object containing both the `req` and `res` objects. If for some reason you need
   * some data or some functionality we do not support by default you can, at any time, call this function and get this data.
   *
   * IMPORTANT: It's not up for us to document this, ask the library author of the adapter to provide a documentation and properly type this.
   *
   * @example
   * ```ts
   * // on settings.ts
   * import { ExpressServerAdapter } from '@palmares/express-adapter';
   * import ServerDomain from '@palmares/server';
   *
   * export default defineSettings({
   *   //...other configs,
   *   installedDomains: [
   *     [
   *       ServerDomain,
   *       {
   *          servers: {
   *            default: {
   *              server: ExpressServerAdapter,
   *              // ...other configs,
   *            },
   *          },
   *       },
   *    ],
   *  ],
   * });
   *
   * // on controllers.ts
   * import type { Request, Response } from 'express';
   *
   * const request = new Request();
   * request.serverData(); // undefined
   *
   * path('/test').get((request) => {
   *   request.serverData(); // { req: Request, res: Response }
   * });
   * ```
   *
   * @returns - The underlying server data.
   */
  serverData<T>(): T {
    return this.__serverRequestAndResponseData;
  }

  /**
   * This should return the body as an ArrayBuffer instance. If the body is not an ArrayBuffer it should return undefined. You should search for documentation of the underlying adapter
   * to understand WHEN it will return an ArrayBuffer (usually might depend of 'Content-Type' header)
   *
   * @example
   * ```ts
   * const request = new Request({ body: new ArrayBuffer(10) });
   * await request.arrayBuffer(); // ArrayBuffer(10)
   *
   * path('/test').post(async (request) => {
   *   await request.arrayBuffer(); // ArrayBuffer | undefined
   * });
   *
   * fetch('/test', {
   *   method: 'POST',
   *   headers: {
   *    'Content-Type': 'application/octet-stream'
   *   },
   *   body: new ArrayBuffer(10)
   * });
   * ```
   *
   * @param options - Those options are custom options you want to pass to the underlying adapter instance when retrieving the array buffer, see the documentation of the underlying
   * adapter. You can retrieve those options by: 'MyCustomFrameworkRequestAdapter.customToArrayBufferOptions?.()' if it is implemented.
   */
  async arrayBuffer(options?: any) {
    if (this.body instanceof ArrayBuffer) return this.body;
    if (this.__serverRequestAndResponseData && this.__requestAdapter && this.__serverAdapter)
      return this.__requestAdapter.toArrayBuffer(this.__serverAdapter, this.__serverRequestAndResponseData, options);
    return undefined;
  }

  /**
   * This SHOULD return a json body when the 'Content-Type' on the request header is `application/json`.
   *
   * @example
   * ```ts
   * const request = new Request({ body: { hello: 'world' } });
   * await request.json(); // { hello: 'world' }
   *
   * path('/test').post(async (request) => {
   *   await request.json(); // { hello: 'world' } | undefined
   * });
   *
   * fetch('/test', {
   *   method: 'POST',
   *   headers: {
   *    'Content-Type': 'application/json'
   *   },
   *   body: JSON.stringify({ hello: 'world' })
   * });
   * ```
   *
   * @param options - Those options are custom options you want to pass to the underlying adapter instance when retrieving the json, see the documentation of the underlying
   * adapter. You can retrieve those options by: 'MyCustomFrameworkRequestAdapter.customToJsonOptions?.()' if it is implemented.
   */
  async json(options?: any): Promise<TRequest['body'] | undefined> {
    if (typeof this.body === 'object' && this.body !== null) return this.body;
    if (this.__serverRequestAndResponseData && this.__requestAdapter && this.__serverAdapter)
      return this.__requestAdapter.toJson(this.__serverAdapter, this.__serverRequestAndResponseData, options);
    return undefined;
  }

  /**
   * This should return the body as a Blob instance. If the body is not a Blob it should return undefined. You should search for documentation of the underlying adapter
   * to understand WHEN it will return a Blob (usually might depend of 'Content-Type' header)
   *
   * @example
   * ```ts
   * const request = new Request({ body: new Blob() });
   * request.blob(); // Blob
   *
   * path('/test').post((request) => {
   *  request.blob(); // Blob | undefined
   * });
   *
   * fetch('/test', {
   *  method: 'POST',
   *  headers: {
   *   'Content-Type': 'application/octet-stream'
   *  },
   *  body: new Blob()
   * });
   * ```
   *
   * @param options - Those options are custom options you want to pass to the underlying adapter instance when retrieving the blob, see the documentation of the underlying
   * adapter. You can retrieve those options by: 'MyCustomFrameworkRequestAdapter.customToBlobOptions?.()' if it is implemented.
   */
  async blob(options?: any) {
    if (this.body instanceof Blob || this.body instanceof File) return this.body;
    if (this.__serverRequestAndResponseData && this.__requestAdapter && this.__serverAdapter)
      return this.__requestAdapter.toBlob(
        this.__serverAdapter,
        this.__serverRequestAndResponseData,
        options
      ) as Promise<Blob | File>;
    return undefined;
  }

  /**
   * This should contain data when the 'Content-Type' on the request is a `multipart/form-data` or `application/x-www-form-urlencoded`.
   * Otherwise it should be undefined.
   *
   * This should be used for retrieving a FormData-like instance. FormData is not available on Node.js and might not be supported on other runtimes,
   * so in order to support it we have created a FormData-like class that has the same API as the original FormData with some extensions.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/API/FormData
   *
   * @example
   * ```ts
   * const request = new Request({ body: new FormData() });
   * await request.formData(); // Blob
   *
   * path('/test').post(async (request) => {
   *  request.formData(); // FormDataLike | undefined
   * });
   *
   * fetch('/test', {
   *  method: 'POST',
   *  headers: {
   *   'Content-Type': 'application/form-data'
   *  },
   *  body: new FormData()
   * });
   * ```
   *
   * @param options - Those options are custom options you want to pass to the underlying framework instance when retrieving the form data.
   * You can retrieve those options by: 'MyCustomFrameworkRequestAdapter.customToBlobOptions?.()' if it is implemented.
   */
  async formData(options?: any): Promise<InstanceType<FormDataLike<TRequest['body']>> | undefined> {
    if (this.__serverRequestAndResponseData && this.__requestAdapter && this.__serverAdapter)
      return this.__requestAdapter.toFormData(
        this.__serverAdapter,
        this.__serverRequestAndResponseData,
        formDataLikeFactory() as FormDataLike<any>,
        (this.headers as any)[DEFAULT_REQUEST_HEADERS_CONTENT_HEADER_KEY] ===
          DEFAULT_REQUEST_CONTENT_HEADER_VALUE_URLENCODED,
        options
      ) as unknown as Promise<InstanceType<FormDataLike<TRequest['body']>> | undefined>;
    return undefined;
  }

  /**
   * This should return the body as a string. If the body is not a string it should return undefined. You should search for documentation of the underlying adapter
   * to understand WHEN it will return a string (usually might depend of 'Content-Type' header)
   *
   * @example
   * ```ts
   * const request = new Request({ body: 'Hello World' });
   * await request.text(); // 'Hello World'
   *
   * path('/test').post(async (request) => {
   *    await request.text(); // 'Hello World' | undefined
   * });
   *
   * fetch('/test', {
   *   method: 'POST',
   *   headers: {
   *     'Content-Type': 'text/plain'
   *   },
   *   body: 'Hello World'
   * });
   * ```
   *
   * @param options - Those options are custom options you want to pass to the underlying adapter instance when retrieving the text, see the documentation of the underlying
   * adapter. You can retrieve those options by: 'MyCustomFrameworkRequestAdapter.customToTextOptions?.()' if it is implemented.
   */
  async text(options?: any) {
    if (typeof this.body === 'string') return this.body;
    if (this.__serverRequestAndResponseData && this.__requestAdapter && this.__serverAdapter)
      return this.__requestAdapter.toText(this.__serverAdapter, this.__serverRequestAndResponseData, options);
    return undefined;
  }

  /**
   * Should return the raw data of the request, whatever you have on the request body should be returned here.
   *
   * @example
   * ```ts
   * const request = new Request({ body: 'Hello World' });
   * await request.raw(); // 'Hello World'
   *
   * path('/test').post(async (request) => {
   *    await request.raw(); // 'Hello World' | undefined
   * });
   * ```
   *
   * @param options - Those options are custom options you want to pass to the underlying adapter instance when retrieving the raw data, see the documentation of the underlying
   * adapter. You can retrieve those options by: 'MyCustomFrameworkRequestAdapter.customToRawOptions?.()' if it is implemented.
   */
  async raw(options?: any) {
    if (this.__serverRequestAndResponseData && this.__requestAdapter && this.__serverAdapter)
      return this.__requestAdapter.toRaw(this.__serverAdapter, this.__serverRequestAndResponseData, options);
    return undefined;
  }
}
