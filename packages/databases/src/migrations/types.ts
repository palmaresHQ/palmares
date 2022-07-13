import { models as Models } from "..";
import Model from "../models/model"
import { Operation } from "./actions";

export type StateModelsType = {
  [modelName: string]: Model;
}

export type MigrationFileType = {
  name: string;
  engines: string[];
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
