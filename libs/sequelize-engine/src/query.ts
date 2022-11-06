import {
  AllOptionalModelFields,
  AllRequiredModelFields,
  EngineQuery,
  ModelFields,
  TModel,
  models,
  IncludesRelatedModels,
} from '@palmares/databases';

import {
  ModelCtor,
  Model,
  Attributes,
  WhereOptions,
  CreationAttributes,
  // eslint-disable-next-line import/no-unresolved
} from 'sequelize/types';
// eslint-disable-next-line import/no-unresolved
import { Col, Fn, Literal } from 'sequelize/types/utils';

export default class SequelizeEngineQuery extends EngineQuery {
  async get<
    M extends TModel,
    I extends readonly ReturnType<typeof models.Model>[] | undefined
  >(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    instance: ModelCtor<Model<ModelFields<M>>>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    args?: {
      includes?: I;
      search?: AllOptionalModelFields<M>;
    }
  ): Promise<IncludesRelatedModels<AllRequiredModelFields<M>, M, I>[]> {
    try {
      return instance.findAll({
        where: args?.search,
        raw: true,
      }) as unknown as Promise<
        IncludesRelatedModels<AllRequiredModelFields<M>, M, I>[]
      >;
    } catch {
      return [];
    }
  }

  async set<
    M extends TModel,
    S extends AllOptionalModelFields<M> | undefined | null = undefined
  >(
    instance: ModelCtor<Model<ModelFields<M>>>,
    data: S extends undefined ? ModelFields<M> : AllOptionalModelFields<M>,
    search?: S
  ): Promise<
    S extends undefined | null ? AllRequiredModelFields<M> | undefined : boolean
  > {
    type SequelizeModel = Model<ModelFields<M>>;
    type SequelizeAttributes = Attributes<SequelizeModel>;
    type UpdateValueType = {
      [key in keyof SequelizeAttributes]?:
        | SequelizeAttributes[key]
        | Fn
        | Col
        | Literal;
    };
    type SearchType = WhereOptions<SequelizeAttributes>;

    try {
      if (search) {
        await instance.update<Model<ModelFields<M>>>(data as UpdateValueType, {
          where: search as SearchType,
        });
        return true as S extends undefined | null
          ? AllRequiredModelFields<M> | undefined
          : boolean;
      }
      return (await instance.create(
        data as CreationAttributes<SequelizeModel>
      )) as unknown as S extends undefined | null
        ? AllRequiredModelFields<M> | undefined
        : boolean;
    } catch (e) {
      if (search) {
        return false as S extends undefined | null
          ? AllRequiredModelFields<M> | undefined
          : boolean;
      }
      return undefined as S extends undefined | null
        ? AllRequiredModelFields<M> | undefined
        : boolean;
    }
  }

  async remove<M extends TModel>(
    instance: ModelCtor<Model<ModelFields<M>>>,
    search?: AllOptionalModelFields<M>
  ): Promise<boolean> {
    try {
      await instance.destroy({
        where: search,
      });
      return true;
    } catch {
      return false;
    }
  }
}
