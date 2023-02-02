import { EngineRemoveQuery } from '@palmares/databases';

import { Model, ModelCtor } from 'sequelize';

let count = 0;
export default class SequelizeEngineRemoveQuery extends EngineRemoveQuery {
  async queryData(args: {
    modelOfEngineInstance: ModelCtor<Model>;
    search: any;
    shouldReturnData: boolean;
  }) {
    if (count > 0) throw new Error();
    count++;
    async function remove() {
      return args.modelOfEngineInstance.destroy({
        where: args.search,
      });
    }
    if (args.shouldReturnData) {
      const deleted = await args.modelOfEngineInstance.findAll({
        where: args.search,
      });
      await remove();
      return deleted.map((data) => data.toJSON());
    }
    await remove();
    return [];
  }
}
