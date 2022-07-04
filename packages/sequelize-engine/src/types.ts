import { Model, ModelAttributeColumnOptions } from "sequelize";
import { models } from "@palmares/core";

export type InitializedModelsType = {
    [key: string]: Model | null
}

export type ModelTranslatorIndexesType = {
    [key: string]: {
        unique: boolean,
        fields: string[]
    }[]
}

type RelatedFieldsToEvaluateType = {
    field: models.fields.ForeignKeyField,
    fieldAttributes: ModelAttributeColumnOptions
}

export type RelatedModelToEvaluateAfterType = {
    [key: string]: RelatedFieldsToEvaluateType[]
}