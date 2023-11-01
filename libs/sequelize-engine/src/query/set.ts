import { adapterSetQuery } from '@palmares/databases';

export default adapterSetQuery({
  queryData: async (_, args) => {
    return Promise.all(
      args.data.map(async (eachData: any) => {
        if (args.search === undefined)
          return [
            true,
            (
              await args.modelOfEngineInstance.create(eachData, {
                transaction: args.transaction,
              })
            ).toJSON(),
          ];
        const [instance, hasCreated] = await args.modelOfEngineInstance.upsert(eachData, {
          transaction: args.transaction,
          returning: true,
        });
        return [hasCreated ? hasCreated : false, instance.toJSON()];
      })
    );
  },
});
