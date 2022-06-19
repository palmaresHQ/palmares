import { Model } from "./models";
import Engine from "./engine";

export interface DatabaseConfigurationType<EngineOptions, ExtraOptions> {
    engine: EngineOptions,
    url?: string | undefined,
    databaseName: string,
    username: string,
    password: string,
    host: string,
    protocol?: string,
    port: number,
    extraOptions?: ExtraOptions
}

export type initializedEngineInstancesType = {
    [key: string]: Engine
}

export type FoundModelType = {
    appName: string,
    appPath: string,
    model: typeof Model,
}