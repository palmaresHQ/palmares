import { SettingsType } from "@palmares/core";
import Server from "./server";
import { Router } from "./routers";
import Middleware from "./middlewares";
import { FunctionControllerType } from "./controllers/types";

export type RootRouterTypes = Router | Router[];

export type OnlyServerSettingsType<CSS = unknown, O404 = unknown> = {
  SERVER: typeof Server;
  PORT: number,
  ROOT_ROUTER: RootRouterTypes | Promise<{ default: RootRouterTypes }>;
  CUSTOM_SERVER_SETTINGS?: CSS;
  HANDLER_404?: FunctionControllerType | { options?: O404, handler: FunctionControllerType };
  MIDDLEWARES?: (typeof Middleware | Promise<{ default: typeof Middleware }>)[];
}

export type MultipleServerSettings = {
  [serverName: string]: OnlyServerSettingsType
}

export interface ServerSettingsType<CSS = any> extends SettingsType, OnlyServerSettingsType<CSS> {}

export type HeadersType = {
  [key: string]: string
}

export type QueryParamsType = {
  [key: string]: string | undefined;
}


export type PathParamsType = {
  [key: string]: string | number
}

export type RequestType = {
  R: any,
  V: any,
  P: any,
  Q: any,
  D: any,
  O: any
}
