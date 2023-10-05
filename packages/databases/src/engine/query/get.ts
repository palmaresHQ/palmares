/* eslint-disable @typescript-eslint/no-unused-vars */
import model from '../../models/model';
import type { Function } from 'ts-toolbelt';
import type EngineQuery from '.';
import type {
  Includes,
  ModelFieldsWithIncludes,
  FieldsOFModelType,
  OrderingOfModelsType,
  FieldsOfModelOptionsType,
} from '../../models/types';
import { NotImplementedEngineException } from '../exceptions';
import Engine from '..';
import parseSearch from '../../queries/search';
import { BaseModel } from '../../models';

/** This class is used to run `.get` queries, so when we want to retrieve a value from the database to the user. */
export default class EngineGetQuery {
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
  async queryData(
    _engine: Engine,
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

  async queryDataNatively(
    _engine: Engine,
    _modelConstructor: ReturnType<typeof model>,
    _search: any,
    _fields: readonly string[],
    _includes: Includes,
    _defaultParseSearch: (model: BaseModel<any>, search: any) => Promise<any>
  ): Promise<any[]> {
    throw new NotImplementedEngineException('queryDataNatively');
  }
}
