import { conf, Domain } from '@palmares/core';

import {
  ManagerInstancesType,
  ManagerEngineInstancesType,
  AllOptionalModelFields,
  AllRequiredModelFields,
  ModelFields,
  IncludesRelatedModels,
  AllRequiredFieldsIgnoringRelations,
} from './types';
import {
  IncludesRelatedModelsForCreateOrUpdate,
  CreateOrUpdateModelFields,
} from './types/create-or-update';
import { Includes } from './types/queries';
import { ManagerEngineInstanceNotFoundError } from './exceptions';
import Engine from '../engine';
import { Model, default as model } from './model';
import Databases from '../databases';
import { DatabaseSettingsType } from '../types';
import { DatabaseDomainInterface } from '../interfaces';

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
export default class Manager<
  M extends Model = Model,
  EI extends Engine<M> | null = null
> {
  instances: ManagerInstancesType;
  engineInstances: ManagerEngineInstancesType;
  defaultEngineInstanceName: string;
  model!: Model;
  modelKls!: { new (...args: unknown[]): any };
  isLazyInitializing = false;

  constructor() {
    //this.modelKls = modelKls;
    this.instances = {};
    this.engineInstances = {};
    this.defaultEngineInstanceName = '';
  }

  _setModel(model: M) {
    this.model = model as M;
  }

  /**
   * This function is used to initialize the models outside of the default Domain lifecycle. Sometimes we might define
   * the model outside of the domain, because of that we need to initialize the models manually. Usually it's a lot better
   * to just use the models after they've been initialized but sometimes it might happen that you need to initialize them
   * before the app is ready. For that we will use this. This will create a new Database instance if it doesn't exist,
   * load the settings from where we can find them and initialize the domains. After that we are able to retrieve
   */
  async verifyIfNotInitializedAndInitializeModels(engineName: string) {
    const database = new Databases();
    const canInitializeTheModels =
      this.isLazyInitializing === false &&
      database.isInitialized === false &&
      database.isInitializing === false;
    this.isLazyInitializing = true;
    if (canInitializeTheModels) {
      const settings =
        (await conf.getSettings()) as unknown as DatabaseSettingsType;
      const { domains } = await Domain.initializeDomains(settings);
      await database.lazyInitializeEngine(
        engineName,
        settings,
        domains as DatabaseDomainInterface[]
      );
      return true;
    }
    return false;
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
  async getInstance<T extends Engine = Engine>(
    engineName?: string
  ): Promise<EI extends Engine ? EI['ModelType'] : T['ModelType']> {
    const engineInstanceName = engineName || this.defaultEngineInstanceName;
    const doesInstanceExists = this.instances[engineInstanceName] !== undefined;
    if (doesInstanceExists) return this.instances[engineInstanceName];

    const hasLazilyInitialized =
      await this.verifyIfNotInitializedAndInitializeModels(engineInstanceName);
    if (hasLazilyInitialized) return this.getInstance(engineName);

    throw new ManagerEngineInstanceNotFoundError(engineInstanceName);
  }

  _setInstance(engineName: string, instance: any) {
    const isDefaultEngineInstanceNameEmpty =
      this.defaultEngineInstanceName === '';
    if (isDefaultEngineInstanceNameEmpty)
      this.defaultEngineInstanceName = engineName;

    this.instances[engineName] = instance;
  }

  async getEngineInstance<T extends Engine = Engine>(
    engineName?: string
  ): Promise<EI extends Engine ? EI : T> {
    const engineInstanceName: string =
      engineName || this.defaultEngineInstanceName;
    const doesInstanceExists =
      this.engineInstances[engineInstanceName] !== undefined;
    if (doesInstanceExists)
      return this.engineInstances[engineInstanceName] as EI extends Engine
        ? EI
        : T;
    const hasLazilyInitialized =
      await this.verifyIfNotInitializedAndInitializeModels(engineInstanceName);
    if (hasLazilyInitialized) return this.getEngineInstance(engineName);
    throw new ManagerEngineInstanceNotFoundError(engineInstanceName);
  }

  _setEngineInstance(engineName: string, instance: Engine) {
    const isDefaultEngineInstanceNameEmpty =
      this.defaultEngineInstanceName === '';
    if (isDefaultEngineInstanceNameEmpty)
      this.defaultEngineInstanceName = engineName;
    this.engineInstances[engineName] = instance;
  }

  /**
   * A simple get method for retrieving the data of a model. It will ALWAYS be an array, it's the programmers responsibility
   * to filter it accordingly if he want to retrieve an instance.
   *
   * @param search - All of the parameters of a model that can be optional for querying.
   * @param engineName - The name of the engine to use defined in the DATABASES object. By default we use the `default` one.
   *
   * @return - An array of instances retrieved by this query.
   */
  async get<
    I extends readonly ReturnType<typeof model>[] | undefined,
    MDL extends Model = M
  >(
    args?: {
      includes?: I;
      search?: AllOptionalModelFields<MDL>;
    },
    engineName?: string
  ): Promise<IncludesRelatedModels<AllRequiredModelFields<MDL>, MDL, I>[]> {
    // Promise.all here will not work, we need to do this sequentially.
    const engineInstance = await this.getEngineInstance(engineName);

    return engineInstance.query.get<MDL, I>(
      await this.getInstance(engineName),
      {
        includes: await Promise.all(
          (args?.includes || []).map(
            async (includeModel) =>
              await includeModel.default.getInstance(engineName)
          )
        ),
        search: args?.search,
      },
      {
        model: this.model as MDL,
        includes: (args?.includes || []) as I,
      }
    ) as Promise<IncludesRelatedModels<AllRequiredModelFields<MDL>, MDL, I>[]>;
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
   * @param engineName - The name of the engine to use defined in the DATABASES object. By default we use the `default` one.
   *
   * @return - Return the created instance or undefined if something went wrong, or boolean if it's an update.
   */
  async set<
    I extends Includes = undefined,
    S extends M | undefined = undefined
  >(
    args: {
      data: IncludesRelatedModelsForCreateOrUpdate<
        CreateOrUpdateModelFields<M>,
        M,
        I
      >;
      search?: S;
      includes?: I;
    },
    engineName?: string
  ): Promise<
    S extends undefined | null ? AllRequiredModelFields<M> | undefined : boolean
  > {
    // Promise.all here will not work, we need to do this sequentially.
    const engineInstance = await this.getEngineInstance(engineName);

    return engineInstance.query.set<M, I, S>(
      await this.getInstance(engineName),
      args.data as S extends undefined
        ? ModelFields<M>
        : AllOptionalModelFields<M>,
      args.search,
      await Promise.all(
        (args?.includes || []).map(
          async (includeModel) =>
            await includeModel.default.getInstance(engineName)
        )
      ),
      {
        model: this.model as M,
        includes: args.includes as I,
      }
    );
  }

  /**
   * Simple query to remove one or more instances from the database. Be aware that not defining a search
   * might mean removing all of the instances of your database.
   *
   * @param search - All of the parameters of a model that can be used for querying.
   * @param engineName - The name of the engine to use defined in the DATABASES object. By default we use the `default` one.
   *
   * @return - Returns true if everything went fine and false otherwise.
   */
  async remove(
    search: AllOptionalModelFields<M>,
    engineName?: string
  ): Promise<boolean> {
    const [engineInstance, instance] = await Promise.all([
      this.getEngineInstance(),
      this.getInstance(engineName),
    ]);
    return engineInstance.query.remove<M>(instance, search);
  }
}

export class DefaultManager<M extends Model> extends Manager<M, null> {}
