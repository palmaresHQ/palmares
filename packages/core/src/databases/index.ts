import { ERR_MODULE_NOT_FOUND, LOGGING_DATABASE_MODELS_NOT_FOUND } from "../utils";
import { SettingsType } from "../conf/types";
import { DatabaseConfigurationType, FoundModelType } from "../databases/types";
import Engine from "./engines";
import logging from "../logging";
import { Model } from "./models";

import path from "path";


class Databases {
    availableEngines = {
        'SequelizeEngine': class SequelizeEngine {

        },
    }
    settings: SettingsType;
    initializedEngineInstances = {};
    obligatoryModels: typeof Model[] = []

    async init(settings: SettingsType) {
        this.settings = settings;

        const isDatabaseDefined: boolean = typeof settings.DATABASES === "object" && 
            settings.DATABASES !== undefined;
        if (isDatabaseDefined) {
            const databaseEntries: [string, DatabaseConfigurationType][] = Object.entries(settings.DATABASES);
            for (const [databaseName, databaseSettings] of databaseEntries) {
                await this.initializeDatabase(databaseName, databaseSettings);
            }
        }
    }

    async getEngine(engine: typeof Engine | string): Promise<typeof Engine> {
        if (typeof engine === "string") {
            return this.availableEngines[engine];
        } 
        return engine;
    }

    async initializeDatabase(databaseName: string, databaseSettings: DatabaseConfigurationType) {
        const models: FoundModelType[] = await this.getModels();
        const engine: typeof Engine = await this.getEngine(databaseSettings.engine);
        const engineInstance: Engine = new engine(databaseName, databaseSettings);

        if (await engineInstance.isConnected()) {
            this.initializeModels(engineInstance, models);
        }
    }

    async initializeModels(engineInstance: Engine, projectModels: FoundModelType[]) {
        return {
            engineInstance,
            projectModels: await Promise.all(
                projectModels.map(async ({ appName, appPath, model }) => {
                    const modelInstance = new model();
                    const initializedModel = await modelInstance.init(model, engineInstance);
                    return {
                        appName,
                        appPath,
                        initialized: initializedModel,
                        original: modelInstance
                    }
                })
            ),
            internalModels: await Promise.all(
                this.obligatoryModels.map(async (model) => {
                    const modelInstance = new model();
                    const initializedModel = await modelInstance.init(model, engineInstance);
                    return {
                        appName: "",
                        appPath: "",
                        initialized: initializedModel,
                        original: modelInstance
                    }
                })
            )
        }
    }

    async getModels() {
        const foundModels: FoundModelType[] = [];
        const promises: Promise<void>[] = this.settings.INSTALLED_APPS.map(async (appName) => {
            const fullPath = path.join(this.settings.BASE_PATH, appName, 'models');
            try {
                const models = await import(fullPath);
                const modelsArray: typeof Model[] = Object.values(models);
                for (const model of modelsArray) {
                    foundModels.push({
                        model,
                        appName,
                        appPath: fullPath,
                    })
                }
            } catch (e) {
                const error: any = e;
                if (error.code === ERR_MODULE_NOT_FOUND) {
                    logging.logMessage(LOGGING_DATABASE_MODELS_NOT_FOUND, { appName: fullPath });
                } else {
                    throw e;
                }
            }
        })
        await Promise.all(promises);
        return foundModels;
    }
}

export default new Databases();