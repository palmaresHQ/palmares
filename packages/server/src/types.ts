import { SettingsType } from "@palmares/core";
import Server from "./server";

export type OnlyServerSettingsType = {
  SERVER: typeof Server;
  PORT: number,
  ROOT_ROUTER: any[];
  CUSTOM_SERVER_SETTINGS?: any;
  MIDDLEWARES?: string[];
}

export type MultipleServerSettings = {
  [serverName: string]: OnlyServerSettingsType
}

export interface ServerSettingsType extends SettingsType, OnlyServerSettingsType {}
