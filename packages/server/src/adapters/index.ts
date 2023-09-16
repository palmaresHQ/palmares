import { Domain } from '@palmares/core';
import { AllServerSettingsType, ServersSettingsType } from '../types';
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
  start: TStartFunction;
  close: TCloseFunction;
}) {
  class CustomServerAdapter extends ServerAdapter {
    request = args.request as TServerRequestAdapter;
    response = args.response as TServerResponseAdapter;
    routers = args.routers as ServerRouterAdapter;
    load = args.load as TLoadFunction;
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
      start: TStartFunction;
      close: TCloseFunction;
    };
  };
}

export default class ServerAdapter {
  serverName: string;
  settings: AllServerSettingsType;
  domains: Domain[];
  routers: ServerRouterAdapter = new ServerRouterAdapter();
  request: ServerRequestAdapter = new ServerRequestAdapter();
  response: ServerResponseAdapter = new ServerResponseAdapter();

  constructor(serverName: string, settings: AllServerSettingsType, domains: Domain[]) {
    this.serverName = serverName;
    this.settings = settings;
    this.domains = domains;
  }

  async load(
    _serverName: string,
    _domains: Domain[],
    _settings: ServersSettingsType['servers'][string]
  ): Promise<void> {
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
