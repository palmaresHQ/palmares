import { ERR_MODULE_NOT_FOUND, LOGGING_DATABASE_MODELS_NOT_FOUND } from "../utils";
import { SettingsType } from "../conf/types";
import { 
  DatabaseConfigurationType, 
  FoundModelType, 
  initializedEngineInstancesType 
} from "../databases/types";
import { DatabaseNoEngineFoundError } from './exceptions';
import Engine, { EngineFields } from "./engine";
import logging from "../logging";
import { Model } from "./models";

import path from "path";


class Databases {
  availableEngines = ['@palmares/sequelize-engine'];
  settings!: SettingsType;
  initializedEngineInstances: initializedEngineInstancesType = {};
  obligatoryModels: typeof Model[] = []

  /**
   * Initializes the database connection and load the models to their respective engines.
   * 
   * @param settings - The settings object from the file itself.
   */
  async init(settings: SettingsType) {
    this.settings = settings;

    const isDatabaseDefined: boolean = settings.DATABASES !== undefined && typeof settings.DATABASES === "object";
    if (isDatabaseDefined) {
      const databaseEntries: [string, DatabaseConfigurationType<string, {}>][] = Object.entries(settings.DATABASES);
      for (const [databaseName, databaseSettings] of databaseEntries) {
        await this.initializeDatabase(databaseName, databaseSettings);
      }
    }
  }

  async getEngine(databaseName: string, engine: typeof Engine | string): Promise<typeof Engine> {
    const isEngineAString = typeof engine === "string";
    if (isEngineAString) {
      const engineExports = await import(engine);
      const possibleEngines: typeof Engine[] = Object.values(engineExports);
      for (const possibleEngine of possibleEngines) {
        if (possibleEngine.prototype instanceof Engine) {
          return possibleEngine;
        }
      }
      throw new DatabaseNoEngineFoundError(databaseName);
    }
    return engine;
  }

  /**
   * Closes the database connection on all of the initialized engine instances.
   */
  async close() {
    const initializedEngineInstances = Object.values(this.initializedEngineInstances);

    const promises = initializedEngineInstances.map(async (engineInstance) => {
      await engineInstance.close();
    })
    await Promise.all(promises);
  }

  async initializeDatabase(databaseName: string, databaseSettings: DatabaseConfigurationType<string, {}>) {
    const models: FoundModelType[] = await this.getModels();
    const engine: typeof Engine = await this.getEngine(databaseName, databaseSettings.engine);
    const engineInstance: Engine = await engine.new(databaseName, databaseSettings);

    if (await engineInstance.isConnected()) this.initializeModels(engineInstance, models);
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
          await logging.logMessage(LOGGING_DATABASE_MODELS_NOT_FOUND, { appName: fullPath });
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
export { Engine, DatabaseConfigurationType, EngineFields };