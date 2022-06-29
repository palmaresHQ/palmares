import { Model } from "sequelize";

export type InitializedModelsType = {
    [key: string]: Model | null
}

export type ModelTranslatorIndexesType = {
    [key: string]: {
        unique: boolean,
        fields: string[]
    }[]
}