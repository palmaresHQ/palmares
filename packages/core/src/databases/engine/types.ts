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

  set(field: Field): Promise<void>;

  _translateAutoField?(field: Field, fieldAttributes: any): Promise<void>;
  _translateBigAutoField?(field: Field, fieldAttributes: any): Promise<void>;
  _translateIntegerField?(field: Field, fieldAttributes: any): Promise<void>;
  _translateBigIntegerField?(field: Field, fieldAttributes: any): Promise<void>;
  _translateForeignKeyField?(field: Field, fieldAttributes: any): Promise<void>;
}