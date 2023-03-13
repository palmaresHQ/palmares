import { SettingsType } from '@palmares/core';
import type { EventEmitter } from '@palmares/events';

import { Model } from './models';
import Engine from './engine';

export interface DatabaseConfigurationType<DialectOptions, ExtraOptions> {
  engine: typeof Engine | { default: typeof Engine };
  url?: string | undefined;
  dialect: DialectOptions;
  databaseName: string;
  username: string;
  password: string;
  host: string;
  protocol?: string;
  port: number;
  extraOptions?: ExtraOptions;
  eventEmitter?: EventEmitter;
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
  original: InstanceType<ReturnType<typeof Model>>;
};

export interface DatabaseSettingsType extends SettingsType {
  DATABASES: {
    [key: string]: DatabaseConfigurationType<string, object>;
  };
  DATABASES_EVENT_EMITTER?: EventEmitter;
  DATABASES_DISMISS_NO_MIGRATIONS_LOG: boolean;
}

export type OptionalMakemigrationsArgsType = {
  empty?: string;
};

export type This<T extends new (...args: any) => any> = {
  new (...args: ConstructorParameters<T>): any;
} & Pick<T, keyof T>;
