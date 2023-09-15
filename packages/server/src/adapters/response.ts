import ServerAdapter from '.';
import Response from '../response';

/**
 * Functional approach to creating a server adapter instead of the default class/inheritance approach.
 */
export function serverResponseAdapter<
  TRedirectFunction extends ServerResponseAdapter['redirect'],
  TSendFunction extends ServerResponseAdapter['send']
>(args: { send: TSendFunction; redirect: TRedirectFunction }) {
  class CustomServerResponseAdapter extends ServerResponseAdapter {
    redirect = args.redirect as TRedirectFunction;
    send = args.send as TSendFunction;
  }

  return CustomServerResponseAdapter as {
    new (): ServerResponseAdapter & {
      redirect: TRedirectFunction;
      send: TSendFunction;
    };
  };
}

/**
 * This code here is responsible for translating the response from the palmares framework to the server.
 */
export default class ServerResponseAdapter {
  async redirect(
    _server: ServerAdapter,
    _serverRequestAndResponseData: any,
    _status: number,
    _headers: Response['headers'],
    _redirectTo: string
  ): Promise<any> {
    return undefined;
  }

  async send(
    _server: ServerAdapter,
    _serverRequestAndResponseData: any,
    _status: number,
    _headers: Response['headers'],
    _body: Response['body']
  ): Promise<any> {
    return undefined;
  }
}
