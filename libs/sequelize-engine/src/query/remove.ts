import { adapterRemoveQuery } from '@palmares/databases';

export default adapterRemoveQuery({
  queryData: async (_, args) => {
    // eslint-disable-next-line ts/require-await
    async function remove() {
      return args.modelOfEngineInstance.destroy({
        where: args.search,
        transaction: args.transaction
      });
    }

    const deleted = await args.modelOfEngineInstance.findAll({
      where: args.search,
      transaction: args.transaction
    });
    await args.modelOfEngineInstance.destroy({
      where: args.search,
      transaction: args.transaction
    });
    return deleted.map((data: any) => data.toJSON());
  }
});
