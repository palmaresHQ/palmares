import { ServerRequestAdapter } from './requests';
import { ServerResponseAdapter } from './response';
import { ServerlessRouterAdapter } from './routers/serverless';

import type { AllServerSettingsType, ServerSettingsType } from '../types';
import type { Domain } from '@palmares/core';

/**
 * Functional approach to creating a server adapter instead of the default class/inheritance approach.
 */
export function serverlessAdapter<
  TServerlessRequestAdapter extends ServerlessAdapter['request'],
  TServerlessResponseAdapter extends ServerlessAdapter['response'],
  TServerlessRouterAdapter extends ServerlessAdapter['routers'],
  TLoadFunction extends ServerlessAdapter['load'],
  TStartFunction extends ServerlessAdapter['generate'],
  TCustomServerSettings extends (typeof ServerlessAdapter)['customServerSettings']
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
    request = args.request;
    response = args.response;
    routers = args.routers;
    load = args.load;

    static customServerSettings = args.customServerSettings;
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

export class ServerlessAdapter {
  $$type = '$PServerlessAdapter';
  serverName: string;
  settings: ServerSettingsType;
  allSettings: AllServerSettingsType;
  domains: Domain[];
  routers: ServerlessRouterAdapter = new ServerlessRouterAdapter();
  request: ServerRequestAdapter = new ServerRequestAdapter();
  response: ServerResponseAdapter = new ServerResponseAdapter();

  constructor(
    serverName: string,
    allSettings: AllServerSettingsType,
    settings: AllServerSettingsType['servers'][string],
    domains: Domain[]
  ) {
    this.serverName = serverName;
    this.settings = settings;
    this.allSettings = allSettings;
    this.domains = domains;
  }

  // eslint-disable-next-line ts/require-await
  async load(
    _serverName: string,
    _domains: Domain[],
    _settings: AllServerSettingsType['servers'][string]
  ): Promise<void> {
    return undefined;
  }

  // eslint-disable-next-line ts/require-await
  async generate(..._args: any[]): Promise<void> {
    return undefined;
  }

  static customServerSettings(args: AllServerSettingsType['servers'][string]['customServerSettings']) {
    return args;
  }
}
