import { EngineRemoveQuery } from '@palmares/databases';

import { Model, ModelCtor, Transaction } from 'sequelize';

export default class SequelizeEngineRemoveQuery extends EngineRemoveQuery {
  async queryData(args: {
    modelOfEngineInstance: ModelCtor<Model>;
    search: any;
    shouldReturnData?: boolean;
    transaction?: Transaction;
  }) {
    async function remove() {
      return args.modelOfEngineInstance.destroy({
        where: args.search,
        transaction: args.transaction,
      });
    }
    if (args.shouldReturnData) {
      const deleted = await args.modelOfEngineInstance.findAll({
        where: args.search,
        transaction: args.transaction,
      });
      await remove();
      return deleted.map((data) => data.toJSON());
    }
    await remove();
    return [];
  }
}
