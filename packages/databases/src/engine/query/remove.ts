import type DatabaseAdapter from '..';

export function adapterRemoveQuery<TFunctionQueryData extends AdapterRemoveQuery['queryData']>(args: {
  /**
   * This query is used to remove a certain data from the database.
   *
   * An example of how you can implement it on sequelize
   * @example
   * ```typescript
   * queryData: async (_, args) => {
   *   async function remove() {
   *     return args.modelOfEngineInstance.destroy({
   *       where: args.search,
   *       transaction: args.transaction,
   *      });
   *   }
   *
   *   if (args.shouldReturnData) {
   *     const deleted = await args.modelOfEngineInstance.findAll({
   *       where: args.search,
   *       transaction: args.transaction,
   *     });
   *     await remove();
   *
   *     return deleted.map((data: any) => data.toJSON());
   *   }
   *
   *   await remove();
   *   return [];
   * }
   */
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
   * An example of how you can implement it on sequelize
   * @example
   * ```typescript
   * queryData: async (_, args) => {
   *   async function remove() {
   *     return args.modelOfEngineInstance.destroy({
   *       where: args.search,
   *       transaction: args.transaction,
   *      });
   *   }
   *
   *   if (args.shouldReturnData) {
   *     const deleted = await args.modelOfEngineInstance.findAll({
   *       where: args.search,
   *       transaction: args.transaction,
   *     });
   *     await remove();
   *
   *     return deleted.map((data: any) => data.toJSON());
   *   }
   *
   *   await remove();
   *   return [];
   * }
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
