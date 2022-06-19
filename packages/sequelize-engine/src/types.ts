import { Model } from "sequelize";

export type InitializedModelsType = {
    [key: string]: Model
}
