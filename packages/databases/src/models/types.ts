import { Field } from "./fields";
import Model from './model';
import Manager from './manager';

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
    instances: Map<string, Model>;
    [managers: string]: Manager;
}