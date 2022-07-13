import Model from "../models/model"
import { Operation } from "./actions";

export type StateModelsType = {
  [modelName: string]: Model;
}

export type MigrationFileType = {
  engines: string[];
  dependency: string;
  customData: {
    [key: string]: any;
  }
  operations: Operation[]
}
