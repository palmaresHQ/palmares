import type DatabaseAdapter from '..';

export function adapterRemoveQuery<TFunctionQueryData extends AdapterRemoveQuery['queryData']>(args: {
  queryData: TFunctionQueryData;
}) {
  class CustomAdapterRemoveQuery extends AdapterRemoveQuery {
    queryData = args.queryData as TFunctionQueryData;
  }

  return CustomAdapterRemoveQuery as typeof AdapterRemoveQuery & {
    new (): AdapterRemoveQuery & { queryData: TFunctionQueryData };
  };
}

export default class AdapterRemoveQuery {
  /**
   * This query is used to remove a certain data from the database.
   *
   * @param modelOfEngineInstance - The model instance to query.
   */
  async queryData(
    _engine: DatabaseAdapter,
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
