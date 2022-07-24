import Model from "../models/model"
import { Operation } from "./actions";

export type StateModelsType = {
  [modelName: string]: {
    class: typeof Model;
    instance: Model;
  }
}

export type StateModelsConstructorType = {
  [modelName: string]: typeof Model;
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
