import model from '../../models/model';
import { NotImplementedAdapterException } from '../exceptions';
import DatabaseAdapter from '..';

import type { Includes } from '../../models/types';
import type AdapterQueryOrdering from './ordering';
import type AdapterQuerySearch from './search';

/**
 * Functional approach to the get query adapter instead of class/inheritance approach.
 *
 * This class is used to run `.get` queries, so when we want to retrieve a value from the database to the user.
 */
export function adapterGetQuery<TFunctionQueryData extends AdapterGetQuery['queryData']>(args: {
  /**
   * This is a simple query, by default you should always implement this function in your AdapterGetQuery.
   *
   * This will guarantee that you are able to retrieve the data, it's not much performatic because it will do
   * many small queries to the database, which might slow things down, but you will be guaranteed to work 100%
   * with the types.
   *
   * For a more performatic approach you should implement `queryDataNatively`. That will translate the query to the
   * native query, but the second can be harder to implement since it relies on knowing about palmares objects and
   * model structure.
   *
   * A simple Sequelize example:
   * @example
   * ```ts
   * async queryData(
   *   _engine: DatabaseAdapter,
   *   args: {
   *     modelOfEngineInstance: ModelCtor<Model>;
   *     search: any;
   *     fields: readonly string[];
   *     ordering?: Order;
   *     limit?: number;
   *     offset?: number | string;
   *   }
   * ) {
   *   const findAllOptions: Parameters<ModelCtor<Model>['findAll']>[0] = {
   *     attributes: args.fields as string[],
   *     where: args.search,
   *     nest: true,
   *     raw: true,
   *   };
   *   if (args.ordering) findAllOptions.order = args.ordering;
   *   if (args.limit) findAllOptions.limit = args.limit;
   *   if (args.offset) findAllOptions.offset = Number(args.offset);
   *   return args.modelOfEngineInstance.findAll(findAllOptions);
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the query.
   * @param _args - The arguments of the query.
   * @param _args.modelOfEngineInstance - The model instance to query, this is what your ORM has translated on `AdapterModel.translate` function.
   * @param _args.fields - The fields to retrieve from the database, sometimes the user doesn't want to retrieve all of the fields from the database.
   * @param _args.ordering - The ordering to use on the query, this ordering is translated from the `parseOrdering` inside {@link AdapterQueryOrdering}
   * @param _args.search - The search argument to search on the database. This was translated from the `parseSearch` inside {@link AdapterQuerySearch}
   * @param _args.limit - The limit of the query, this is used for pagination.
   * @param _args.offset - The offset of the query, this is used for pagination.
   *
   * @returns - Returns an array, always should return an array, if the data doesn't exist, return an empty array instead of undefined or null.
   */
  queryData: TFunctionQueryData;
}) {
  class CustomAdapterGetQuery extends AdapterGetQuery {
    queryData = args.queryData as TFunctionQueryData;
  }

  return CustomAdapterGetQuery as typeof AdapterGetQuery & {
    new (): AdapterGetQuery & { queryData: TFunctionQueryData };
  };
}

/** This class is used to run `.get` queries, so when we want to retrieve a value from the database to the user. */
export default class AdapterGetQuery {
  /**
   * This is a simple query, by default you should always implement this function in your AdapterGetQuery.
   *
   * This will guarantee that you are able to retrieve the data, it's not much performatic because it will do
   * many small queries to the database, which might slow things down, but you will be guaranteed to work 100%
   * with the types.
   *
   * For a more performatic approach you should implement `queryDataNatively`. That will translate the query to the
   * native query, but the second can be harder to implement since it relies on knowing about palmares objects and
   * model structure.
   *
   * A simple Sequelize example:
   * @example
   * ```ts
   * async queryData(
   *   _engine: DatabaseAdapter,
   *   args: {
   *     modelOfEngineInstance: ModelCtor<Model>;
   *     search: any;
   *     fields: readonly string[];
   *     ordering?: Order;
   *     limit?: number;
   *     offset?: number | string;
   *   }
   * ) {
   *   const findAllOptions: Parameters<ModelCtor<Model>['findAll']>[0] = {
   *     attributes: args.fields as string[],
   *     where: args.search,
   *     nest: true,
   *     raw: true,
   *   };
   *   if (args.ordering) findAllOptions.order = args.ordering;
   *   if (args.limit) findAllOptions.limit = args.limit;
   *   if (args.offset) findAllOptions.offset = Number(args.offset);
   *   return args.modelOfEngineInstance.findAll(findAllOptions);
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the query.
   * @param _args - The arguments of the query.
   * @param _args.modelOfEngineInstance - The model instance to query, this is what your ORM has translated on `AdapterModel.translate` function.
   * @param _args.fields - The fields to retrieve from the database, sometimes the user doesn't want to retrieve all of the fields from the database.
   * @param _args.ordering - The ordering to use on the query, this ordering is translated from the `parseOrdering` inside {@link AdapterQueryOrdering}
   * @param _args.search - The search argument to search on the database. This was translated from the `parseSearch` inside {@link AdapterQuerySearch}
   * @param _args.limit - The limit of the query, this is used for pagination.
   * @param _args.offset - The offset of the query, this is used for pagination.
   *
   * @returns - Returns an array, always should return an array, if the data doesn't exist, return an empty array instead of undefined or null.
   */
  async queryData(
    _engine: DatabaseAdapter,
    _args: {
      modelOfEngineInstance: any;
      search: any;
      fields: readonly string[];
      ordering?: any;
      limit?: number;
      offset?: number | string;
    }
  ): Promise<any[]> {
    return [];
  }

  async queryDataNatively?(
    _engine: DatabaseAdapter,
    _modelConstructor: ReturnType<typeof model>,
    _search: any,
    _fields: readonly string[],
    _includes: Includes,
    _defaultParseSearch: (modelConstructor: InstanceType<ReturnType<typeof model>>, search: any) => Promise<any>
  ): Promise<any[]> {
    throw new NotImplementedAdapterException('queryDataNatively');
  }
}
