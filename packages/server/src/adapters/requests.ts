import ServerAdapter from '.';

/**
 * Functional approach to creating a server adapter instead of the default class/inheritance approach.
 */
export function serverRequestAdapter<
  THeadersFunction extends ServerRequestAdapter['headers'],
  TParamsFunction extends ServerRequestAdapter['params'],
  TQueryFunction extends ServerRequestAdapter['query'],
  TToJsonFunction extends ServerRequestAdapter['toJson'],
  TToFormDataFunction extends ServerRequestAdapter['toFormData'],
  TToArrayBufferFunction extends ServerRequestAdapter['toArrayBuffer'],
  TToBlobFunction extends ServerRequestAdapter['toBlob'],
  TToTextFunction extends ServerRequestAdapter['toText'],
  TCookiesFunction extends ServerRequestAdapter['cookies']
>(args: {
  headers: THeadersFunction;
  params: TParamsFunction;
  query: TQueryFunction;
  toJson: TToJsonFunction;
  toFormData: TToFormDataFunction;
  toArrayBuffer: TToArrayBufferFunction;
  toBlob: TToBlobFunction;
  toText: TToTextFunction;
  cookies: TCookiesFunction;
}) {
  class CustomServerRequestAdapter extends ServerRequestAdapter {
    headers = args.headers;
    params = args.params;
    query = args.query;
    toJson = args.toJson;
    toFormData = args.toFormData;
    toArrayBuffer = args.toArrayBuffer;
    toBlob = args.toBlob;
    toText = args.toText;
    cookies = args.cookies;
  }

  return CustomServerRequestAdapter as {
    new (): ServerRequestAdapter & {
      headers: THeadersFunction;
      params: TParamsFunction;
      query: TQueryFunction;
      toJson: TToJsonFunction;
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

  toJson(_server: ServerAdapter, _serverRequestAndResponseData: any): Promise<object | undefined> {
    return new Promise((resolve) => resolve(undefined));
  }

  toFormData(_server: ServerAdapter, _serverRequestAndResponseData: any): Promise<URLSearchParams | undefined> {
    return new Promise((resolve) => resolve(undefined));
  }

  toArrayBuffer(_server: ServerAdapter, _serverRequestAndResponseData: any): Promise<ArrayBuffer | undefined> {
    return new Promise((resolve) => resolve(undefined));
  }

  toBlob(_server: ServerAdapter, _serverRequestAndResponseData: any): Promise<Blob | undefined> {
    return new Promise((resolve) => resolve(undefined));
  }

  toText(_server: ServerAdapter, _serverRequestAndResponseData: any): Promise<string | undefined> {
    return new Promise((resolve) => resolve(undefined));
  }

  cookies(_server: ServerAdapter, _serverRequestAndResponseData: any): any {
    return undefined;
  }
}
