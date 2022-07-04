import { ModelAttributeColumnOptions, ModelStatic, Model, ModelCtor } from "sequelize";
import { models } from "@palmares/databases";

export type InitializedModelsType<T extends Model> = {
    [key: string]: ModelCtor<T> | undefined
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
