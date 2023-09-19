import ServerAdapter from '.';
import { formDataLikeFactory } from '../request/utils';

/**
 * Functional approach to creating a server adapter instead of the default class/inheritance approach.
 */
export function serverRequestAdapter<
  THeadersFunction extends ServerRequestAdapter['headers'],
  TParamsFunction extends ServerRequestAdapter['params'],
  TQueryFunction extends ServerRequestAdapter['query'],
  TToJsonFunction extends ServerRequestAdapter['toJson'],
  TToFormDataFunction extends ServerRequestAdapter['toFormData'],
  TCustomToFormDataOptionsFunction extends typeof ServerRequestAdapter['customToFormDataOptions'],
  TToArrayBufferFunction extends ServerRequestAdapter['toArrayBuffer'],
  TToBlobFunction extends ServerRequestAdapter['toBlob'],
  TToTextFunction extends ServerRequestAdapter['toText'],
  TCookiesFunction extends ServerRequestAdapter['cookies']
>(args: {
  /**
   * Translates the headers from the server request to the headers of the request to the API. This is lazy loaded, so it will only parse the headers when you actully need it.
   */
  headers: THeadersFunction;
  /**
   * Translates the params from the server request to the params of the request to the API. This is lazy loaded, so it will only parse the params when you actully need it.
   */
  params: TParamsFunction;
  query: TQueryFunction;
  toJson: TToJsonFunction;
  /**
   * Transforms the data to a FormData-like instance. FormData is not available on Node.js and other runtimes, so in order to support it we have created a FormData-like class that
   * follows the same api as the original FormData.
   *
   * see: https://developer.mozilla.org/en-US/docs/Web/API/FormData
   *
   * Because it's a custom class, we add some useful stuff like the ability to lazy load the data, so it will only parse the data when you actually need it.
   *
   * @param _server - The server adapter.
   * @param _serverRequestAndResponseData - The server request and response data that you have defined on `parseHandler` on the router.
   * @param _formDataConstructor - The constructor of the FormData-like class. It's a class so you should use it like this: `new formDataConstructor()`. You can pass a custom
   * proxyCallback, this will lazy load the values when you actually need it.
   * @param _options - Any type of custom options that you want to be able to pass when converting to FormData.
   *
   * @returns -A promise that resolves to a FormData-like instance.
   */
  toFormData: TToFormDataFunction;
  customToFormDataOptions?: TCustomToFormDataOptionsFunction;
  toArrayBuffer: TToArrayBufferFunction;
  toBlob: TToBlobFunction;
  /**
   * Translates the request to a string. Should be used for text/plain requests.
   *
   * @param _server - The server adapter.
   * @param _serverRequestAndResponseData - The server request and response data that you have defined on `parseHandler` on the router.
   * @param _options - Any type of custom options that you want to be able to pass when converting to text.
   *
   * @returns A promise that resolves to a string.
   */
  toText: TToTextFunction;
  cookies: TCookiesFunction;
}) {
  class CustomServerRequestAdapter extends ServerRequestAdapter {
    headers = args.headers;
    params = args.params;
    query = args.query;
    toJson = args.toJson;
    toFormData = args.toFormData;
    static customToFormDataOptions = args.customToFormDataOptions || ServerRequestAdapter.customToFormDataOptions;
    toArrayBuffer = args.toArrayBuffer;
    toBlob = args.toBlob;
    toText = args.toText;
    cookies = args.cookies;
  }

  return CustomServerRequestAdapter as {
    customToFormDataOptions?: TCustomToFormDataOptionsFunction;
    new (): ServerRequestAdapter & {
      headers: THeadersFunction;
      params: TParamsFunction;
      query: TQueryFunction;
      toJson: TToJsonFunction;
      formDataConstructor: () => ReturnType<typeof formDataLikeFactory>;
      toFormData: TToFormDataFunction;
      toArrayBuffer: TToArrayBufferFunction;
      toBlob: TToBlobFunction;
      toText: TToTextFunction;
      cookies: TCookiesFunction;
    };
  };
}

export default class ServerRequestAdapter {
  headers(_server: ServerAdapter, _serverRequestAndResponseData: any, _key: string): string | undefined {
    return undefined;
  }

  params(_server: ServerAdapter, _serverRequestAndResponseData: any, _key: string): string | undefined {
    return undefined;
  }

  query(_server: ServerAdapter, _serverRequestAndResponseData: any, _key: string): string | undefined {
    return undefined;
  }

  /**
   * When the request is a `application/json` request, this should return the parsed json.
   *
   * You can pass custom options to this method from the `json` method on the `Request`.
   */
  toJson(_server: ServerAdapter, _serverRequestAndResponseData: any, _options: any): Promise<object | undefined> {
    return new Promise((resolve) => resolve(undefined));
  }

  /**
   * This should return something when the request is a multipart/form-data request. This is lazy loaded, so it will only parse the data when you actually need it.
   * Transforms the data to a FormData-like instance. FormData is not available on Node.js and other runtimes, so in order to support it we have created a FormData-like class that
   * follows the same api as the original FormData.
   *
   * see: https://developer.mozilla.org/en-US/docs/Web/API/FormData
   *
   * Because it's a custom class, we add some useful stuff like the ability to lazy load the data, so it will only parse the data when you actually need it.
   *
   * @param _server - The server adapter.
   * @param _serverRequestAndResponseData - The server request and response data that you have defined on `parseHandler` on the router.
   * @param _formDataConstructor - The constructor of the FormData-like class. It's a class so you should use it like this: `new formDataConstructor()`. You can pass a custom
   * proxyCallback, this will lazy load the values when you actually need it.
   * @param _options - Any type of custom options that you want to be able to pass when converting to FormData.
   *
   * @returns -A promise that resolves to a FormData-like instance.
   */
  toFormData(
    _server: ServerAdapter,
    _serverRequestAndResponseData: any,
    _formDataConstructor: ReturnType<typeof formDataLikeFactory>,
    _options: any
  ): Promise<InstanceType<ReturnType<typeof formDataLikeFactory>>> {
    return new Promise((resolve) => resolve(new (formDataLikeFactory())()));
  }

  toArrayBuffer(_server: ServerAdapter, _serverRequestAndResponseData: any): Promise<ArrayBuffer | undefined> {
    return new Promise((resolve) => resolve(undefined));
  }

  toBlob(_server: ServerAdapter, _serverRequestAndResponseData: any): Promise<Blob | undefined> {
    return new Promise((resolve) => resolve(undefined));
  }

  /**
   * Translates the request to a string. Should be used for text/plain requests.
   *
   * @param _server - The server adapter.
   * @param _serverRequestAndResponseData - The server request and response data that you have defined on `parseHandler` on the router.
   * @param _options - Any type of custom options that you want to be able to pass when converting to text.
   *
   * @returns A promise that resolves to a string.
   */
  toText(_server: ServerAdapter, _serverRequestAndResponseData: any): Promise<string | undefined> {
    return new Promise((resolve) => resolve(undefined));
  }

  cookies(_server: ServerAdapter, _serverRequestAndResponseData: any): any {
    return undefined;
  }

  static customToFormDataOptions(args: any): any {
    return args;
  }
}
