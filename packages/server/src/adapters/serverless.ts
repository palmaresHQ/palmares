import { Domain } from '@palmares/core';
import { AllServerSettingsType, ServersSettingsType } from '../types';
import ServerRequestAdapter from './requests';
import ServerResponseAdapter from './response';
import ServerlessRouterAdapter from './routers/serverless';

/**
 * Functional approach to creating a server adapter instead of the default class/inheritance approach.
 */
export function serverlessAdapter<
  TServerlessRequestAdapter extends ServerlessAdapter['request'],
  TServerlessResponseAdapter extends ServerlessAdapter['response'],
  TServerlessRouterAdapter extends ServerlessAdapter['routers'],
  TLoadFunction extends ServerlessAdapter['load'],
  TStartFunction extends ServerlessAdapter['generate'],
  TCustomServerSettings extends (typeof ServerlessAdapter)['customServerSettings'],
>(args: {
  /**
   * This is the {@link ServerRequestAdapter}. The request will hold all of the request data from the server, this way we can
   * translate the original request to Palmares request, everything is all lazy loaded.
   */
  request: TServerlessRequestAdapter;
  /**
   * This is the {@link ServerResponseAdapter} instance to be used by the server so we can translate Palmares's response to the server's response.
   */
  response: TServerlessResponseAdapter;
  /**
   * This is the {@link ServerlessRouterAdapter} instance to be used by the server so we can translate Palmares's router to the server's router.
   */
  routers: TServerlessRouterAdapter;
  customServerSettings: TCustomServerSettings;
  load: TLoadFunction;
  generate: TStartFunction;
}) {
  class CustomServerAdapter extends ServerlessAdapter {
    request = args.request as TServerlessRequestAdapter;
    response = args.response as TServerlessResponseAdapter;
    routers = args.routers as TServerlessRouterAdapter;
    load = args.load as TLoadFunction;

    static customServerSettings = args.customServerSettings as TCustomServerSettings;
  }

  return CustomServerAdapter as {
    customServerSettings: TCustomServerSettings;
    new (serverName: string): ServerlessAdapter & {
      request: TServerlessRequestAdapter;
      response: TServerlessResponseAdapter;
      routers: TServerlessRouterAdapter;
      load: TLoadFunction;
    };
  };
}

export default class ServerlessAdapter {
  serverName: string;
  settings: AllServerSettingsType;
  domains: Domain[];
  routers: ServerlessRouterAdapter = new ServerlessRouterAdapter();
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

  async generate(...args: any[]): Promise<void> {
    return undefined;
  }

  static customServerSettings(args: ServersSettingsType['servers'][string]['customServerSettings']) {
    return args;
  }
}
