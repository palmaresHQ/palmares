import EngineFields from "./fields";
import { Field } from "../models/fields";
import Engine from ".";

export type EngineType = {
  databaseName: string;
  fields: EngineFields;

}

export type EngineFieldsType = {
  engineInstance: Engine;
  fields: Map<Field["fieldName"], Field>;
}