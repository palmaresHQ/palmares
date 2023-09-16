import ServerAdapter from '.';
import { BaseRouter } from '../router/routers';
import ServerResponseAdapter from './response';

/**
 * Functional approach to creating a server adapter instead of the default class/inheritance approach.
 */
export function serverRouterAdapter<
  TParseRouteFunction extends ServerRouterAdapter['parseRoute'],
  TParseHandlerFunction extends ServerRouterAdapter['parseHandler'],
  TLoad404Function extends ServerRouterAdapter['load404'],
  TLoad500Function extends ServerRouterAdapter['load500']
>(args: {
  parseRoute: TParseRouteFunction;
  parseHandler: TParseHandlerFunction;
  load404: TLoad404Function;
  load500: TLoad500Function;
}) {
  class CustomServerRouterAdapter extends ServerRouterAdapter {
    parseRoute = args.parseRoute as TParseRouteFunction;
    parseHandler = args.parseHandler as TParseHandlerFunction;
    load404 = args.load404 as TLoad404Function;
    load500 = args.load500 as TLoad500Function;
  }

  return CustomServerRouterAdapter as {
    new (): ServerRouterAdapter & {
      parseRoute: TParseRouteFunction;
      parseHandler: TParseHandlerFunction;
      load404: TLoad404Function;
      load500: TLoad500Function;
    };
  };
}

export default class ServerRouterAdapter {
  async load404(
    _server: ServerAdapter,
    _handler: (serverRequestAndResponseData: any) => ReturnType<ServerResponseAdapter['send']>
  ): Promise<void> {
    return undefined;
  }

  async load500(
    _server: ServerAdapter,
    _handler: (serverRequestAndResponseData: any) => ReturnType<ServerResponseAdapter['send']>
  ): Promise<void> {
    return undefined;
  }

  parseRoute(
    _server: ServerAdapter,
    _partOfPath: string,
    _urlParamType?: Parameters<BaseRouter['__urlParamsAndPath']['params']['set']>[1]
  ): string | undefined {
    return undefined;
  }

  parseHandler(
    _server: ServerAdapter,
    _path: string,
    _method: string,
    _handler: (serverRequestAndResponseData: any) => ReturnType<ServerResponseAdapter['send']>,
    _queryParams: BaseRouter['__queryParamsAndPath']['params']
  ) {
    return undefined;
  }
}
