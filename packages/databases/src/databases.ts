import {
    logging,
    ERR_MODULE_NOT_FOUND,
} from "@palmares/core";

import {
  DatabaseSettingsType,
  DatabaseConfigurationType,
  FoundModelType,
  InitializedModelsType,
  initializedEngineInstancesType,
} from "./types";
import { DatabaseDomain } from "./domain";
import { DatabaseNoEngineFoundError } from './exceptions';
import Engine from "./engine";
import { Model } from "./models";
import { LOGGING_DATABASE_MODELS_NOT_FOUND } from './utils';

import path from "path";
import Migrations from "./migrations";

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
  async init(settings: DatabaseSettingsType, domains: DatabaseDomain[]) {
    this.settings = settings;

    const isDatabaseDefined: boolean = this.settings.DATABASES !== undefined && typeof settings.DATABASES === "object";
    if (isDatabaseDefined) {
      const databaseEntries: [string, DatabaseConfigurationType<string, {}>][] = Object.entries(settings.DATABASES);
      for (const [databaseName, databaseSettings] of databaseEntries) {
        await this.initializeDatabase(databaseName, databaseSettings, domains);
      }
    }
  }

  async makeMigrations(settings: DatabaseSettingsType, domains: DatabaseDomain[]) {
    const migrations = new Migrations(settings, domains)
    await migrations.makeMigrations()
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
    const initializedEngineEntries = Object.values(this.initializedEngineInstances);
    const promises = initializedEngineEntries.map(async (engineInstance) => {
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
  async initializeDatabase(
    databaseName: string,
    databaseSettings: DatabaseConfigurationType<string, {}>,
    domains: DatabaseDomain[]
  ) {
    const models: FoundModelType[] = await this.getModels(domains);
    const engine: typeof Engine = await this.getEngine(databaseName, databaseSettings.engine);
    const engineInstance: Engine = await engine.new(databaseName, databaseSettings);

    if (await engineInstance.isConnected()) await this.initializeModels(engineInstance, models);
    this.initializedEngineInstances[databaseName] = engineInstance;
  }

  /**
   * Initializes the models to the engine instance, the engine instance will convert the models to something it
   * can understand. For example on sequelize engine we will convert the models to a sequelize model. On a Prisma
   * engine for example we could interpret the models as a Prisma schema, and we could build the file after.
   *
   * @param engineInstance - The engine instance that we will be using.
   * @param projectModels - The models from the project (not the default ones that we create).
   *
   * @returns - Returns the engine instance that we are using to build run everything over returns the project models
   * and the internal models.
   */
  async initializeModels(
    engineInstance: Engine,
    projectModels: FoundModelType[]
  ): Promise<{
    engineInstance: Engine,
    projectModels: InitializedModelsType[],
    internalModels: InitializedModelsType[]
  }> {
    const initializedProjectModels: InitializedModelsType[] = [];
    const initializedInternalModels: InitializedModelsType[] = [];

    for (const { domainPath, domainName, model} of projectModels) {
      const modelInstance = new model();
      const initializedModel = await modelInstance.init(model, engineInstance, domainName, domainPath);
      initializedProjectModels.push({
        domainName,
        domainPath,
        initialized: initializedModel,
        original: modelInstance
      });
    }

    for (const model of this.obligatoryModels) {
      const modelInstance = new model();
      const initializedModel = await modelInstance.init(model, engineInstance, "", "");
      initializedInternalModels.push({
        domainName: "",
        domainPath: "",
        initialized: initializedModel,
        original: modelInstance
      });
    }

    return {
      engineInstance,
      projectModels: initializedProjectModels,
      internalModels: initializedInternalModels
    }
  }

  /**
   * Retrieves the models on all of the installed domains. By default we will look for the models
   * in the `models` file in the path of the domain. You can also define your domain app extending
   * the `DatabaseDomain` class. With this type of domain you are able to export your models by defining
   * the `getModels` method. When this method is defined we bypass the lookup of the models in the `models`
   * file or folder, for complex projects you might want to use this method.
   *
   * @returns - Returns an array of models.
   */
  async getModels(domains: DatabaseDomain[]) {
    const foundModels: FoundModelType[] = [];
    const promises: Promise<void>[] = domains.map(async (domain) => {
      const hasGetModelsMethodDefined = typeof domain.getModels === 'function';
      if (hasGetModelsMethodDefined) {
        const models = await Promise.resolve(domain.getModels());
        models.forEach((model) => {
          foundModels.push({
            domainPath: domain.path,
            domainName: domain.name,
            model
          });
        });
      } else {
        const fullPath = path.join(domain.path, 'models');
        try {
          const models = await import(fullPath);
          const modelsArray: typeof Model[] = Object.values(models);

          for (const model of modelsArray) {
            if (model.prototype instanceof Model) {
              foundModels.push({
                  model,
                  domainName: domain.name,
                  domainPath: domain.path,
              })
            }
          }
        } catch (e) {
          const error: any = e;
          if (error.code === ERR_MODULE_NOT_FOUND) {
            await logging.logMessage(LOGGING_DATABASE_MODELS_NOT_FOUND, { domainName: fullPath });
          } else {
            throw e;
          }
        }
      }
    });
    await Promise.all(promises);
    return foundModels;
  }
}

export default new Databases();
