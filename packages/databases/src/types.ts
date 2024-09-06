import type { DatabaseAdapter } from './engine';
import type { BaseModel, Manager, model } from './models';
import type { EventEmitter } from '@palmares/events';

export interface DatabaseConfigurationType {
  engine: [any, DatabaseAdapter];
  events?: {
    emitter: EventEmitter | Promise<EventEmitter>;
    channels?: string[];
  };
}

export type ExtractFieldsFromAbstracts<TAbstracts extends readonly any[]> = TAbstracts extends readonly [
  infer TAbstract,
  ...infer TRest
]
  ? TAbstract extends {
      new (): { fields: infer TFields };
    }
    ? TFields & ExtractFieldsFromAbstracts<TRest extends readonly any[] ? TRest : []>
    : unknown
  : unknown;

export type ExtractManagersFromAbstracts<TAbstracts extends readonly any[]> = TAbstracts extends readonly [
  infer TAbstract,
  ...infer TRest
]
  ? {
      [TKey in keyof TAbstract as TAbstract[TKey] extends Manager<any> ? TKey : never]: TAbstract[TKey];
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
