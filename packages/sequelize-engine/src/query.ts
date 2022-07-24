import { AllOptionalModelFields, AllRequiredModelFields, EngineQuery, ModelFields, TModel } from '@palmares/databases';

import { ModelCtor, Model, Attributes, WhereOptions, CreateOptions, CreationAttributes } from 'sequelize/types';
import { Col, Fn, Literal } from 'sequelize/types/utils';

export default class SequelizeEngineQuery extends EngineQuery {
  async get<M extends TModel>(
    instance: ModelCtor<Model<ModelFields<M>>>,
    search?: AllOptionalModelFields<M>
  ): Promise<null | AllRequiredModelFields<M>[]> {
    try {
      return await instance.findAll({
        where: search,
        raw: true
      }) as AllRequiredModelFields<M>[];
    } catch {
      return null;
    }
  }

  async set<M extends TModel>(
    instance: ModelCtor<Model<ModelFields<M>>>,
    data: ModelFields<M>, search?: AllOptionalModelFields<M>
  ) {
    type SequelizeModel = Model<ModelFields<M>>;
    type SequelizeAttributes = Attributes<SequelizeModel>
    type UpdateValueType = {
      [key in keyof SequelizeAttributes]?: SequelizeAttributes[key] | Fn | Col | Literal;
    };
    type SearchType = WhereOptions<SequelizeAttributes>;

    try {
      if (search) await instance.update<Model<ModelFields<M>>>(
        data as UpdateValueType, {
          where: search as SearchType
        });
      await instance.create(data as CreationAttributes<SequelizeModel>);
      return true;
    } catch {
      return false;
    }
  }
}
