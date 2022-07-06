import { ModelAttributeColumnOptions, ModelStatic, Model, ModelCtor, IndexesOptions } from "sequelize";
import { models } from "@palmares/databases";

export type InitializedModelsType<T extends Model> = {
    [key: string]: ModelCtor<T> | undefined
}

export type ModelTranslatorIndexesType = {
    [key: string]: IndexesOptions[]
}

type RelatedFieldsToEvaluateType = {
    field: models.fields.ForeignKeyField,
    fieldAttributes: ModelAttributeColumnOptions
}

export type RelatedModelToEvaluateAfterType = {
    [key: string]: RelatedFieldsToEvaluateType[]
}
