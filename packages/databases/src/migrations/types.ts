import type { Operation } from './actions';
import type { BaseModel } from '../models';
import type { Model, ModelType, model } from '../models/model';
import type { InitializedModelsType } from '../types';

export type StateModelsType = {
  [modelName: string]: InstanceType<ReturnType<typeof model>> & BaseModel;
};

export type OriginalOrStateModelsByNameType = {
  [modelName: string]: InitializedModelsType;
};

export type StateModelsConstructorType = {
  [modelName: string]: ModelType<any, any> & typeof Model & typeof BaseModel;
};

export type MigrationFileType = {
  name: string;
  database: string;
  dependsOn: string;
  customData?: {
    [key: string]: any;
  };
  operations: Operation[];
};

export type FoundMigrationsFileType = {
  domainName: string;
  domainPath: string;
  migration: MigrationFileType;
};
