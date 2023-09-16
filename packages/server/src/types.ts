import { SettingsType2 } from '@palmares/core';

import type Server from './adapters';
import type { Middleware } from './middleware';

export type AllServerSettingsType<TCustomServerSettings = unknown> = SettingsType2 &
  ServersSettingsType<TCustomServerSettings>;

export type ServerSettingsType<TCustomServerSettings = unknown> = {
  server: typeof Server;
  /**
   * The root middlewares to be used by the server, all routes will be wrapped by those middlewares. Use case is for cors, authentication and so on.
   */
  middlewares?: Middleware[];
  /** Defaults to 4000 */
  port?: number;
  /** This is the settings for when initializing the server, for example custom options for express initialization or custom options for fastify initialization */
  customServerSettings?: TCustomServerSettings;
  prefix?: string;
  handler404?: Required<Middleware>['response'];
  handler500?: Required<Middleware>['response'];
};

export type ServersSettingsType<TCustomServerSettings = unknown> = {
  servers: Record<string, ServerSettingsType<TCustomServerSettings>>;
  /**
   * Used for debugging purposes, it will show a error screen when an error occurs when trying to open the request. Defaults to true.
   *
   * PLEASE, MAKE SURE TO SET THIS TO FALSE ON PRODUCTION.
   */
  debug?: boolean;
};
