import { EngineSetQuery } from '@palmares/databases';

import { Model, ModelCtor, Transaction } from 'sequelize';

export default class SequelizeEngineSetQuery extends EngineSetQuery {
  async queryData(
    modelOfEngineInstance: ModelCtor<Model>,
    search: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _ = undefined,
    data?: any,
    transaction?: Transaction
  ): Promise<any[]> {
    return Promise.all(
      data.map(async (eachData: any) => {
        if (search === undefined)
          return (
            await modelOfEngineInstance.create(eachData, { transaction })
          ).toJSON();
        const [instance] = await modelOfEngineInstance.upsert(eachData, {
          transaction: transaction,
          returning: true,
        });
        return instance.toJSON();
      })
    );
  }
}
