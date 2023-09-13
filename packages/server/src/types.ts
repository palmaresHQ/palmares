import { SettingsType2 } from '@palmares/core';

import type Server from './adapters';
import type { Middleware } from './middleware';

export type AllServerSettingsType<TCustomServerSettings = unknown> = SettingsType2 &
  ServersSettingsType<TCustomServerSettings>;

export type ServerSettingsType<TCustomServerSettings = unknown> = {
  server: typeof Server;
  /** Defaults to 4000 */
  port?: number;
  /** This is the settings for when initializing the server, for example custom options for express initialization or custom options for fastify initialization */
  customServerSettings?: TCustomServerSettings;
  prefix?: string;
  handler404?: Required<Omit<Middleware, 'response'>>;
  handler500?: Required<Omit<Middleware, 'response'>>;
};

export type ServersSettingsType<TCustomServerSettings = unknown> = {
  servers: Record<
    string,
    {
      server: typeof Server;
      /** Defaults to 4000 */
      port?: number;
      /** This is the settings for when initializing the server, for example custom options for express initialization or custom options for fastify initialization */
      customServerSettings?: TCustomServerSettings;
      prefix?: string;
      handler404?: Required<Omit<Middleware, 'response'>>;
      handler500?: Required<Omit<Middleware, 'response'>>;
    }
  >;
};
