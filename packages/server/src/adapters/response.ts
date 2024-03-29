import ServerAdapter from '.';
import Response from '../response';
import { FileLike } from '../response/utils';

import type ServerRouterAdapter from './routers';

/**
 * Functional approach to creating a server adapter instead of the default class/inheritance approach.
 */
export function serverResponseAdapter<
  TRedirectFunction extends ServerResponseAdapter['redirect'],
  TSendFunction extends ServerResponseAdapter['send'],
  TStreamFunction extends ServerResponseAdapter['stream'],
  TSendFileFunction extends ServerResponseAdapter['sendFile']
>(args: { send: TSendFunction; redirect: TRedirectFunction; stream: TStreamFunction; sendFile: TSendFileFunction }) {
  class CustomServerResponseAdapter extends ServerResponseAdapter {
    stream = args.stream as TStreamFunction;
    sendFile = args.sendFile as TSendFileFunction;
    redirect = args.redirect as TRedirectFunction;
    send = args.send as TSendFunction;
  }

  return CustomServerResponseAdapter as {
    new (): ServerResponseAdapter & {
      redirect: TRedirectFunction;
      send: TSendFunction;
      stream: TStreamFunction;
      sendFile: TSendFileFunction;
    };
  };
}

/**
 * This code here is responsible for translating the response from the palmares framework to the server.
 */
export default class ServerResponseAdapter {
  /**
   * This function is used for handling redirects.
   *
   * @param _server The {@link ServerAdapter} adapter.
   * @param _serverRequestAndResponseData The server request and response data.
   * @param _status The status code of the response.
   * @param _headers The headers of the response.
   * @param _redirectTo The redirect url.
   *
   * @returns - A promise that resolves with the data needed for redirection. This data is the data that will be returned from the callback on
   * {@link ServerRouterAdapter.parseHandler} or {@link ServerRouterAdapter.parseHandlers}.
   */
  async redirect(
    _server: ServerAdapter,
    _serverRequestAndResponseData: any,
    _status: number,
    _headers: { [key: string]: string } | undefined,
    _redirectTo: string
  ): Promise<any> {
    return undefined;
  }

  /**
   * This function is used for handling sending data to the client.
   *
   * @param _server The {@link ServerAdapter} adapter.
   * @param _serverRequestAndResponseData The server request and response data.
   * @param _status The status code of the response.
   * @param _headers The headers of the response.
   * @param _body The body of the response.
   *
   * @returns A promise that resolves with the data needed for sending the response.
   */
  async send(
    _server: ServerAdapter,
    _serverRequestAndResponseData: any,
    _status: number,
    _headers: { [key: string]: string } | undefined,
    _body: string
  ): Promise<any> {
    return undefined;
  }

  async stream(
    _server: ServerAdapter,
    _serverRequestAndResponseData: any,
    _status: number,
    _headers: { [key: string]: string } | undefined,
    _body: AsyncGenerator<any, any, any> | Generator<any, any, any>,
    _isAsync: boolean
  ): Promise<any> {
    return undefined;
  }

  async sendFile(
    _server: ServerAdapter,
    _serverRequestAndResponseData: any,
    _status: number,
    _headers: { [key: string]: string } | undefined,
    _filePath: Blob | ArrayBuffer
  ): Promise<any> {
    return undefined;
  }
}
