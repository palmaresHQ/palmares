import ServerAdapter from '.';

/**
 * Functional approach to creating a server adapter instead of the default class/inheritance approach.
 */
export function serverResponseAdapter<
  TBodyFunction extends ServerResponseAdapter['body'],
  THeadersFunction extends ServerResponseAdapter['headers'],
  TStatusFunction extends ServerResponseAdapter['status'],
  TSendFunction extends ServerResponseAdapter['send']
>(args: { body: TBodyFunction; headers: THeadersFunction; status: TStatusFunction; send: TSendFunction }) {
  class CustomServerResponseAdapter extends ServerResponseAdapter {
    body = args.body as TBodyFunction;
    headers = args.headers as THeadersFunction;
    status = args.status as TStatusFunction;
    send = args.send as TSendFunction;
  }

  return CustomServerResponseAdapter as {
    new (): ServerResponseAdapter & {
      body: TBodyFunction;
      headers: THeadersFunction;
      status: TStatusFunction;
      send: TSendFunction;
    };
  };
}

export default class ServerResponseAdapter {
  async body(_server: ServerAdapter, _serverRequestAndResponseData: any, _body: any): Promise<any> {
    return undefined;
  }

  async headers(_server: ServerAdapter, _serverRequestAndResponseData: any, _headers: any): Promise<any> {
    return undefined;
  }

  async status(_server: ServerAdapter, _serverRequestAndResponseData: any, _status: any): Promise<number | undefined> {
    return undefined;
  }

  async send(
    _server: ServerAdapter,
    _serverRequestAndResponseData: any,
    _status: number,
    _headers: Awaited<ReturnType<ServerResponseAdapter['headers']>>,
    _body: Awaited<ReturnType<ServerResponseAdapter['body']>>
  ): Promise<any> {
    return undefined;
  }
}
