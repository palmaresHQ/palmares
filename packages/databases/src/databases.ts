import { 
    retrieveDomains,
    logging,
    ERR_MODULE_NOT_FOUND, 
    LOGGING_DATABASE_MODELS_NOT_FOUND 
} from "@palmares/core";

import { 
  DatabaseSettingsType,
  DatabaseConfigurationType, 
  FoundModelType, 
  initializedEngineInstancesType 
} from "./types";
import { DatabaseNoEngineFoundError } from './exceptions';
import Engine from "./engine";
import { Model } from "./models";

import path from "path";

class Databases {
  availableEngines = ['@palmares/sequelize-engine'];
  settings!: DatabaseSettingsType;
  initializedEngineInstances: initializedEngineInstancesType = {};
  obligatoryModels: typeof Model[] = []

  /**
   * Initializes the database connection and load the models to their respective engines.
   * 
   * @param settings - The settings object from the file itself.
   */
  async init(settings: DatabaseSettingsType) {
    this.settings = settings;

    const isDatabaseDefined: boolean = this.settings.DATABASES !== undefined && typeof settings.DATABASES === "object";
    if (isDatabaseDefined) {
      const databaseEntries: [string, DatabaseConfigurationType<string, {}>][] = Object.entries(settings.DATABASES);
      for (const [databaseName, databaseSettings] of databaseEntries) {
          await this.initializeDatabase(databaseName, databaseSettings);
      }
    }
  }

  /**
   * Gets the engine instance for the given database name or throws an error if no engine is found.
   * 
   * @param databaseName - The name of the database, not the name of the engine, and not the name of 
   * the database in postgres or mysql or whatever. It's a 'magic' name that is used to identify the 
   * engine and database.
   * @param engine- Could be a string or a class directly, the string is the package that we need to 
   * import, the class is the engine class that we will be using.
   * 
   * @returns - The engine class to use in the application.
   */
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
  async close(): Promise<void> {
    const initializedEngineInstances = Object.values(this.initializedEngineInstances);

    const promises = initializedEngineInstances.map(async (engineInstance) => {
      await engineInstance.close();
    });

    await Promise.all(promises);
  }

  /**
   * Initializes the database connection and load the models to their respective engines.
   * 
   * @param databaseName - The name of the database that we are using.
   * @param databaseSettings - The settings object for the database.
   */
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
    const domainClasses = await retrieveDomains(this.settings);
    const promises: Promise<void>[] = domainClasses.map(async (domainClass) => {
      const domain = new domainClass();
      const fullPath = path.join(domain.appPath, 'models');
      try {
        const models = await import(fullPath);
        const modelsArray: typeof Model[] = Object.values(models);
        for (const model of modelsArray) {
          foundModels.push({
              model,
              appName: domain.appName,
              appPath: domain.appPath,
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
    });
    await Promise.all(promises);
    return foundModels;
  }
}

export default new Databases();