import type Engine from '..';
export default class EngineSetQuery {
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
      data: any;
      transaction?: any;
    }
  ): Promise<[boolean, any][]> {
    return _args.data.map((eachData: any) => [true, { ...eachData }]);
  }
}
