import { logging, ERR_MODULE_NOT_FOUND, imports, conf } from '@palmares/core';

import {
  DatabaseSettingsType,
  DatabaseConfigurationType,
  FoundModelType,
  InitializedModelsType,
  InitializedEngineInstancesType,
  InitializedEngineInstanceWithModelsType,
  OptionalMakemigrationsArgsType,
} from './types';
import { DatabaseDomain } from './domain';
import Engine from './engine';
import { Model, BaseModel } from './models';
import { LOGGING_DATABASE_MODELS_NOT_FOUND } from './utils';
import Migrations from './migrations';

export default class Databases {
  settings!: DatabaseSettingsType;
  initializedEngineInstances: InitializedEngineInstancesType = {};
  obligatoryModels: ReturnType<typeof Model>[] = [];
  #cachedModelsByModelName: {
    [modelName: string]: FoundModelType;
  } = {};

  /**
   * Initializes the database connection and load the models to their respective engines.
   *
   * @param settings - The settings object from the file itself.
   */
  async init(settings: DatabaseSettingsType, domains: DatabaseDomain[]) {
    this.settings = settings;

    const isDatabaseDefined: boolean =
      this.settings.DATABASES !== undefined &&
      typeof settings.DATABASES === 'object';
    if (isDatabaseDefined) {
      const databaseEntries: [
        string,
        DatabaseConfigurationType<string, object>
      ][] = Object.entries(settings.DATABASES);
      for (const [databaseName, databaseSettings] of databaseEntries) {
        await this.initializeDatabase(databaseName, databaseSettings, domains);
      }
    }
  }

  /**
   * Responsible for handling the `makemigrations` command. For this command we must initialize the database first.
   * The user can pass --empty to create a new empty migration file.
   *
   * @param settings - The settings defined by the user in settings.js/ts file.
   * @param domains - The domains defined by the user so we can fetch all of the models and migrations.
   */
  async makeMigrations(
    settings: DatabaseSettingsType,
    domains: DatabaseDomain[],
    optionalArgs: OptionalMakemigrationsArgsType
  ) {
    await this.init(settings, domains);
    const migrations = new Migrations(settings, domains);
    await migrations.makeMigrations(
      this.initializedEngineInstances,
      optionalArgs
    );
  }

  /**
   * Responsible for handling the `migrate` command. For this command we must initialize the database first.
   *
   * @param settings - The settings defined by the user in settings.js/ts file.
   * @param domains - The domains defined by the user so we can fetch all of the models and migrations.
   */
  async migrate(settings: DatabaseSettingsType, domains: DatabaseDomain[]) {
    await this.init(settings, domains);
    const migrations = new Migrations(settings, domains);
    await migrations.migrate(this.initializedEngineInstances);
  }

  /**
   * Closes the database connection on all of the initialized engine instances.
   */
  async close(): Promise<void> {
    const initializedEngineEntries = Object.values(
      this.initializedEngineInstances
    );
    const promises = initializedEngineEntries.map(
      async ({ engineInstance }) => {
        await engineInstance.close();
      }
    );

    await Promise.all(promises);
  }

  /**
   * Initializes the database connection and load the models to their respective engines.
   *
   * @param engineName - A custom name of the engine that we are using.
   * @param databaseSettings - The settings object for the database.
   */
  async initializeDatabase(
    engineName: string,
    databaseSettings: DatabaseConfigurationType<string, object>,
    domains: DatabaseDomain[]
  ) {
    const engine = databaseSettings.engine;
    const models: FoundModelType[] = Object.values(
      await this.getModels(domains)
    );
    const managedModels = models.filter((foundModel) => {
      const modelInstance = new foundModel.model();
      return modelInstance.options?.managed;
    });
    const engineInstance: Engine = await engine.new(
      engineName,
      databaseSettings
    );

    if (await engineInstance.isConnected()) {
      this.initializedEngineInstances[engineName] = await this.initializeModels(
        engineInstance,
        managedModels
      );
    }
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
  ): Promise<InitializedEngineInstanceWithModelsType> {
    const initializedProjectModels: InitializedModelsType[] = [];

    for (const { domainPath, domainName, model } of projectModels) {
      const modelInstance = new model();
      const initializedModel = await modelInstance._init(
        engineInstance,
        domainName,
        domainPath
      );
      if (
        modelInstance.options.databases?.includes(engineInstance.databaseName)
      ) {
        initializedProjectModels.push({
          domainName,
          domainPath,
          class: model,
          initialized: initializedModel,
          original: modelInstance,
        });
      }
    }

    return {
      engineInstance,
      projectModels: initializedProjectModels,
    };
  }

  /**
   * Retrieves the models on all of the installed domains. By default we will look for the models
   * in the `models` file in the path of the domain. You can also define your domain app extending
   * the `DatabaseDomain` class. With this type of domain you are able to export your models by defining
   * the `getModels` method. When this method is defined we bypass the lookup of the models in the `models`
   * file or folder, for complex projects you might want to use this method.
   *
   * @param domains - The domains where we want to retrieve the models from. Those are all of the
   * domains installed with INSTALLED_DOMAINS.
   *
   * @returns - Returns an array of models.
   */
  async getModels(domains?: DatabaseDomain[]) {
    if (domains === undefined)
      domains = (await DatabaseDomain.retrieveDomains(conf.settings)).map(
        (domainClass) => new domainClass() as DatabaseDomain
      );
    const cachedFoundModels = Object.values(this.#cachedModelsByModelName);
    const existsCachedFoundModels = cachedFoundModels.length > 0;
    if (existsCachedFoundModels === false) {
      const join = await imports<typeof import('path')['join']>('path', 'join');
      const promises: Promise<void>[] = domains.map(async (domain) => {
        const hasGetModelsMethodDefined =
          typeof domain.getModels === 'function';
        if (hasGetModelsMethodDefined) {
          const models = await Promise.resolve(domain.getModels());
          models.forEach((model) => {
            this.#cachedModelsByModelName[model.name] = {
              domainPath: domain.path,
              domainName: domain.name,
              model,
            };
          });
        } else if (join) {
          const fullPath = join(domain.path, 'models');
          try {
            const models = await import(fullPath);
            const modelsArray: ReturnType<typeof Model>[] =
              Object.values(models);

            for (const model of modelsArray) {
              if (model.prototype instanceof BaseModel) {
                this.#cachedModelsByModelName[model.name] = {
                  domainPath: domain.path,
                  domainName: domain.name,
                  model,
                };
              }
            }
          } catch (e) {
            const error: any = e;
            if (error.code === ERR_MODULE_NOT_FOUND) {
              await logging.logMessage(LOGGING_DATABASE_MODELS_NOT_FOUND, {
                domainName: fullPath,
              });
            } else {
              throw e;
            }
          }
        }
      });
      await Promise.all(promises);
    }
    return this.#cachedModelsByModelName;
  }
}
