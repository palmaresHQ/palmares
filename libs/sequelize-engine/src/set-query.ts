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
          return JSON.parse(
            JSON.stringify(
              await modelOfEngineInstance.create(eachData, { transaction })
            )
          );
        try {
          const [instance] = await modelOfEngineInstance.upsert(eachData, {
            transaction: transaction,
            returning: true,
          });
          return JSON.parse(JSON.stringify(instance));
        } catch (error) {
          console.log(error);
          throw error;
        }
      })
    );
  }
}
