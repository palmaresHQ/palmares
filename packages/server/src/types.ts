import { SettingsType2 } from '@palmares/core';

import type Server from './adapters';
import type { Middleware } from './middleware';
import type Request from './request';
import Response from './response';

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
  validation?: {
    handler?: (request: Request<any, any>) => Response<any, any>;
    /**
     * Those options are used to configure how we will validate the query and the url parameters. By default we will use the `lazy` option.
     *
     * So let's explain what each option means:
     *
     * - `strict`: This will validate the query and the url parameters before the request is handled, if the validation fails, the request will be rejected.
     * - `lazy`: This will validate the query and the url parameters only when they are used, if the validation fails, the request will be rejected. This is the default option.
     * - `none`: This will not validate the query and the url parameters.
     *
     * Be aware that if you use the `strict` option we will not pass through the middlewares. Lazy option will pass through the middlewares you passed during the request lifecycle.
     */
    options?: {
      url?: 'strict' | 'lazy' | 'none';
      query?: 'strict' | 'lazy' | 'none';
    };
  };
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
