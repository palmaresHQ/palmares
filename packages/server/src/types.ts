import { SettingsType } from "@palmares/core";
import Server from "./server";
import { Router } from "./routers";

export type RootRouterTypes = Router | Router[];

export type OnlyServerSettingsType = {
  SERVER: typeof Server;
  PORT: number,
  ROOT_ROUTER: RootRouterTypes | Promise<{default: RootRouterTypes}>;
  CUSTOM_SERVER_SETTINGS?: any;
  MIDDLEWARES?: string[];
}

export type MultipleServerSettings = {
  [serverName: string]: OnlyServerSettingsType
}

export interface ServerSettingsType extends SettingsType, OnlyServerSettingsType {}

export type HeadersType = {
  [key: string]: string
}

export type QueryParamsType = {
  [key: string]: string
}

export type PathParamsType = {
  [key: string]: string
}
