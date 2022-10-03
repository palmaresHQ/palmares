import {
  ManagerInstancesType,
  ManagerEngineInstancesType,
  AllOptionalModelFields,
  AllRequiredModelFields,
  ModelFields,
  IncludesRelatedModels,
} from './types';
import { ManagerEngineInstanceNotFoundError } from './exceptions';
import Engine from '../engine';
import { Model, default as model } from './model';

/**
 * Managers define how you make queries on the database. Instead of making queries everywhere in your application
 * you should always use managers for your most common tasks.
 *
 * So instead of:
 * ```
 * User.default.getInstance().findAll({ where: { firstName: 'Jane' } });
 * ```
 *
 * You should make queries like
 * ```
 * class UserManager extends models.Manager<User, SequelizeEngine> {
 *    async getJaneDoe() {
 *      return await this.getInstance().findAll({ where: { firstName: 'Jane' } });
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
  model!: ReturnType<typeof model>;

  constructor() {
    this.instances = {};
    this.engineInstances = {};
    this.defaultEngineInstanceName = '';
  }

  _setModel(model: M) {
    this.model = model as any;
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
  getInstance<T extends Engine = Engine>(
    engineName?: string
  ): EI extends Engine ? EI['ModelType'] : T['ModelType'] {
    const engineInstanceName = engineName || this.defaultEngineInstanceName;
    const doesInstanceExists = this.instances[engineInstanceName] !== undefined;
    if (doesInstanceExists) return this.instances[engineInstanceName];

    throw new ManagerEngineInstanceNotFoundError(engineInstanceName);
  }

  _setInstance(engineName: string, instance: any) {
    const isDefaultEngineInstanceNameEmpty =
      this.defaultEngineInstanceName === '';
    if (isDefaultEngineInstanceNameEmpty)
      this.defaultEngineInstanceName = engineName;

    this.instances[engineName] = instance;
  }

  getEngineInstance<T extends Engine = Engine>(
    engineName?: string
  ): EI extends Engine ? EI : T {
    const engineInstanceName: string =
      engineName || this.defaultEngineInstanceName;
    const doesInstanceExists =
      this.engineInstances[engineInstanceName] !== undefined;
    if (doesInstanceExists)
      return this.engineInstances[engineInstanceName] as EI extends Engine
        ? EI
        : T;
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
  async get<I extends readonly ReturnType<typeof model>[] | undefined>(
    args?: {
      includes?: I;
      search?: AllOptionalModelFields<M>;
    },
    engineName?: string
  ): Promise<IncludesRelatedModels<AllRequiredModelFields<M>, M, I>[]> {
    return this.getEngineInstance().query.get<M, I>(
      this.getInstance(engineName),
      args
    ) as Promise<IncludesRelatedModels<AllRequiredModelFields<M>, M, I>[]>;
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
  async set<S extends AllOptionalModelFields<M> | undefined | null = undefined>(
    data: S extends undefined | null
      ? ModelFields<M>
      : AllOptionalModelFields<M>,
    search?: S,
    engineName?: string
  ): Promise<
    S extends undefined | null ? AllRequiredModelFields<M> | undefined : boolean
  > {
    return this.getEngineInstance().query.set<M, S>(
      this.getInstance(engineName),
      data as S extends undefined ? ModelFields<M> : AllOptionalModelFields<M>,
      search
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
    return this.getEngineInstance().query.remove<M>(
      this.getInstance(engineName),
      search
    );
  }
}

export class DefaultManager<M extends Model> extends Manager<M, null> {}
