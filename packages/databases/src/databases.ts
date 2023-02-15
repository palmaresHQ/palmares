import { conf } from '@palmares/core';

import {
  DatabaseSettingsType,
  DatabaseConfigurationType,
  FoundModelType,
  InitializedModelsType,
  InitializedEngineInstancesType,
  InitializedEngineInstanceWithModelsType,
  OptionalMakemigrationsArgsType,
} from './types';
import { DatabaseDomainInterface } from './interfaces';
import Engine from './engine';
import { Model } from './models';
import Migrations from './migrations';
import DatabasesDomain from './domain';
import model from './models/model';

export default class Databases {
  settings!: DatabaseSettingsType;
  isInitializing = false;
  isInitialized = false;
  initializedEngineInstances: InitializedEngineInstancesType = {};
  obligatoryModels: ReturnType<typeof Model>[] = [];
  #cachedModelsByModelName: {
    [modelName: string]: FoundModelType;
  } = {};
  private static __instance: Databases;

  constructor() {
    if (Databases.__instance) return Databases.__instance;
    Databases.__instance = this;
  }

  /**
   * This will lazy initialize the hole engine instance with all of the models before using it. Generally this is not needed but for example
   * on cases like serverless. We need to guarantee that the database will work without the need of the default domain lifecycle. That's because
   * on certain environments we can't guarantee that the hole domain lifecycle will be called and executed, this is why we need to lazy initialize
   * it.
   *
   * We initialize the hole engine AND NOT JUST THE MODELS because there is no way to know before hand about relations. Yeah we can guarantee direct
   * relations, for example `Post` that are related to a `User`. But we cannot guarantee indirect relations, for example, that `User` is related to
   * `Post`. This is because of the architecture that we choose to keep all relations in the models themselves. If we change this architecture we are
   * able to lazy load just certain models as well as their relations so it can be even more efficient. Right now we thinks that this is efficient
   * enough.
   *
   * @param engineName - The name of the engine that we want to lazy initialize.
   * @param settings - The settings that we want to use.
   * @param domains - The domains of the application.
   */
  async lazyInitializeEngine(
    engineName: string,
    settings: DatabaseSettingsType,
    domains: DatabaseDomainInterface[]
  ) {
    if (this.isInitialized === false && this.isInitializing === false) {
      const isDatabaseDefined: boolean =
        settings.DATABASES !== undefined &&
        typeof settings.DATABASES === 'object';

      const engineNameToUse: string | undefined =
        engineName === ''
          ? Object.keys(settings.DATABASES || {})[0]
          : engineName;
      const isEngineNameDefined = engineNameToUse in (settings.DATABASES || {});
      if (isDatabaseDefined && isEngineNameDefined) {
        const databaseSettings = settings.DATABASES[engineNameToUse];
        await this.initializeDatabase(
          engineNameToUse,
          databaseSettings,
          domains
        );
      }
    }
  }

  /**
   * Initializes the database connection and load the models to their respective engines.
   *
   * @param settings - The settings object from the file itself.
   */
  async init(
    settings: DatabaseSettingsType,
    domains: DatabaseDomainInterface[]
  ) {
    if (this.isInitialized === false && this.isInitializing === false) {
      this.settings = settings;
      this.isInitializing = true;
      const isDatabaseDefined: boolean =
        this.settings.DATABASES !== undefined &&
        typeof settings.DATABASES === 'object';
      if (isDatabaseDefined) {
        const databaseEntries: [
          string,
          DatabaseConfigurationType<string, object>
        ][] = Object.entries(settings.DATABASES);
        for (const [databaseName, databaseSettings] of databaseEntries) {
          await this.initializeDatabase(
            databaseName,
            databaseSettings,
            domains
          );
        }
        this.isInitialized = true;
      }
      this.isInitializing = false;
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
    domains: DatabaseDomainInterface[],
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
  async migrate(
    settings: DatabaseSettingsType,
    domains: DatabaseDomainInterface[]
  ) {
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
    domains: DatabaseDomainInterface[]
  ) {
    let engineInstance: Engine;
    const doesAnEngineInstanceAlreadyExist =
      engineName in this.initializedEngineInstances &&
      this.initializedEngineInstances[engineName].engineInstance !== undefined;
    const isProbablyAnEngineInstanceDefinedForDatabase =
      databaseSettings.engine !== undefined;
    const isEngineInstanceAPromise =
      isProbablyAnEngineInstanceDefinedForDatabase
        ? databaseSettings.engine instanceof Promise
        : false;
    const engineToUse = isEngineInstanceAPromise
      ? (
          (await Promise.resolve(databaseSettings.engine)) as {
            default: typeof Engine;
          }
        ).default
      : (databaseSettings.engine as typeof Engine);
    const isAnEngineInstanceDefinedForDatabase =
      isProbablyAnEngineInstanceDefinedForDatabase
        ? engineToUse.prototype instanceof Engine
        : false;

    if (doesAnEngineInstanceAlreadyExist) {
      engineInstance =
        this.initializedEngineInstances[engineName].engineInstance;
    } else if (isAnEngineInstanceDefinedForDatabase) {
      engineInstance = await engineToUse.new(engineName, databaseSettings);
    } else {
      throw new Error('You must define an engine for the database.');
    }

    const models: FoundModelType[] = Object.values(
      await this.getModels(domains)
    );

    const onlyTheModelsFiltered: {
      [modelName: string]: ReturnType<typeof model>;
    } = {};
    const onlyTheModelsNotOnTheEngine: {
      [modelName: string]: ReturnType<typeof model>;
    } = {};
    const modelsFilteredForDatabase: FoundModelType[] = [];
    const promises = models.map(async (foundModel) => {
      const modelInstance = new foundModel.model();
      const isModelManagedByEngine =
        modelInstance.options.managed !== false &&
        foundModel.model._isInitialized[engineName] !== true &&
        (Array.isArray(modelInstance.options?.databases) === false ||
          modelInstance.options?.databases?.includes(engineName) === true);
      const modelName = modelInstance.name || modelInstance.constructor.name;

      if (isModelManagedByEngine)
        onlyTheModelsFiltered[modelName] = foundModel.model;
      else {
        await modelInstance._init(
          engineInstance,
          foundModel.domainName,
          foundModel.domainPath,
          false
        );
        onlyTheModelsNotOnTheEngine[modelName] = foundModel.model;
      }

      if (isModelManagedByEngine) modelsFilteredForDatabase.push(foundModel);
    });
    await Promise.all(promises);

    const isDatabaseConnected = await Promise.resolve(
      engineInstance.isConnected()
    );
    // Append all of the models to the engine instance.
    await engineInstance._appendModelsOfEngineAndFilteredOut(
      onlyTheModelsFiltered,
      onlyTheModelsNotOnTheEngine
    );

    if (isDatabaseConnected) {
      const { projectModels } = await this.initializeModels(
        engineInstance,
        modelsFilteredForDatabase
      );
      const mergedProjectModels = (
        this.initializedEngineInstances[engineName]?.projectModels || []
      ).concat(projectModels);

      this.initializedEngineInstances[engineName] = {
        engineInstance,
        projectModels: mergedProjectModels,
      };
    } else {
      throw new Error(
        `The database engine ${engineName} was not able to connect to the database.`
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
   * in the `models` file in the path of the domain. You can also define your domain app implementing
   * the `DatabaseDomainInterface` interface. With this type of domain you are able to export your models by defining
   * the `getModels` method. When this method is defined we bypass the lookup of the models in the `models`
   * file or folder, for complex projects you might want to use this method.
   *
   * @param domains - The domains where we want to retrieve the models from. Those are all of the
   * domains installed with INSTALLED_DOMAINS.
   *
   * @returns - Returns an array of models.
   */
  async getModels(domains?: DatabaseDomainInterface[]) {
    if (domains === undefined)
      domains = (await DatabasesDomain.retrieveDomains(conf.settings)).map(
        (domainClass) => new domainClass() as DatabaseDomainInterface
      );
    const cachedFoundModels = Object.values(this.#cachedModelsByModelName);
    const existsCachedFoundModels = cachedFoundModels.length > 0;
    if (existsCachedFoundModels === false) {
      const promises: Promise<void>[] = domains.map(async (domain) => {
        const hasGetModelsMethodDefined =
          typeof domain.getModels === 'function';
        if (hasGetModelsMethodDefined) {
          const models = await Promise.resolve(domain.getModels());
          if (Array.isArray(models)) {
            for (const model of models) {
              this.#cachedModelsByModelName[model.name] = {
                domainPath: domain.path,
                domainName: domain.name,
                model,
              };
            }
          } else {
            const modelEntries = Object.entries(models);
            for (const [modelName, modelKls] of modelEntries) {
              this.#cachedModelsByModelName[modelName] = {
                domainName: domain.path,
                domainPath: domain.path,
                model: modelKls,
              };
            }
          }
        }
      });
      await Promise.all(promises);
    }
    return this.#cachedModelsByModelName;
  }
}
