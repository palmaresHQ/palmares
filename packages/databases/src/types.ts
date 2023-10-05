import type { EventEmitter } from '@palmares/events';

import { Model } from './models';
import Engine from './engine';

export interface DatabaseConfigurationType {
  engine: Promise<[any, Engine]> | { default: Promise<[any, Engine]> };
  events?: {
    emitter: EventEmitter | Promise<EventEmitter>;
    channels?: string[];
  };
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
