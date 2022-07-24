import { SettingsType, Domain } from "@palmares/core";

import { Model } from "./models";
import Engine from "./engine";

export interface DatabaseDomain extends Domain {
  getModels(): Promise<Model[]> | Model[];
}

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

export type InitializedEngineInstancesType = {
  [key: string]: InitializedEngineInstanceWithModelsType
}

export type InitializedEngineInstanceWithModelsType = {
  engineInstance: Engine,
  projectModels: InitializedModelsType[],
  internalModels: InitializedModelsType[]
}

export type FoundModelType = {
  domainName: string,
  domainPath: string,
  model: typeof Model,
}

export type InitializedModelsType<M = any> = {
  domainName: string,
  domainPath: string,
  class: typeof Model,
  initialized: M,
  original: Model
}

export interface DatabaseSettingsType extends SettingsType {
  DATABASES: {
    [key: string]: DatabaseConfigurationType<string, {}>
  }
  DATABASES_DISMISS_NO_MIGRATIONS_LOG: boolean;
}

export type OptionalMakemigrationsArgsType = {
  empty?: string[] | string | boolean;
}
