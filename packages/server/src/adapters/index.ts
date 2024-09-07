import { ServerRequestAdapter } from './requests';
import { ServerResponseAdapter } from './response';
import { ServerRouterAdapter } from './routers';

import type { AllServerSettingsType, ServersSettingsType } from '../types';
import type { Domain } from '@palmares/core';

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
  TCustomServerSettings extends (typeof ServerAdapter)['customServerSettings']
>(args: {
  /**
   * This is the {@link ServerRequestAdapter}. The request will hold all of the request data from
   * the server, this way we can translate the original request to Palmares request, everything
   * is all lazy loaded.
   */
  request: TServerRequestAdapter;
  /**
   * This is the {@link ServerResponseAdapter} instance to be used by the server so we can
   * translate Palmares's response to the server's response.
   */
  response: TServerResponseAdapter;
  /**
   * This is the {@link ServerRouterAdapter} instance to be used by the server so we can translate
   * Palmares's router to the server's router.
   */
  routers: TServerRouterAdapter;
  customServerSettings: TCustomServerSettings;
  /**
   * This is the function that will be called by Palmares to load the server. Usually you add the
   * server constructor here. Notice that this function DOES NOT start the server, it will be used
   * for adding middleware, custom logic, etc.
   *
   * You can use a global Map to store the server instance, this way you can access it later on the
   * start function. Since this is functional and not class based.
   *
   * @example
   * ```
   * load: async (serverName, _domains: Domain[], settings: ServerSettingsTypeExpress) => {
   *    let server: Express | undefined = servers.get(serverName)?.server;
   *    if (!server) {
   *      server = express();
   *      servers.set(serverName, { server, settings });
   *    }
   *    if (settings?.customServerSettings?.middlewares) {
   *      settings.customServerSettings.middlewares.forEach((middleware) => {
   *      server?.use(middleware);
   *    });
   *  }
   * },
   * ```
   *
   * @param serverName - The name of the server, by default a palmares application can contain multiple servers.
   * @param domains - All of the domains of the application, usually you will not need this, but can be useful.
   * @param settings - The settings for the server.
   */
  load: TLoadFunction;
  /**
   * This is the function that will be called by Palmares to start the server. Usually you start the server here.
   * Most servers have a `.listen`, that's what you will call here.
   *
   * Use the logServerStart function to log to the user that the server has started.
   *
   * @example
   * ```
   * start: async (serverName, port, logServerStart) => {
   *    const serverInstanceToStart = servers.get(serverName);
   *    if (serverInstanceToStart) {
   *     serverInstanceToStart.server.listen(port, () => logServerStart());
   *   }
   * },
   * ```
   *
   * @param serverName - The name of the server, by default a palmares application can contain multiple servers.
   * @param port - The port to start the server on.
   * @param logServerStart - A function that you can call to log to the user that the server has started.
   */
  start: TStartFunction;
  /**
   * Custom function to call when we receive a SIGINT or SIGTERM signal. With that you can close the server gracefully.
   *
   * @example
   * ```
   * close: async () => {
   *   console.log('closing the server');
   * },
   * ```
   */
  close: TCloseFunction;
}) {
  class CustomServerAdapter extends ServerAdapter {
    request = args.request;
    response = args.response;
    routers = args.routers as ServerRouterAdapter;
    load = args.load;
    start = args.start;
    close = args.close;

    static customServerSettings = args.customServerSettings;
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

export class ServerAdapter {
  $$type = '$PServerAdapter';
  serverName: string;
  settings: AllServerSettingsType['servers'][string];
  allSettings: AllServerSettingsType;
  domains: Domain[];
  routers: ServerRouterAdapter = new ServerRouterAdapter();
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

  /**
   * This is the function that will be called by Palmares to load the server. Usually you add the
   * server constructor here. Notice that this function DOES NOT start the server, it will be used
   * for adding middleware, custom logic, etc.
   *
   * You can use a global Map to store the server instance, this way you can access it later on the
   * start function. Since this is functional and not class based.
   *
   * @example
   * ```
   * load: async (serverName, _domains: Domain[], settings: ServerSettingsTypeExpress) => {
   *    let server: Express | undefined = servers.get(serverName)?.server;
   *    if (!server) {
   *      server = express();
   *      servers.set(serverName, { server, settings });
   *    }
   *    if (settings?.customServerSettings?.middlewares) {
   *      settings.customServerSettings.middlewares.forEach((middleware) => {
   *      server?.use(middleware);
   *    });
   *  }
   * },
   * ```
   *
   * @param serverName - The name of the server, by default a palmares application can contain multiple servers.
   * @param domains - All of the domains of the application, usually you will not need this, but can be useful.
   * @param settings - The settings for the server.
   */
  // eslint-disable-next-line ts/require-await
  async load(
    _serverName: string,
    _domains: Domain[],
    _settings: ServersSettingsType['servers'][string]
  ): Promise<void> {
    return undefined;
  }

  /**
   * This is the function that will be called by Palmares to start the server. Usually you start the server here.
   * Most servers have a `.listen`, that's what you will call here.
   *
   * Use the logServerStart function to log to the user that the server has started.
   *
   * @example
   * ```
   * start: async (serverName, port, logServerStart) => {
   *    const serverInstanceToStart = servers.get(serverName);
   *    if (serverInstanceToStart) {
   *     serverInstanceToStart.server.listen(port, () => logServerStart());
   *   }
   * },
   * ```
   *
   * @param serverName - The name of the server, by default a palmares application can contain multiple servers.
   * @param port - The port to start the server on.
   * @param logServerStart - A function that you can call to log to the user that the server has started.
   */
  // eslint-disable-next-line ts/require-await
  async start(_serverName: string, _port: number, _logServerStart: () => void): Promise<void> {
    return undefined;
  }

  /**
   * Custom function to call when we receive a SIGINT or SIGTERM signal. With that you can close the server gracefully.
   *
   * @example
   * ```
   * close: async () => {
   *   console.log('closing the server');
   * },
   * ```
   */
  // eslint-disable-next-line ts/require-await
  async close(): Promise<void> {
    return undefined;
  }

  static customServerSettings(args: ServersSettingsType['servers'][string]['customServerSettings']) {
    return args;
  }
}
