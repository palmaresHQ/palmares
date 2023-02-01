import { EngineSetQuery } from '@palmares/databases';

import { Model, ModelCtor, Transaction } from 'sequelize';

export default class SequelizeEngineSetQuery extends EngineSetQuery {
  async queryData(args: {
    modelOfEngineInstance: ModelCtor<Model>;
    search: any;
    data?: any;
    transaction?: Transaction;
  }): Promise<any[]> {
    return Promise.all(
      args.data.map(async (eachData: any) => {
        if (args.search === undefined)
          return (
            await args.modelOfEngineInstance.create(eachData, {
              transaction: args.transaction,
            })
          ).toJSON();
        const [instance] = await args.modelOfEngineInstance.upsert(eachData, {
          transaction: args.transaction,
          returning: true,
        });
        return instance.toJSON();
      })
    );
  }
}
