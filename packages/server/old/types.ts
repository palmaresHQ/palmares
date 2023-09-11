import { SettingsType, SettingsType2 } from '@palmares/core';
import Server from './server';
//import Middleware from './middlewares';
import { FunctionControllerType } from './controllers/types';
import { Middleware } from './new/middleware';

export type AllServerSettingsType<TCustomServerSettings = unknown> = SettingsType2 &
  ServerSettingsType2<TCustomServerSettings>;

export type ServerSettingsType2<TCustomServerSettings = unknown> = {
  server: typeof Server;
  /** Defaults to 4000 */
  port?: number;
  /** This is the settings for when initializing the server, for example custom options for express initialization or custom options for fastify initialization */
  customServerSettings?: TCustomServerSettings;
  handler404?: Omit<Middleware, 'response'>;
  handler500?: Omit<Middleware, 'response'>;
};

export type OnlyServerSettingsType<CSS = unknown, O404 = unknown> = {
  SERVER: typeof Server;
  PORT: number;
  //ROOT_ROUTER: RootRouterTypes | Promise<{ default: RootRouterTypes }>;
  CUSTOM_SERVER_SETTINGS?: CSS;
  HANDLER_404?: FunctionControllerType | { options?: O404; handler: FunctionControllerType };
  MIDDLEWARES?: (typeof Middleware | Promise<{ default: typeof Middleware }>)[];
};

export type MultipleServerSettings = {
  [serverName: string]: OnlyServerSettingsType;
};

export interface ServerSettingsType<CSS = any> extends SettingsType, OnlyServerSettingsType<CSS> {}

export type HeadersType = {
  [key: string]: string;
};

export type QueryParamsType = {
  [key: string]: string | undefined;
};

export type PathParamsType = {
  [key: string]: string | number;
};

export type RequestType = {
  R: any;
  V: any;
  P: any;
  Q: any;
  D: any;
  O: any;
};
