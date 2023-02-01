/* eslint-disable @typescript-eslint/no-unused-vars */
import model from '../models/model';
import type EngineQuery from './query';
import type {
  Includes,
  ModelFieldsWithIncludes,
  FieldsOFModelType,
} from '../models/types';
import { NotImplementedEngineException } from './exceptions';

/** This class is used to run `.get` queries, so when we want to retrieve a value from the database to the user. */
export default class EngineGetQuery {
  engineQueryInstance: EngineQuery;

  constructor(engineQuery: EngineQuery) {
    this.engineQueryInstance = engineQuery;
  }

  /**
   * This is a simple query, by default you should always implement this function in your EngineGetQuery.
   *
   * This will guarantee that you are able to retrieve the data, it's not much performatic because it will do
   * many small queries to the database, which might slow things down, but you will be guaranteed to work 100%
   * with the types.
   *
   * For a more performatic approach you should implement `queryDataNatively`. That will translate the query to the
   * native query, but the second can be harder to implement since it relies on knowing about palmares objects and
   * model structure.
   *
   * @param modelConstructor - The model instance to query.
   * @param search - The search argument to search on the database.
   * @param fields - The fields to be included in the search and the output.
   */
  async queryData(args: {
    modelOfEngineInstance: any;
    search: any;
    fields: readonly string[];
  }): Promise<any[]> {
    return [];
  }

  async queryDataNatively(
    modelConstructor: ReturnType<typeof model>,
    search: any,
    fields: readonly string[],
    includes: Includes
  ): Promise<any[]> {
    throw new NotImplementedEngineException('queryDataNatively');
  }

  async run<
    TModel extends InstanceType<ReturnType<typeof model>>,
    TIncludes extends Includes = undefined,
    TFieldsOfModel extends FieldsOFModelType<
      InstanceType<ReturnType<typeof model>>
    > = readonly (keyof TModel['fields'])[],
    TSearch extends
      | ModelFieldsWithIncludes<
          TModel,
          TIncludes,
          TFieldsOfModel,
          false,
          false,
          true,
          true
        >
      | undefined = undefined
  >(
    args: {
      fields?: TFieldsOfModel;
      search?: TSearch;
    },
    internal: {
      model: TModel;
      includes: TIncludes;
    }
  ): Promise<ModelFieldsWithIncludes<TModel, TIncludes>[]> {
    const result: any[] = [];
    const selectedFields = (args.fields ||
      Object.keys(internal.model.fields)) as TFieldsOfModel;
    try {
      throw new NotImplementedEngineException('queryDataNatively');
      return await this.queryDataNatively(
        internal.model.constructor as ReturnType<typeof model>,
        args.search,
        selectedFields as unknown as string[],
        internal.includes
      );
    } catch (e) {
      if ((e as Error).name === NotImplementedEngineException.name)
        await this.engineQueryInstance.getResultsWithIncludes(
          internal.model as TModel,
          selectedFields as TFieldsOfModel,
          internal.includes as TIncludes,
          args.search as TSearch,
          result,
          this.queryData.bind(this),
          false,
          false,
          undefined,
          undefined,
          undefined
        );
      else throw e;
    }
    return result as ModelFieldsWithIncludes<TModel, TIncludes>[];
  }
}
