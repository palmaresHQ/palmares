import Engine from '.';
import model from '../models/model';
import {
  IncludesRelatedModels,
  AllOptionalModelFields,
  AllRequiredModelFields,
  ModelFields,
  TModel,
} from '../models/types';

/**
 * Offers >>>>BASIC<<<< querying functionalities, this enables us to create libs that works well on every
 * database engine without needing to specify a database engine. We usually advise AGAINST using this on
 * real projects since this is not really well optimized for many operations like joins, select only a bunch of fields
 * and so on.
 *
 * By default this will query for all of the fields in the database, so they are all non optimized. It's preferred
 * to use the engine directly for querying. Although this not advised this enables us to create functionalities
 * that can work well on every engine. This is also really easy to implement for people that want to create new
 * database engines.
 *
 * The basic methods `get`, `set` and `remove` have the API idea taken of the browser's `localhost` and also
 * from `redis`. This guarantees this can work on most kind of databases without issues.
 */
export default class EngineQuery {
  engineInstance: Engine;

  constructor(engineInstance: Engine) {
    this.engineInstance = engineInstance;
  }

  getModelInstance(model: TModel) {
    return (model.constructor as any).default.getInstance(
      this.engineInstance.databaseName
    );
  }

  /**
   * A simple get method for retrieving the data of a model. It will ALWAYS be an array, it's the programmers responsibility
   * to filter it accordingly if he want to retrieve an instance.
   *
   * @param instance - The model instance (translated by the engine) that we will use for this query.
   * @param search - All of the parameters of a model that can be optional for querying.
   *
   * @return - An array of instances retrieved by this query.
   */
  async get<
    M extends TModel,
    I extends readonly ReturnType<typeof model>[] | undefined
  >(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    instance: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    args?: {
      includes?: any[];
      search?: AllOptionalModelFields<M>;
    }
  ): Promise<IncludesRelatedModels<AllRequiredModelFields<M>, M, I>[]> {
    return [] as IncludesRelatedModels<AllRequiredModelFields<M>, M, I>[];
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
   * FOR ENGINE BUILDERS:
   * This is the most hard API to create for the querying of a model. But we need to make this way
   * to make things simple.
   * Some times when typing your returns you might need to cast as unknown first.
   *
   * @param instance - The model instance (translated by the engine) that we will use for this query.
   * @param data - The data is conditional, if you pass the `search` argument this means you are updating,
   * then all parameters will be optional, otherwise some of the parameters will be obligatory because you are
   * creating an instance.
   * @param search - All of the parameters of a model that can be optional for querying.
   *
   * @return - Return the created instance or undefined if something went wrong, or boolean if it's an update.
   */
  async set<
    M extends TModel,
    S extends AllOptionalModelFields<M> | undefined | null = undefined
  >(
    instance: any,
    data: S extends undefined ? ModelFields<M> : AllOptionalModelFields<M>,
    search?: S
  ): Promise<
    S extends undefined | null ? AllRequiredModelFields<M> | undefined : boolean
  > {
    const isSearchNotDefined = [null, undefined].includes(
      search as null | undefined
    );
    if (isSearchNotDefined) {
      return {} as S extends undefined | null
        ? AllRequiredModelFields<M> | undefined
        : boolean;
    }
    return false as S extends undefined | null
      ? AllRequiredModelFields<M> | undefined
      : boolean;
  }

  /**
   * Simple query to remove one or more instances from the database. Be aware that not defining a search
   * might mean removing all of the instances of your database.
   *
   * @param instance - The model instance (translated by the engine) that we will use for this query.
   * @param search - All of the parameters of a model that can be used for querying.
   *
   * @return - Returns true if everything went fine and false otherwise.
   */
  async remove<M extends TModel>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    instance: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    search?: AllOptionalModelFields<M>
  ): Promise<boolean> {
    return false;
  }
}
