import { Model } from "./models"

export type DatabaseConfigurationType = {
    engine: string,
    databaseName: string,
    username: string,
    password: string,
    host: string,
    protocol?: string,
    port: number,
    extraOptions?: object
}

export type FoundModelType = {
    appName: string,
    appPath: string,
    model: typeof Model,
}