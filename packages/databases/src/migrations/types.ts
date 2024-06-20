import { BaseModel } from '../models';
import model from '../models/model';
import { InitializedModelsType } from '../types';
import { Operation } from './actions';

export type StateModelsType = {
  [modelName: string]:  InstanceType<ReturnType<typeof model>> & BaseModel;
};

export type OriginalOrStateModelsByNameType = {
  [modelName: string]: InitializedModelsType;
};

export type StateModelsConstructorType = {
  [modelName: string]: ReturnType<typeof model>;
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
