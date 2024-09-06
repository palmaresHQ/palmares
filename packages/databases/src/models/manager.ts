import { getSettings, initializeDomains } from '@palmares/core';

import { ManagerEngineInstanceNotFoundError } from './exceptions';
import { Databases } from '../databases';
import { getQuery } from '../queries/get';
import { removeQuery } from '../queries/remove';
import { setQuery } from '../queries/set';

import type { Model, model } from './model';
import type {
  FieldsOFModelType,
  FieldsOfModelOptionsType,
  Includes,
  IncludesInstances,
  IncludesValidated,
  ManagerEngineInstancesType,
  ManagerInstancesType,
  ModelFieldsWithIncludes,
  ModelType,
  OrderingOfModelsType
} from './types';
import type { DatabaseAdapter } from '../engine';
import type { DatabaseDomainInterface } from '../interfaces';
import type { DatabaseSettingsType } from '../types';
import type { Narrow, SettingsType2 } from '@palmares/core';

/**
 * Managers define how you make queries on the database. Instead of making queries everywhere in your application
 * you should always use managers for your most common tasks.
 *
 * So instead of:
 * ```
 * (await User.default.getInstance()).findAll({ where: { firstName: 'Jane' } });
 * ```
 *
 * You should make queries like
 * ```
 * class UserManager extends models.Manager<User, SequelizeEngine> {
 *    async getJaneDoe() {
 *      return await (await User.default.getInstance()).findAll({ where: { firstName: 'Jane' } });
 *    }
 * }
 *
 * class User extends models.Model<User>() {
 *    fields = {
 *       ....
 *    }
 *
 *    options = { ... }
 *
 *    // Here it is `users` but you can change this to whatever you want, your models can have
 *    // multiple managers, we recommend abstracting away this for the most common usages when making queries.
 *    // Some engines make is possible to reuse the querying logic, so we recommend doing that by
 *    // overriding the `getInstance` method.
 *    static users = UserManager();
 * }
 *
 * User.users.getJaneDoe();
 * ```
 *
 * Managers also offers simple `.get`, `.set` and `.remove` methods so you can reuse your queries across engine
 * instances.
 *
 * NOTE:
 * Although you can use `.get`, `.set`, and `.remove` we do not recommend using those instead you know what
 * you are doing. They are simple and not really well optimized, but it serves a purpose of enabling developers
 * to extend their code inside of the framework without worrying about which engine instance the user will be using.
 * For example: one could create a framework that enables `bull.js` tasks to be defined on the database instead
 * of the code. This way we could update the tasks dynamically.
 */
export class Manager<TModel = Model, TEI extends DatabaseAdapter | null = null> {
  instances: ManagerInstancesType;
  engineInstances: ManagerEngineInstancesType;
  defaultEngineInstanceName: string;
  models: { [engineName: string]: TModel };
  modelKls!: { new (...args: unknown[]): any };
  isLazyInitializing = false as boolean;

  constructor() {
    //this.modelKls = modelKls;
    this.instances = {};
    this.engineInstances = {};
    this.models = {};
    this.defaultEngineInstanceName = '';
  }

  _setModel(engineName: string, initializedModel: TModel) {
    this.models[engineName] = initializedModel;
  }

  getModel(engineName: string) {
    return this.models[engineName];
  }

  /**
   * This function is used to initialize the models outside of the default Domain lifecycle. Sometimes we might define
   * the model outside of the domain, because of that we need to initialize the models manually. Usually it's a lot
   * better to just use the models after they've been initialized but sometimes it might happen that you need to
   * initialize them before the app is ready. For that we will use this. This will create a new Database instance if it
   * doesn't exist, load the settings from where we can find them and initialize the domains. After that we are able to
   * retrieve the data from the model
   */
  async verifyIfNotInitializedAndInitializeModels(engineName: string) {
    const database = new Databases();

    const canInitializeTheModels =
      this.isLazyInitializing === false && database.isInitialized === false && database.isInitializing === false;
    this.isLazyInitializing = true;

    if (canInitializeTheModels) {
      const settings = getSettings() as unknown as DatabaseSettingsType;
      const { domains } = await initializeDomains(settings as unknown as SettingsType2);
      await database.lazyInitializeEngine(engineName, settings, domains as DatabaseDomainInterface[]);
      return true;
    }

    return await await new Promise((resolve) => {
      const verifyIfInitialized = () => {
        const doesInstanceExists = (this.instances as any)[engineName] !== undefined;
        if (doesInstanceExists) return resolve(true);
        setTimeout(() => verifyIfInitialized(), 100);
      };
      verifyIfInitialized();
    });
  }

