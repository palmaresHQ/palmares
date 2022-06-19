import { Field } from "./fields";

export type ModelAttributesType = {
    [key: string]: Field
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
    tableName?: null,
    managed?: true,
    ordering?: string[] | [],
    indexes?: ModelIndexType[],
    databases: string[] | [],
    customOptions: any
}