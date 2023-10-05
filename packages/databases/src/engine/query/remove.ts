import type Engine from '..';
export default class EngineRemoveQuery {
  /**
   * Should return the data removed from the database, this way we are able to revert the changes if something fails.
   *
   * @param modelOfEngineInstance - The model instance to query.
   */
  async queryData(
    _engine: Engine,
    _args: {
      modelOfEngineInstance: any;
      search: any;
      shouldReturnData?: boolean;
      shouldNotDelete?: boolean;
      transaction?: any;
    }
  ): Promise<any[]> {
    return [{}];
  }
}