  /**
   * Retrieves the instance of the model defined in the database. Although you can define the engine instance on
   * the manager itself, the engine instance in this method can be overridden to retrieve the model of another different
   * engine instance.
   *
   * @throws {ManagerEngineInstanceNotFoundError} - When we cannot find a engine instance for this name.
   *
   * @param engineName - The name of the engine defined in `DATABASES` settings in `settings.ts`
   *
   * @return - The instance of the the model inside that engine instance
   */
  async getInstance<T extends DatabaseAdapter = DatabaseAdapter>(
    engineName?: string
  ): Promise<TEI extends DatabaseAdapter ? TEI['ModelType'] : T['ModelType']> {
    const engineInstanceName = engineName || this.defaultEngineInstanceName;
    const doesInstanceExists = (this.instances as any)[engineInstanceName] !== undefined;
    if (doesInstanceExists) return this.instances[engineInstanceName].instance;

    const hasLazilyInitialized = await this.verifyIfNotInitializedAndInitializeModels(engineInstanceName);
    if (!hasLazilyInitialized) return this.getInstance(engineName);

    throw new ManagerEngineInstanceNotFoundError(engineInstanceName);
  }

  _setInstance(engineName: string, instance: any) {
    const isDefaultEngineInstanceNameEmpty = this.defaultEngineInstanceName === '';
    if (isDefaultEngineInstanceNameEmpty) this.defaultEngineInstanceName = engineName;

    this.instances[engineName] = instance;
  }

  async getEngineInstance<T extends DatabaseAdapter = DatabaseAdapter>(
    engineName?: string
  ): Promise<TEI extends DatabaseAdapter ? TEI : T> {
    const engineInstanceName: string = engineName || this.defaultEngineInstanceName;
    const doesInstanceExists = (this.engineInstances as any)[engineInstanceName] !== undefined;
    if (doesInstanceExists) return this.engineInstances[engineInstanceName] as TEI extends DatabaseAdapter ? TEI : T;
    const hasLazilyInitialized = await this.verifyIfNotInitializedAndInitializeModels(engineInstanceName);
    if (hasLazilyInitialized) return this.getEngineInstance(engineName);
    throw new ManagerEngineInstanceNotFoundError(engineInstanceName);
  }

  _setEngineInstance(engineName: string, instance: DatabaseAdapter) {
    const isDefaultEngineInstanceNameEmpty = this.defaultEngineInstanceName === '';
    if (isDefaultEngineInstanceNameEmpty) this.defaultEngineInstanceName = engineName;
    this.engineInstances[engineName] = instance;
  }

