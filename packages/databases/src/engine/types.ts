import EngineFields from "./fields";
import { Field } from "../models/fields";
import Engine from ".";

export type EngineType = {
  databaseName: string;
  fields: EngineFields;
  modelType: any;
}

export type EngineFieldsType = {
  engineInstance: Engine;
  fields: Map<Field["fieldName"], Field>;
}