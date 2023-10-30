import { adapterRemoveQuery } from '@palmares/databases';

export default adapterRemoveQuery({
  queryData: async (_, args) => {
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
      return deleted.map((data: any) => data.toJSON());
    }
    await remove();
    return [];
  },
});
