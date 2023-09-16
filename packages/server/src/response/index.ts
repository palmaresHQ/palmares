import {
  DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_JSON,
  DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY,
  DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY,
} from '../defaults';
import { HTTP_200_OK, HTTP_302_FOUND, RedirectionStatusCodes, StatusCodes } from './status';

export default class Response<
  TBody = undefined,
  TResponse extends {
    status?: StatusCodes;
    headers?: object | unknown;
    context?: object | unknown;
  } = {
    status: undefined;
    headers: undefined;
    context: undefined;
  }
> {
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

  statusText!: string;
  status!: TResponse['status'] extends StatusCodes ? TResponse['status'] : undefined;
  body?: TBody;
  headers!: TResponse['headers'] extends object ? TResponse['headers'] : undefined;
  context!: TResponse['context'] extends object ? TResponse['context'] : undefined;

  constructor(body?: TBody, options?: TResponse & { statusText?: string }) {
    this.body = body;
    this.statusText = options?.statusText as string;
    this.status = options?.status as TResponse['status'] extends StatusCodes ? TResponse['status'] : undefined;
    this.headers = options?.headers as TResponse['headers'] extends object ? TResponse['headers'] : undefined;
    this.context = options?.context as TResponse['context'] extends object ? TResponse['context'] : undefined;
  }

  static json<
    TBody extends object,
    TResponse extends {
      status?: StatusCodes;
      headers?: object | unknown;
      context?: object | unknown;
    } = {
      status: undefined;
      headers: undefined;
      context: undefined;
    }
  >(body: TBody, options?: TResponse & { statusText?: string }) {
    const isStatusNotDefined = typeof options?.status !== 'number';
    const hasNotDefinedJsonHeader =
      (options?.headers as any)?.[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY] !==
      DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_JSON;

    // Define default status and statusText.
    if (isStatusNotDefined) {
      if (options) options.status = HTTP_200_OK;
      else options = { status: HTTP_200_OK } as TResponse;
      options.statusText = typeof options.statusText === 'string' ? options.statusText : 'OK';
    }

    if (hasNotDefinedJsonHeader) {
      if (options) {
        if (options.headers)
          (options.headers as any)[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY] =
            DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_JSON;
        else
          options.headers = {
            [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_JSON,
          };
      } else
        options = {
          headers: { [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_JSON },
        } as TResponse;
    }

    return new Response<TBody, TResponse>(JSON.stringify(body) as unknown as TBody, options);
  }

  static redirect<
    TResponse extends {
      status?: RedirectionStatusCodes;
      headers?: object | unknown;
      context?: object | unknown;
    } = {
      status: undefined;
      headers: undefined;
      context: undefined;
    }
  >(url: string, options?: TResponse) {
    if (options) {
      if (options.headers) (options.headers as any)[DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY] = url;
      else options.headers = { [DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY]: url };
    } else options = { headers: { [DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY]: url } } as TResponse;

    if (typeof options.status !== 'number') options.status = HTTP_302_FOUND;

    return new Response<undefined, TResponse>(undefined, options);
  }

  clone() {
    return new Response<TBody, TResponse>();
  }

  serverData<T>(): T {
    return this.__serverRequestAndResponseData;
  }

  async json() {
    const isNotAJsonResponse =
      (this.headers as any)?.[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY] !==
        DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_JSON && typeof this.body !== 'string';
    if (isNotAJsonResponse) return undefined as TBody;
    return JSON.parse(this.body as string) as TBody;
  }
}
