/* eslint-disable @typescript-eslint/no-unused-vars */
import model from '../models/model';
import { NotImplementedEngineException } from '../engine/exceptions';
import getResultsWithIncludes from '.';

import type { Narrow } from '@palmares/core';
import type Engine from '../engine';
import type {
  Includes,
  ModelFieldsWithIncludes,
  FieldsOFModelType,
  OrderingOfModelsType,
  FieldsOfModelOptionsType,
} from '../models/types';
import { BaseModel, Model } from '../models';
import parseSearch from './search';

export default async function getQuery<
  TModel,
  TIncludes extends Includes = undefined,
  TFieldsOfModel extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TSearch extends
    | ModelFieldsWithIncludes<TModel, TIncludes, TFieldsOfModel, false, false, true, true>
    | undefined = undefined,
>(
  args: {
    ordering?: OrderingOfModelsType<
      FieldsOfModelOptionsType<TModel> extends string ? FieldsOfModelOptionsType<TModel> : string
    >;
    limit?: number;
    offset?: number | string;
    fields?: TFieldsOfModel;
    search?: TSearch;
  },
  internal: {
    model: TModel;
    engine: Engine;
    includes: TIncludes;
  }
): Promise<ModelFieldsWithIncludes<TModel, TIncludes, TFieldsOfModel>[]> {
  const modelInstanceAsModel = internal.model as InstanceType<ReturnType<typeof model>>;

  const result: ModelFieldsWithIncludes<TModel, TIncludes, TFieldsOfModel>[] = [];
  const selectedFields = (args.fields || Object.keys(modelInstanceAsModel.fields)) as TFieldsOfModel;
  try {
    return await internal.engine.query.get.queryDataNatively(
      internal.engine,
      modelInstanceAsModel.constructor as ReturnType<typeof model>,
      args.search,
      selectedFields as unknown as string[],
      internal.includes,
      async (modelInstance: InstanceType<ReturnType<typeof model>>, search: any) =>
        parseSearch(internal.engine, modelInstance, search)
    );
  } catch (e) {
    if ((e as Error).name === NotImplementedEngineException.name)
      await getResultsWithIncludes(
        internal.engine,
        internal.model as TModel,
        selectedFields as TFieldsOfModel,
        internal.includes as TIncludes,
        args.search as TSearch,
        result,
        internal.engine.query.get.queryData.bind(internal.engine.query.get),
        false,
        false,
        args.ordering,
        args.limit,
        args.offset,
        undefined,
        undefined,
        undefined
      );
    else throw e;
  }
  return result;
}
