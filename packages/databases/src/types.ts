import type { EventEmitter } from '@palmares/events';

import { BaseModel, model } from './models';
import DatabaseAdapter from './engine';

export interface DatabaseConfigurationType {
  engine: Promise<[any, DatabaseAdapter]> | { default: Promise<[any, DatabaseAdapter]> };
  events?: {
    emitter: EventEmitter | Promise<EventEmitter>;
    channels?: string[];
  };
}

export type InitializedEngineInstancesType = {
  [key: string]: InitializedEngineInstanceWithModelsType;
};

export type InitializedEngineInstanceWithModelsType = {
  engineInstance: DatabaseAdapter;
  projectModels: InitializedModelsType[];
};

export type FoundModelType = {
  domainName: string;
  domainPath: string;
  model: ReturnType<typeof model> & typeof BaseModel;
};

export type InitializedModelsType<TModel = any> = {
  domainName: string;
  domainPath: string;
  class: ReturnType<typeof model> & typeof BaseModel;
  initialized: TModel;
  original: InstanceType<ReturnType<typeof model>> & BaseModel;
};

export type DatabaseSettingsType = {
  databases: {
    [key: string]: DatabaseConfigurationType;
  };
  eventEmitter?: EventEmitter;
  dismissNoMigrationsLog?: boolean;
};

export type OptionalMakemigrationsArgsType = {
  empty?: string;
};

export type This<T extends new (...args: any) => any> = {
  new (...args: ConstructorParameters<T>): any;
} & Pick<T, keyof T>;
