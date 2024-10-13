import { getSettings, initializeDomains } from '@palmares/core';

import { ManagerEngineInstanceNotFoundError } from './exceptions';
import { Databases } from '../databases';
import { GetQuerySet, RemoveQuerySet, SetQuerySet } from '../queries/queryset';

import type { BaseModel, Model, ModelType } from './model';
import type { ManagerEngineInstancesType, ManagerInstancesType } from './types';
import type { DatabaseAdapter } from '../engine';
import type { DatabaseDomainInterface } from '../interfaces';
import type { CommonQuerySet, GetDataFromModel, QuerySet } from '../queries/queryset';
import type { DatabaseSettingsType } from '../types';
import type { SettingsType2 } from '@palmares/core';

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
export class Manager<
  TModel = Model,
  TDefinitions extends {
    engineInstance: DatabaseAdapter;
    customOptions: any;
  } = {
    engineInstance: DatabaseAdapter;
    customOptions: any;
  }
> {
  protected $$type = '$PManager';
  protected __instances: ManagerInstancesType = {};
  protected __engineInstances: ManagerEngineInstancesType;
  protected __defaultEngineInstanceName: string;
  protected __models: { [engineName: string]: TModel };
  protected __modelKls!: { new (...args: unknown[]): any };
  protected __isLazyInitializing = false as boolean;

  constructor() {
    //this.modelKls = modelKls;
    this.__instances = {};
    this.__engineInstances = {};
    this.__models = {};
    this.__defaultEngineInstanceName = '';
    this.__isLazyInitializing = false;
  }

  protected __setModel(engineName: string, initializedModel: TModel) {
    this.__models[engineName] = initializedModel;
  }

  /**
   * This function is used to initialize the models outside of the default Domain lifecycle. Sometimes we might define
   * the model outside of the domain, because of that we need to initialize the models manually. Usually it's a lot
   * better to just use the models after they've been initialized but sometimes it might happen that you need to
   * initialize them before the app is ready. For that we will use this. This will create a new Database instance if it
   * doesn't exist, load the settings from where we can find them and initialize the domains. After that we are able to
   * retrieve the data from the model
   */
  protected async __verifyIfNotInitializedAndInitializeModels(engineName: string) {
    console.log('Databases', Databases);
    const database = new Databases();

    const canInitializeTheModels =
      this.__isLazyInitializing === false && database.isInitialized === false && database.isInitializing === false;
    this.__isLazyInitializing = true;

    if (canInitializeTheModels) {
      const settings = getSettings() as unknown as DatabaseSettingsType;
      // Testing environments does not share the same global data. So we need to refetch it again.
      const { domains } = await initializeDomains(
        settings as unknown as SettingsType2,
        (settings as any)?.$$test
          ? {
              ignoreCache: true,
              ignoreCommands: true
            }
          : undefined
      );
      await database.lazyInitializeEngine(engineName, settings, domains as DatabaseDomainInterface[]);
      return true;
    }
    return new Promise((resolve) => {
      const verifyIfInitialized = () => {
        const doesInstanceExists = (this.__instances as any)[engineName] !== undefined;
        if (doesInstanceExists) return resolve(true);
        setTimeout(() => verifyIfInitialized(), 100);
      };
      verifyIfInitialized();
    });
  }

  getModel(engineName: string): TModel {
    return this.__models[engineName];
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
  async getInstance<TDatabaseAdapter extends DatabaseAdapter = TDefinitions['engineInstance']>(
    engineName?: string
  ): Promise<
    TDatabaseAdapter['models']['getTranslatedModels'] extends (...args: any[]) => infer TResult ? TResult : never
  > {
    const engineInstanceName = engineName || this.__defaultEngineInstanceName;
    const doesInstanceExists = (this.__instances as any)[engineInstanceName] !== undefined;
    if (doesInstanceExists) return this.__instances[engineInstanceName].instance;

    const hasLazilyInitialized = await this.__verifyIfNotInitializedAndInitializeModels(engineInstanceName);
    if (!hasLazilyInitialized) return this.getInstance(engineName);

    throw new ManagerEngineInstanceNotFoundError(engineInstanceName);
  }

  protected __setInstance(engineName: string, instance: any) {
    const isDefaultEngineInstanceNameEmpty = this.__defaultEngineInstanceName === '';
    if (isDefaultEngineInstanceNameEmpty) this.__defaultEngineInstanceName = engineName;

    this.__instances[engineName] = instance;
  }

  async getEngineInstance<TDatabaseAdapter extends DatabaseAdapter = TDefinitions['engineInstance']>(
    engineName?: string
  ): Promise<TDatabaseAdapter> {
    const engineInstanceName: string = engineName || this.__defaultEngineInstanceName;
    const doesInstanceExists = (this.__engineInstances as any)[engineInstanceName] !== undefined;
    if (doesInstanceExists) return this.__engineInstances[engineInstanceName] as TDatabaseAdapter;

    const hasLazilyInitialized = await this.__verifyIfNotInitializedAndInitializeModels(engineInstanceName);

    if (hasLazilyInitialized) return this.getEngineInstance(engineName);
    throw new ManagerEngineInstanceNotFoundError(engineInstanceName);
  }

  protected __setEngineInstance(engineName: string, instance: DatabaseAdapter) {
    const isDefaultEngineInstanceNameEmpty = this.__defaultEngineInstanceName === '';
    if (isDefaultEngineInstanceNameEmpty) this.__defaultEngineInstanceName = engineName;
    this.__engineInstances[engineName] = instance;
  }

  /**
   * A simple get method for retrieving the data of a model. The result will ALWAYS be an array.
   *
   * To query you must pass a callback that receives and returns a QuerySet instance. A QuerySet
   * is an object that contains all of the parameters that you can use to query the database.
   *
   * IMPORTANT: `It's not a **REAL** query builder, because there is no way to guarantee where
   * the data is coming from. It's just a simple and convenient way to make queries across different engines.`
   *
   * @example
   * ```ts
   * const users = await User.default.get((qs) => qs.fields(['id', 'name']).where({ name: 'John' }));
   *
   * // Or you can use like
   *
   *
   * const qs = QuerySet<typeof User>.new('get').fields(['id', 'name']).where({ name: 'John' });
   *
   * const users = await User.default.get(() => qs);
   * ```
   *
   * @param callback - A callback that receives a QuerySet instance and returns a QuerySet instance.
   * @param args - Arguments that can be passed to the query.
   *
   * @return - An array of instances retrieved by this query.
   */
  async get<
    TQueryBuilder extends (
      queryBuilder: GetQuerySet<'get', TModel>
    ) =>
      | QuerySet<'get', TModel, any, any, any, any, any, any>
      | GetQuerySet<'get', TModel, any, any, any, any, any, any>
  >(
    callback: TQueryBuilder,
    args?: {
      engineName?: string;
    }
  ): Promise<
    ReturnType<TQueryBuilder> extends
      | QuerySet<'get', TModel, infer TResult, any, any, any, any, any, any>
      | GetQuerySet<'get', TModel, infer TResult, any, any, any, any, any, any>
      ? TResult[]
      : never
  > {
    const isValidEngineName = typeof args?.engineName === 'string' && args.engineName !== '';
    const engineInstanceName = isValidEngineName ? args.engineName : this.__defaultEngineInstanceName;
    const engineInstance = await this.getEngineInstance(engineInstanceName);
    const initializedDefaultEngineInstanceNameOrSelectedEngineInstanceName = (
      isValidEngineName ? args.engineName : this.__defaultEngineInstanceName
    ) as string;

    const modelInstance = this.getModel(initializedDefaultEngineInstanceNameOrSelectedEngineInstanceName) as Model;
    const modelConstructor = modelInstance.constructor as typeof Model & typeof BaseModel & ModelType<any, any>;
    return callback(new GetQuerySet('get'))['__queryTheData'](modelConstructor, engineInstance);
  }

  async set<
    TQueryBuilder extends (
      queryBuilder: SetQuerySet<
        'set',
        TModel,
        GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'read'>,
        Partial<
          GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'update'>
        >,
        GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'create'>,
        Partial<
          GetDataFromModel<
            TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel,
            'read',
            true
          >
        >,
        GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel>,
        false,
        false,
        false,
        false,
        never
      >
    ) =>
      | RemoveQuerySet<any, TModel, any, any, any, any, any, any, true, any, any, any>
      | QuerySet<any, TModel, any, any, any, any, any, any, true, any, any, any>
      | CommonQuerySet<any, TModel, any, any, any, any, any, any, true, any, any, any>
      | GetQuerySet<any, TModel, any, any, any, any, any, any, true, any, any, any>
      | SetQuerySet<any, TModel, any, any, any, any, any, any, true, any, any, any>
  >(
    callback: TQueryBuilder,
    args?: {
      engineName?: string;
      isToPreventEvents?: boolean;
      transaction?: any;
      /**
       * This is enabled by default if you are inserting more than one element or if you use includes, it can make
       * your code slower, but it will guarantee that the data is consistent.
       */
      useTransaction?: boolean;
      usePalmaresTransaction?: boolean;
    }
  ): Promise<
    ReturnType<TQueryBuilder> extends
      | RemoveQuerySet<any, any, infer TResult, any, any, any, any, any, true, any, any, any>
      | QuerySet<any, any, infer TResult, any, any, any, any, any, true, any, any, any>
      | CommonQuerySet<any, any, infer TResult, any, any, any, any, any, true, any, any, any>
      | GetQuerySet<any, any, infer TResult, any, any, any, any, any, true, any, any, any>
      | SetQuerySet<any, any, infer TResult, any, any, any, any, any, true, any, any, any>
      ? TResult[]
      : never
  > {
    //const isToPreventEvents = typeof args?.isToPreventEvents === 'boolean' ? args.isToPreventEvents : false;

    const isValidEngineName = typeof args?.engineName === 'string' && args.engineName !== '';
    const engineInstanceName = isValidEngineName ? args.engineName : this.__defaultEngineInstanceName;
    const engineInstance = await this.getEngineInstance(engineInstanceName);
    const initializedDefaultEngineInstanceNameOrSelectedEngineInstanceName = (
      isValidEngineName ? args.engineName : this.__defaultEngineInstanceName
    ) as string;

    const modelInstance = this.getModel(initializedDefaultEngineInstanceNameOrSelectedEngineInstanceName) as Model;
    const modelConstructor = modelInstance.constructor as typeof Model & typeof BaseModel & ModelType<any, any>;
    return callback(new SetQuerySet('set'))['__queryTheData'](modelConstructor, engineInstance);
  }

  async remove<
    TQueryBuilder extends (
      queryBuilder: RemoveQuerySet<
        'remove',
        TModel,
        GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'read'>,
        Partial<
          GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'update'>
        >,
        GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'create'>,
        Partial<
          GetDataFromModel<
            TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel,
            'read',
            true
          >
        >,
        GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel>,
        false,
        false,
        false,
        false,
        never
      >
    ) =>
      | RemoveQuerySet<any, TModel, any, any, any, any, any, true, any, true, any, any>
      | QuerySet<any, TModel, any, any, any, any, any, true, any, true, any, any>
      | CommonQuerySet<any, TModel, any, any, any, any, any, true, any, true, any, any>
      | GetQuerySet<any, TModel, any, any, any, any, any, true, any, true, any, any>
      | SetQuerySet<any, TModel, any, any, any, any, any, true, any, true, any, any>
  >(
    callback: TQueryBuilder,
    args?: {
      engineName?: string;
      usePalmaresTransaction?: boolean;
      transaction?: any;
      useTransaction?: boolean;
      isToPreventEvents?: boolean;
    }
  ): Promise<
    ReturnType<TQueryBuilder> extends
      | RemoveQuerySet<any, any, infer TResult, any, any, any, any, true, any, true, any, any>
      | QuerySet<any, any, infer TResult, any, any, any, any, true, any, true, any, any>
      | CommonQuerySet<any, any, infer TResult, any, any, any, any, true, any, true, any, any>
      | GetQuerySet<any, any, infer TResult, any, any, any, any, true, any, true, any, any>
      | SetQuerySet<any, any, infer TResult, any, any, any, any, true, any, true, any, any>
      ? TResult[]
      : never
  > {
    //const isToPreventEvents = typeof args?.isToPreventEvents === 'boolean' ? args.isToPreventEvents : false;
    const isValidEngineName = typeof args?.engineName === 'string' && args.engineName !== '';
    const engineInstanceName = isValidEngineName ? args.engineName : this.__defaultEngineInstanceName;
    const engineInstance = await this.getEngineInstance(engineInstanceName);
    const initializedDefaultEngineInstanceNameOrSelectedEngineInstanceName = (
      isValidEngineName ? args.engineName : this.__defaultEngineInstanceName
    ) as string;

    const modelInstance = this.getModel(initializedDefaultEngineInstanceNameOrSelectedEngineInstanceName) as Model;
    const modelConstructor = modelInstance.constructor as typeof Model & typeof BaseModel & ModelType<any, any>;
    return callback(new RemoveQuerySet('remove'))['__queryTheData'](modelConstructor, engineInstance);
  }
}

export class DefaultManager<
  TModel,
  TDefinitions extends {
    engineInstance: DatabaseAdapter;
    customOptions: any;
  } = {
    engineInstance: DatabaseAdapter;
    customOptions: any;
  }
> extends Manager<TModel, TDefinitions> {}