  async #getIncludeInstancesRecursively(
    engineName: string,
    includes: Includes,
    modelInstancesByModelName: { [modelName: string]: any } = {},
    includesInstances: IncludesInstances[] = []
  ) {
    const doesIncludesExists = Array.isArray(includes);
    if (doesIncludesExists) {
      const includesAsArray = includes as readonly {
        model: ReturnType<typeof model>;
        includes?: Includes;
      }[];
      const promises: Promise<void>[] = includesAsArray.map(
        async ({ model: initializedModel, includes: includesOfModel }) => {
          const modelName = initializedModel.name;
          const isModelAlreadyGot = modelInstancesByModelName[modelName] !== undefined;

          const modelInstance = isModelAlreadyGot
            ? modelInstancesByModelName[modelName]
            : await initializedModel.default.getInstance(engineName);

          if (isModelAlreadyGot === false) modelInstancesByModelName[modelName] = modelInstance;

          const includeInstanceForModel: IncludesInstances = {
            model: modelInstance
          };
          includesInstances.push(includeInstanceForModel);
          if (includesOfModel)
            await this.#getIncludeInstancesRecursively(
              engineName,
              includesOfModel,
              modelInstancesByModelName,
              includeInstanceForModel.includes || []
            );
        }
      );
      await Promise.all(promises);
    }
    return includesInstances;
  }

  /**
   * A simple get method for retrieving the data of a model. It will ALWAYS be an array, it's
   * the programmers responsibility
   * to filter it accordingly if he want to retrieve an instance.
   *
   * @param search - All of the parameters of a model that can be optional for querying.
   * @param engineName - The name of the engine to use defined in the DATABASES object. By default we use the
   * `default` one.
   *
   * @return - An array of instances retrieved by this query.
   */
  async get<
    TIncludes extends Includes<{
      fields?: readonly string[];
      ordering?: readonly (string | `-${string}`)[];
      limit?: number;
      offset?: number | string;
    }>,
    TFields extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>
  >(
    args?: {
      /**
       * Includes is used for making relations. Because everything is inferred and you define your relationName
       * directly on the ForeignKeyField
       */
      includes?: Narrow<IncludesValidated<TModel, TIncludes>>;
      fields?: Narrow<TFields>;
      search?:
        | ModelFieldsWithIncludes<TModel, TIncludes, TFields, false, false, true, true>
        | ModelFieldsWithIncludes<TModel, TIncludes, TFields, false, false, true, true>[]
        | undefined;
      ordering?: OrderingOfModelsType<
        FieldsOfModelOptionsType<TModel> extends string ? FieldsOfModelOptionsType<TModel> : string
      >;
      limit?: number;
      offset?: string | number;
    },
    engineName?: string
  ): Promise<ModelFieldsWithIncludes<TModel, TIncludes, TFields>[]> {
    const isValidEngineName = typeof engineName === 'string' && engineName !== '';
    const engineInstanceName = isValidEngineName ? engineName : this.defaultEngineInstanceName;
    // Promise.all here will not work, we need to do this sequentially.
    const engineInstance = await this.getEngineInstance(engineInstanceName);

    const initializedDefaultEngineInstanceNameOrSelectedEngineInstanceName = isValidEngineName
      ? engineName
      : this.defaultEngineInstanceName;

    const modelInstance = this.getModel(initializedDefaultEngineInstanceNameOrSelectedEngineInstanceName) as Model;
    const modelConstructor = modelInstance.constructor as ModelType;
    const allFieldsOfModel = Object.keys((modelConstructor as any)._fields(modelInstance));
    return getQuery(
      {
        fields: (args?.fields || allFieldsOfModel) as unknown as TFields,
        search: (args?.search || {}) as ModelFieldsWithIncludes<TModel, TIncludes, TFields, false, false, true, true>,
        ordering: args?.ordering || (modelInstance.options?.ordering as any),
        limit: args?.limit,
        offset: args?.offset
      },
      {
        model: this.models[initializedDefaultEngineInstanceNameOrSelectedEngineInstanceName],
        engine: engineInstance,
        includes: (args?.includes || []) as TIncludes
      }
    ) as Promise<ModelFieldsWithIncludes<TModel, TIncludes, TFields>[]>;
  }

  /**
   * A Simple `set` method for creating or updating a model. All of the types here are conditional.
   * If you define a `search` argument as an object we will automatically return the data with all of the
   * values. Otherwise we return just a boolean.
   *
   * Because stuff might fail we recommend a pipeline of operations something like this:
   * ```
   * const user = await User.default.set({firstName: 'John', lastName: 'Doe'});
   *
   * // We add the if here to check if the instance actually exists. So we can proceed with the operation.
   * if (user) await Post.default.set({ userId: user.id, title: 'New Post' });
   * ```
   *
   * @param data - The data is conditional, if you pass the `search` argument this means you are updating,
   * then all parameters will be optional, otherwise some of the parameters will be obligatory because you are
   * creating an instance.
   * @param search - All of the parameters of a model that can be optional for querying.
   * @param engineName - The name of the engine to use defined in the DATABASES object. By default we use the
   * `default` one.
   *
   * @return - Return the created instance or undefined if something went wrong, or boolean if it's an update.
   */
  async set<
    TIncludes extends Includes = undefined,
    TSearch extends
      | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>, false, false, true, true>
      | undefined = undefined
  >(
    data:
      | ModelFieldsWithIncludes<
          TModel,
          TIncludes,
          FieldsOFModelType<TModel>,
          true,
          false,
          TSearch extends undefined ? false : true,
          false
        >[]
      | ModelFieldsWithIncludes<
          TModel,
          TIncludes,
          FieldsOFModelType<TModel>,
          true,
          false,
          TSearch extends undefined ? false : true,
          false
        >,
    args?: {
      isToPreventEvents?: boolean;
      transaction?: any;
      /**
       * This is enabled by default if you are inserting more than one element or if you use includes, it can make
       * your code slower, but it will guarantee that the data is consistent.
       */
      useTransaction?: boolean;
      usePalmaresTransaction?: boolean;
      includes?: Narrow<IncludesValidated<TModel, TIncludes, true>>;
      search?: TSearch;
    },
    engineName?: string
  ): Promise<ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>[]> {
    const isToPreventEvents = typeof args?.isToPreventEvents === 'boolean' ? args.isToPreventEvents : false;
    let engineInstanceName = engineName || this.defaultEngineInstanceName;
    // Promise.all here will not work, we need to do this sequentially.
    const engineInstance = await this.getEngineInstance(engineName);
    engineInstanceName = engineName || this.defaultEngineInstanceName;
    const dataAsAnArray = Array.isArray(data)
      ? data
      : ([data] as ModelFieldsWithIncludes<
          TModel,
          TIncludes,
          FieldsOFModelType<TModel>,
          true,
          false,
          TSearch extends undefined ? false : true,
          false
        >[]);
    return setQuery(
      dataAsAnArray,
      {
        isToPreventEvents,
        useTransaction: args?.useTransaction,
        search: args?.search
      },
      {
        model: this.getModel(engineInstanceName) as unknown as TModel,
        engine: engineInstance,
        transaction: args?.transaction,
        includes: (args?.includes || []) as TIncludes
      }
    );
  }

  /**
   * Simple query to remove one or more instances from the database. Be aware that not defining a search
   * might mean removing all of the instances of your database.
   *
   * @param search - All of the parameters of a model that can be used for querying.
   * @param engineName - The name of the engine to use defined in the DATABASES object. By default we use the
   * `default` one.
   *
   * @return - Returns true if everything went fine and false otherwise.
   */
  async remove<
    TIncludes extends Includes<{
      isToPreventRemove?: true;
    }> = undefined
  >(
    args?: {
      usePalmaresTransaction?: boolean;
      useTransaction?: boolean;
      isToPreventEvents?: boolean;
      includes?: Narrow<
        IncludesValidated<
          TModel,
          TIncludes,
          false,
          {
            shouldRemove?: boolean;
          }
        >
      >;
      search?:
        | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>, false, false, true, true>
        | undefined;
      shouldRemove?: boolean;
    },
    engineName?: string
  ): Promise<ModelFieldsWithIncludes<TModel, TIncludes>[]> {
    const isToPreventEvents = typeof args?.isToPreventEvents === 'boolean' ? args.isToPreventEvents : false;
    const shouldRemove = typeof args?.shouldRemove === 'boolean' ? args.shouldRemove : true;
    const isValidEngineName = typeof engineName === 'string' && engineName !== '';
    let engineInstanceName = isValidEngineName ? engineName : this.defaultEngineInstanceName;
    // Promise.all here will not work, we need to do this sequentially.
    const engineInstance = await this.getEngineInstance(engineInstanceName);
    engineInstanceName = engineName || this.defaultEngineInstanceName;

    const initializedDefaultEngineInstanceNameOrSelectedEngineInstanceName = isValidEngineName
      ? engineName
      : this.defaultEngineInstanceName;

    return removeQuery<
      TModel,
      TIncludes,
      ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>, false, false, true, true>
    >(
      {
        search: (args?.search || {}) as ModelFieldsWithIncludes<
          TModel,
          TIncludes,
          FieldsOFModelType<TModel>,
          false,
          false,
          true,
          true
        >,
        isToPreventEvents,
        useTransaction: args?.useTransaction,
        usePalmaresTransaction: args?.usePalmaresTransaction,
        shouldRemove: shouldRemove
      },
      {
        model: this.models[initializedDefaultEngineInstanceNameOrSelectedEngineInstanceName],
        engine: engineInstance,
        includes: (args?.includes || []) as TIncludes
      }
    ) as Promise<ModelFieldsWithIncludes<TModel, TIncludes>[]>;
  }
}

export class DefaultManager<TModel extends Model> extends Manager<TModel, null> {}
