import { Field } from "./fields";
import Model from './model';
import Manager from './manager';
import { DatabaseSettingsType } from "../types";
import Engine from "../engine";

export type ManagerInstancesType = {
  [engineName: string]: any;
}

export type ManagerEngineInstancesType = {
  [engineName: string]: any;
}

export type ModelFieldsType = {
    [key: string]: Field
}

export type ManagersOfInstanceType = {
    [key: string]: Manager
}

export type ModelIndexType = {
    unique: boolean,
    fields: string[]
}

export type ModelOptionsType = {
    autoId?: boolean,
    primaryKeyField?: Field,
    abstract?: boolean,
    underscored?: boolean,
    tableName?: string,
    managed?: boolean,
    ordering?: string[] | [],
    indexes?: ModelIndexType[],
    databases?: string[] | [],
    customOptions?: any
}

export interface ModelType {
    fields: ModelFieldsType;
    options: ModelOptionsType;
    name: string;
    abstracts: typeof Model[];
    instances?: Map<keyof DatabaseSettingsType["DATABASES"], any>;
}

type IdField<T extends Model> = {
  id: T["options"]["primaryKeyField"] extends Field ?
    T["options"]["primaryKeyField"]["type"] : T["defaultOptions"]["primaryKeyField"]["type"] |
    T["defaultOptions"]["primaryKeyField"]["type"]
}

export type ModelFields<T extends Model> = IdField<T> & {
  [P in keyof T["fields"]]?: T["fields"][P]["type"];
};
