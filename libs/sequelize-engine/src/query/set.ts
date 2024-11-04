import { adapterSetQuery } from '@palmares/databases';

import type { ModelCtor } from 'sequelize';

export default adapterSetQuery({
  queryData: async (_, args) => {
    if (args.search && Object.keys(args.search).length > 0) {
      await args.modelOfEngineInstance.update(args.data[0], {
        where: args.search,
        transaction: args.transaction,
        individualHooks: true
      });
      const search = await args.modelOfEngineInstance.findAll({
        where: args.search,
        transaction: args.transaction
      });
      return search.map((each: any) => [false, each.toJSON()]);
    }

    return Promise.all(
      args.data.map(async (eachData: any) => {
        return [
          true,
          (
            await (args.modelOfEngineInstance as ModelCtor<any>).create(eachData, {
              transaction: args.transaction,
              individualHooks: true,
              returning: true
            })
          ).toJSON()
        ];
      })
    );
  }
});
