import { Domain } from '@palmares/core';
import { ServersSettingsType } from '../types';
import ServerRequestAdapter from './requests';
import ServerResponseAdapter from './response';
import ServerRouterAdapter from './routers';

/**
 * Functional approach to creating a server adapter instead of the default class/inheritance approach.
 */
export function serverAdapter<
  TServerRequestAdapter extends ServerAdapter['request'],
  TServerResponseAdapter extends ServerAdapter['response'],
  TServerRouterAdapter extends ServerAdapter['routers'],
  TLoadFunction extends ServerAdapter['load'],
  TLoad404Function extends ServerAdapter['load404'],
  TLoad500Function extends ServerAdapter['load500'],
  TStartFunction extends ServerAdapter['start'],
  TCloseFunction extends ServerAdapter['close'],
  TCustomServerSettings extends typeof ServerAdapter['customServerSettings']
>(args: {
  /**
   * The request will hold all of the request data from the server, this way we can translate the original request to palmares request, everything is all lazy loaded.
   */
  request: TServerRequestAdapter;
  /**
   * This is the ServerResponseAdapter instance to be used by the server so we can translate Palmares's response to the server's response.
   */
  response: TServerResponseAdapter;
  /**
   * This is the ServerRouterAdapter instance to be used by the server so we can translate Palmares's router to the server's router.
   */
  routers: TServerRouterAdapter;
  customServerSettings: TCustomServerSettings;
  load: TLoadFunction;
  load404: TLoad404Function;
  load500: TLoad500Function;
  start: TStartFunction;
  close: TCloseFunction;
}) {
  class CustomServerAdapter extends ServerAdapter {
    request = args.request as TServerRequestAdapter;
    response = args.response as TServerResponseAdapter;
    routers = args.routers as ServerRouterAdapter;
    load = args.load as TLoadFunction;
    load404 = args.load404 as TLoad404Function;
    load500 = args.load500 as TLoad500Function;
    start = args.start as TStartFunction;
    close = args.close as TCloseFunction;

    static customServerSettings = args.customServerSettings as TCustomServerSettings;
  }

  return CustomServerAdapter as {
    customServerSettings: TCustomServerSettings;
    new (serverName: string): ServerAdapter & {
      request: TServerRequestAdapter;
      response: TServerResponseAdapter;
      routers: TServerRouterAdapter;
      load: TLoadFunction;
      load404: TLoad404Function;
      load500: TLoad500Function;
      start: TStartFunction;
      close: TCloseFunction;
    };
  };
}

export default class ServerAdapter {
  serverName: string;
  routers: ServerRouterAdapter = new ServerRouterAdapter();
  request: ServerRequestAdapter = new ServerRequestAdapter();
  response: ServerResponseAdapter = new ServerResponseAdapter();

  constructor(serverName: string) {
    this.serverName = serverName;
  }

  async load(
    _serverName: string,
    _domains: Domain[],
    _settings: ServersSettingsType['servers'][string]
  ): Promise<void> {
    return undefined;
  }

  async load404(_handler: ServersSettingsType['servers'][string]['handler404']): Promise<void> {
    return undefined;
  }

  async load500(_handler: ServersSettingsType['servers'][string]['handler500']): Promise<void> {
    return undefined;
  }

  async start(_serverName: string, _port: number, _logServerStart: () => void): Promise<void> {
    return undefined;
  }

  async close(): Promise<void> {
    return undefined;
  }

  static customServerSettings(args: ServersSettingsType['servers'][string]['customServerSettings']) {
    return args;
  }
}
