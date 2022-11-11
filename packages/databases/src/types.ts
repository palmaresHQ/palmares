import { SettingsType } from '@palmares/core';

import { Model } from './models';
import Engine from './engine';
import { TModel } from './models/types';

export interface DatabaseConfigurationType<DialectOptions, ExtraOptions> {
  engine: typeof Engine;
  url?: string | undefined;
  dialect: DialectOptions;
  databaseName: string;
  username: string;
  password: string;
  host: string;
  protocol?: string;
  port: number;
  extraOptions?: ExtraOptions;
}

export type InitializedEngineInstancesType = {
  [key: string]: InitializedEngineInstanceWithModelsType;
};

export type InitializedEngineInstanceWithModelsType = {
  engineInstance: Engine;
  projectModels: InitializedModelsType[];
};

export type FoundModelType = {
  domainName: string;
  domainPath: string;
  model: ReturnType<typeof Model>;
};

export type InitializedModelsType<M = any> = {
  domainName: string;
  domainPath: string;
  class: ReturnType<typeof Model>;
  initialized: M;
  original: TModel;
};

export interface DatabaseSettingsType extends SettingsType {
  DATABASES: {
    [key: string]: DatabaseConfigurationType<string, object>;
  };
  DATABASES_DISMISS_NO_MIGRATIONS_LOG: boolean;
}

export type OptionalMakemigrationsArgsType = {
  empty?: string;
};
