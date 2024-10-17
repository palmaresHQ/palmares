import type { DatabaseAdapter } from './engine';
import type { BaseModel, Manager, Model, model } from './models';
import type { ModelType } from './models/model';
import type { EventEmitter } from '@palmares/events';

export interface DatabaseConfigurationType {
  engine: [any, DatabaseAdapter];
  events?: {
    emitter: EventEmitter | Promise<EventEmitter>;
    channels?: string[];
  };
}

export type ExtractFieldsFromAbstracts<TRootFields, TAbstracts extends readonly any[]> = TAbstracts extends readonly [
  infer TAbstract,
  ...infer TRest
]
  ? TAbstract extends {
      new (): { fields: infer TFields };
    }
    ? Omit<
        ExtractFieldsFromAbstracts<unknown, TRest extends readonly any[] ? TRest : []> & TFields & TRootFields,
        never
      >
    : TRootFields
  : TRootFields;

export type ExtractManagersFromAbstracts<TAbstracts extends readonly any[]> = TAbstracts extends readonly [
  infer TAbstract,
  ...infer TRest
]
  ? {
      [TKey in keyof TAbstract as TAbstract[TKey] extends Manager<any>
        ? TKey extends 'default'
          ? never
          : TKey
        : never]: TAbstract[TKey];
    } & ExtractManagersFromAbstracts<TRest extends readonly any[] ? TRest : []>
  : unknown;

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
  model: ModelType<any, any> & typeof Model & typeof BaseModel;
};

export type InitializedModelsType<TModel = any> = {
  domainName: string;
  domainPath: string;
  class: ModelType<any, any> & typeof Model & typeof BaseModel;
  initialized: TModel;
  original: InstanceType<ModelType<any, any>> & Model & BaseModel;
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
  useTs?: boolean;
};

export type This<T extends new (...args: any) => any> = {
  new (...args: ConstructorParameters<T>): any;
} & Pick<T, keyof T>;
