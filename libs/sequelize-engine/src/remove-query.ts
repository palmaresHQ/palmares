import { EngineRemoveQuery } from '@palmares/databases';

import { Model, ModelCtor, Transaction } from 'sequelize';

export default class SequelizeEngineRemoveQuery extends EngineRemoveQuery {
  /*async queryData(
    modelOfEngineInstance: any,
    search: any,
    fields?: readonly string[],
    data = undefined,
    transaction?: any
  ) {
    const toDelete = modelOfEngineInstance.findAll({
      attributes: fields as string[],
      where: search,
      nest: true,
      raw: true,
    });
    return toDelete;
  }*/
}
