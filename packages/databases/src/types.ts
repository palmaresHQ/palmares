import { SettingsType } from "@palmares/core";

import { Model } from "./models";
import Engine from "./engine";

export interface DatabaseConfigurationType<DialectOptions, ExtraOptions> {
  engine: string,
  url?: string | undefined,
  dialect: DialectOptions,
  databaseName: string,
  username: string,
  password: string,
  host: string,
  protocol?: string,
  port: number,
  extraOptions?: ExtraOptions
}

export type initializedEngineInstancesType = {
  [key: string]: Engine
}

export type FoundModelType = {
  domainName: string,
  domainPath: string,
  model: typeof Model,
}

export interface DatabaseSettingsType extends SettingsType {
  DATABASES: {
    [key: string]: DatabaseConfigurationType<string, {}>
  }
}
