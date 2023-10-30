import type DatabaseAdapter from '..';

export function adapterSetQuery<TFunctionQueryData extends AdapterSetQuery['queryData']>(args: {
  /**
   * This is a simple upsert query, by default you should always implement this function in your AdapterSetQuery.
   *
   * _Note_: If `args.search` is not null or undefined, you should update the data, otherwise you should create it.
   * _Note 2_: You should return an array, the first argument is true if the data was created, false otherwise. The second argument is the data that was created or updated.
   *
   * @example
   * ```ts
   * async queryData(
   *   _: DatabaseAdapter,
   *   args: {
   *     modelOfEngineInstance: ModelCtor<Model>;
   *     search: any;
   *     data?: any;
   *     transaction?: Transaction;
   *   }
   * ): Promise<[boolean, any][]> {
   *   return Promise.all(
   *     args.data.map(async (eachData: any) => {
   *       if (args.search === undefined)
   *         return [
   *           true,
   *           (
   *             await args.modelOfEngineInstance.create(eachData, {
   *               transaction: args.transaction,
   *             })
   *           ).toJSON(),
   *         ];
   *       const [instance, hasCreated] = await args.modelOfEngineInstance.upsert(eachData, {
   *         transaction: args.transaction,
   *         returning: true,
   *       });
   *       return [hasCreated ? hasCreated : false, instance.toJSON()];
   *     })
   *   );
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the query.
   * @param _args - The arguments of the query.
   * @param _args.modelOfEngineInstance - The model instance to query, this is what your ORM has translated on `AdapterModel.translate` function.
   * @param _args.search - The search argument to search on the database.
   * @param _args.data - The data to be inserted or updated.
   * @param _args.transaction - The transaction to use to run the query, That's what you pass to the callback function on `DatabaseAdapter.transaction`.
   *
   * @returns - Returns an array of tuples, the first argument is true if the data was created, false otherwise. The second argument is the data that was created or updated.
   */
  queryData: TFunctionQueryData;
}) {
  class CustomAdapterSetQuery extends AdapterSetQuery {
    queryData = args.queryData as TFunctionQueryData;
  }

  return CustomAdapterSetQuery as typeof AdapterSetQuery & {
    new (): AdapterSetQuery & { queryData: TFunctionQueryData };
  };
}

export default class AdapterSetQuery {
  /**
   * This is a simple upsert query, by default you should always implement this function in your AdapterSetQuery.
   *
   * _Note_: If `args.search` is not null or undefined, you should update the data, otherwise you should create it.
   * _Note 2_: You should return an array, the first argument is true if the data was created, false otherwise. The second argument is the data that was created or updated.
   *
   * @example
   * ```ts
   * async queryData(
   *   _: DatabaseAdapter,
   *   args: {
   *     modelOfEngineInstance: ModelCtor<Model>;
   *     search: any;
   *     data?: any;
   *     transaction?: Transaction;
   *   }
   * ): Promise<[boolean, any][]> {
   *   return Promise.all(
   *     args.data.map(async (eachData: any) => {
   *       if (args.search === undefined)
   *         return [
   *           true,
   *           (
   *             await args.modelOfEngineInstance.create(eachData, {
   *               transaction: args.transaction,
   *             })
   *           ).toJSON(),
   *         ];
   *       const [instance, hasCreated] = await args.modelOfEngineInstance.upsert(eachData, {
   *         transaction: args.transaction,
   *         returning: true,
   *       });
   *       return [hasCreated ? hasCreated : false, instance.toJSON()];
   *     })
   *   );
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the query.
   * @param _args - The arguments of the query.
   * @param _args.modelOfEngineInstance - The model instance to query, this is what your ORM has translated on `AdapterModel.translate` function.
   * @param _args.search - The search argument to search on the database.
   * @param _args.data - The data to be inserted or updated.
   * @param _args.transaction - The transaction to use to run the query, That's what you pass to the callback function on `DatabaseAdapter.transaction`.
   *
   * @returns - Returns an array of tuples, the first argument is true if the data was created, false otherwise. The second argument is the data that was created or updated.
   */
  async queryData(
    _engine: DatabaseAdapter,
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
