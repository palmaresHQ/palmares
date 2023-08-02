import type {
  ExtractQueryParamsFromPathType,
  ExtractUrlParamsFromPathType,
} from './types';

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
  method!: TRequest['Method'];
  readonly query!: ExtractQueryParamsFromPathType<TRoutePath>;
  readonly params!: ExtractUrlParamsFromPathType<TRoutePath>;
  readonly body!: TRequest['Body'];
  readonly headers!: TRequest['Headers'];
  readonly cookies!: TRequest['Cookies'];
  context!: TRequest['Context'];
  readonly cache!:
    | 'default'
    | 'no-store'
    | 'reload'
    | 'no-cache'
    | 'force-cache'
    | 'only-if-cached';
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
    this.headers = options?.headers;
    this.cookies = options?.cookies;
  }

  clone<
    TNewRequest extends {
      Method?:
        | 'GET'
        | 'POST'
        | 'PUT'
        | 'DELETE'
        | 'PATCH'
        | 'OPTIONS'
        | 'HEAD'
        | 'CONNECT'
        | 'TRACE';
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
