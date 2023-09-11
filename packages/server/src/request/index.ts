import { Blob } from 'buffer';
import type { ExtractQueryParamsFromPathType, ExtractUrlParamsFromPathType } from './types';
import ServerRequestAdapter from '../adapters/requests';

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
  private __error: Error | undefined = undefined;
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
  readonly query!: ExtractQueryParamsFromPathType<TRoutePath>;
  readonly params!: ExtractUrlParamsFromPathType<TRoutePath>;
  readonly body!: TRequest['Body'];
  private __headers!: {
    wasDirectlySet: boolean;
    data: TRequest['Headers'];
  };
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
    params?: ExtractUrlParamsFromPathType<TRoutePath>;
  }) {
    if (options?.params) this.params = options?.params;
    this.method = options?.method;
    this.body = options?.body;
    if (options?.headers)
      this.__headers = {
        wasDirectlySet: true,
        data: options.headers,
      };

    this.cookies = options?.cookies;
  }

  get headers(): TRequest['Headers'] {
    if (this?.__headers?.wasDirectlySet !== true && this.__requestAdapter)
      return this.__requestAdapter.headers(this.__serverRequestAndResponseData);
    else return this.__headers?.data;
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

  async arrayBuffer() {
    return undefined;
  }

  async json() {
    if (this.__error) return JSON.parse(JSON.stringify(this.__error));
    return this.body;
  }

  async blob() {
    return undefined;
  }

  async formData() {
    return undefined;
  }

  async text() {
    return undefined;
  }
}
