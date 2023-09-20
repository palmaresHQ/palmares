import ServerAdapter from '.';
import { formDataLikeFactory } from '../request/utils';

/**
 * Functional approach to creating a server adapter instead of the default class/inheritance approach.
 */
export function serverRequestAdapter<
  TMethodFunction extends ServerRequestAdapter['method'],
  THeadersFunction extends ServerRequestAdapter['headers'],
  TParamsFunction extends ServerRequestAdapter['params'],
  TQueryFunction extends ServerRequestAdapter['query'],
  TToJsonFunction extends ServerRequestAdapter['toJson'],
  TCustomToJsonOptionsFunction extends typeof ServerRequestAdapter['customToJsonOptions'],
  TToFormDataFunction extends ServerRequestAdapter['toFormData'],
  TCustomToFormDataOptionsFunction extends typeof ServerRequestAdapter['customToFormDataOptions'],
  TToArrayBufferFunction extends ServerRequestAdapter['toArrayBuffer'],
  TCustomToArrayBufferOptionsFunction extends typeof ServerRequestAdapter['customToArrayBufferOptions'],
  TToBlobFunction extends ServerRequestAdapter['toBlob'],
  TCustomToBlobOptionsFunction extends typeof ServerRequestAdapter['customToBlobOptions'],
  TToTextFunction extends ServerRequestAdapter['toText'],
  TCustomToTextOptionsFunction extends typeof ServerRequestAdapter['customToTextOptions'],
  TCookiesFunction extends ServerRequestAdapter['cookies']
>(args: {
  method: TMethodFunction;
  /**
   * Translates the headers from the server request to the headers of the request to the API. This is lazy loaded, so it will only parse the headers when you actually need it.
   */
  headers: THeadersFunction;
  /**
   * Translates the params from the server request to the params of the request to the API. This is lazy loaded, so it will only parse the params when you actually need it.
   */
  params: TParamsFunction;
  query: TQueryFunction;
  toJson: TToJsonFunction;
  /**
   * This should return something when the request Content-Type is a `multipart/form-data` or `application/x-www-form-urlencoded` request. This is lazy loaded, so
   * it will only parse the data when you actually need it.
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
   * @param _isUrlEncoded - Whether or not the request is a `application/x-www-form-urlencoded` request. If not, it's a `multipart/form-data` request.
   * @param _options - Any type of custom options that you want to be able to pass when converting to FormData.
   *
   * @returns -A promise that resolves to a FormData-like instance.
   */
  toFormData: TToFormDataFunction;
  /**
   * If you want to pass custom options to the `toFormData` method, you can override this method, the user will need to call this method so he can have intellisense on the options.
   *
   * You can totally ignore this method and just pass the options directly to the `toFormData` method.
   *
   * @param args - The arguments that you want to pass to the `toFormData` method.
   */
  customToFormDataOptions?: TCustomToFormDataOptionsFunction;
  customToJsonOptions?: TCustomToJsonOptionsFunction;
  customToArrayBufferOptions?: TCustomToArrayBufferOptionsFunction;
  customToBlobOptions?: TCustomToBlobOptionsFunction;
  customToTextOptions?: TCustomToTextOptionsFunction;
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
    method = args.method;
    headers = args.headers;
    params = args.params;
    query = args.query;
    cookies = args.cookies;

    toJson = args.toJson;
    static customToJsonOptions = args.customToJsonOptions || ServerRequestAdapter.customToJsonOptions;

    toFormData = args.toFormData;
    static customToFormDataOptions = args.customToFormDataOptions || ServerRequestAdapter.customToFormDataOptions;

    toArrayBuffer = args.toArrayBuffer;
    static customToArrayBufferOptions =
      args.customToArrayBufferOptions || ServerRequestAdapter.customToArrayBufferOptions;

    toBlob = args.toBlob;
    static customToBlobOptions = args.customToBlobOptions || ServerRequestAdapter.customToBlobOptions;

    toText = args.toText;
    static customToTextOptions = args.customToTextOptions || ServerRequestAdapter.customToTextOptions;
  }

  return CustomServerRequestAdapter as {
    customToFormDataOptions?: TCustomToFormDataOptionsFunction;
    customToJsonOptions?: TCustomToJsonOptionsFunction;
    customToArrayBufferOptions?: TCustomToArrayBufferOptionsFunction;
    customToBlobOptions?: TCustomToBlobOptionsFunction;
    customToTextOptions?: TCustomToTextOptionsFunction;
    new (): ServerRequestAdapter & {
      method: TMethodFunction;
      headers: THeadersFunction;
      params: TParamsFunction;
      query: TQueryFunction;
      cookies: TCookiesFunction;
      toJson: TToJsonFunction;
      toFormData: TToFormDataFunction;
      toArrayBuffer: TToArrayBufferFunction;
      toBlob: TToBlobFunction;
      toText: TToTextFunction;
    };
  };
}

export default class ServerRequestAdapter {
  headers(_server: ServerAdapter, _serverRequestAndResponseData: any, _key: string): string | undefined {
    return undefined;
  }

  method(_server: ServerAdapter, _serverRequestAndResponseData: any): string {
    return '';
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
   * This should return something when the request Content-Type is a `multipart/form-data` or `application/x-www-form-urlencoded` request. This is lazy loaded, so
   * it will only parse the data when you actually need it.
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
   * @param _isUrlEncoded - Whether or not the request is a `application/x-www-form-urlencoded` request. If not, it's a `multipart/form-data` request.
   * @param _options - Any type of custom options that you want to be able to pass when converting to FormData.
   *
   * @returns -A promise that resolves to a FormData-like instance.
   */
  toFormData(
    _server: ServerAdapter,
    _serverRequestAndResponseData: any,
    _formDataConstructor: ReturnType<typeof formDataLikeFactory>,
    _isUrlEncoded: boolean,
    _options: any
  ): Promise<InstanceType<ReturnType<typeof formDataLikeFactory>>> {
    return new Promise((resolve) => resolve(new (formDataLikeFactory())()));
  }

  toArrayBuffer(
    _server: ServerAdapter,
    _serverRequestAndResponseData: any,
    _options: any
  ): Promise<ArrayBuffer | undefined> {
    return new Promise((resolve) => resolve(undefined));
  }

  toBlob(_server: ServerAdapter, _serverRequestAndResponseData: any, _options: any): Promise<Blob | undefined> {
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
  toText(_server: ServerAdapter, _serverRequestAndResponseData: any, _options: any): Promise<string | undefined> {
    return new Promise((resolve) => resolve(undefined));
  }

  cookies(_server: ServerAdapter, _serverRequestAndResponseData: any): any {
    return undefined;
  }

  /**
   * If you want to pass custom options to the `toFormData` method, you can override this method, the user will need to call this method so he can have intellisense on the options.
   *
   * You can totally ignore this method and just pass the options directly to the `toFormData` method.
   *
   * @param args - The arguments that you want to pass to the `toFormData` method.
   */
  static customToFormDataOptions(args: any): any {
    return args;
  }

  static customToJsonOptions(args: any): any {
    return args;
  }

  static customToTextOptions(args: any): any {
    return args;
  }

  static customToBlobOptions(args: any): any {
    return args;
  }

  static customToArrayBufferOptions(args: any): any {
    return args;
  }
}
