import { adapterSetQuery } from '@palmares/databases';

export default adapterSetQuery({
  queryData: async (_, args) => {
    return Promise.all(
      args.data.map(async (eachData: any) => {
        const hasSearch = Object.keys(args.search).length > 0 && args.search !== undefined;
        if (!hasSearch)
          return [
            true,
            (
              await args.modelOfEngineInstance.create(eachData, {
                transaction: args.transaction
              })
            ).toJSON()
          ];
        await args.modelOfEngineInstance.update(eachData, {
          where: args.search,
          transaction: args.transaction,
          individualHooks: true
        });
        const search = await args.modelOfEngineInstance.findAll({
          where: args.search,
          transaction: args.transaction
        });
        return [false, await Promise.all(search.map((each: any) => each.toJSON()))];
      })
    );
  }
});
