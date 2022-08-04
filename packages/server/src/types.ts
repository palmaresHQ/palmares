import { SettingsType } from "@palmares/core";
import Server from "./server";
import { Router } from "./routers";

export type RootRouterTypes = Router | Router[];

export type OnlyServerSettingsType<CSS = any> = {
  SERVER: typeof Server;
  PORT: number,
  ROOT_ROUTER: RootRouterTypes | Promise<{default: RootRouterTypes}>;
  CUSTOM_SERVER_SETTINGS?: CSS;
  MIDDLEWARES?: string[];
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

export type FormattedQueryParamsType<T = never> = {
  [key: string]: string | number | boolean | T;
}

export type PathParamsType = {
  [key: string]: string | number
}
