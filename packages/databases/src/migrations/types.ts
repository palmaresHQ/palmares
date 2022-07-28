import Model from "../models/model"
import { TModel } from "../models/types";
import { InitializedModelsType } from "../types";
import { Operation } from "./actions";

export type StateModelsType = {
  [modelName: string]: {
    class: ReturnType<typeof Model>;
    instance: TModel;
  }
}

export type OriginalOrStateModelsByNameType = {
  [modelName: string]: InitializedModelsType;
};

export type StateModelsConstructorType = {
  [modelName: string]: ReturnType<typeof Model>;
}

export type MigrationFileType = {
  name: string;
  database: string;
  dependsOn: string;
  customData?: {
    [key: string]: any;
  };
  operations: Operation[]
}

export type FoundMigrationsFileType = {
  domainName: string;
  domainPath: string;
  migration: MigrationFileType;
}
