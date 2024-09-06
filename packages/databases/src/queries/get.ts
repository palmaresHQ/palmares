import { getResultsWithIncludes } from '.';
import { parseSearch } from './search';
import { NotImplementedAdapterException } from '../engine/exceptions';

import type { DatabaseAdapter } from '../engine';
import type { model } from '../models/model';
import type {
  FieldsOFModelType,
  FieldsOfModelOptionsType,
  Includes,
  ModelFieldsWithIncludes,
  OrderingOfModelsType
} from '../models/types';

export async function getQuery<
  TModel,
  TIncludes extends Includes = undefined,
  TFieldsOfModel extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TSearch extends
    | ModelFieldsWithIncludes<TModel, TIncludes, TFieldsOfModel, false, false, true, true>
    | undefined = undefined
>(
  args: {
    ordering?: OrderingOfModelsType<
      FieldsOfModelOptionsType<TModel> extends string ? FieldsOfModelOptionsType<TModel> : string
    >;
    /**
     * This object is used to specify if we should try to parse the data on input or output. Or both.
     * By default we always parse the data.
     *
     * What is parsing the data? It's guaranteeing that the data is in the right format that you expect. Like on Prisma,
     * a decimal might be Decimal.js, but on palmares, we try to guarantee it's always a number.
     * By default we loop through the data retrieved and we parse it to the right format. Some fields can implement
     * their parser, others might not. The problem is that we will always loop through the fields so it can bring some
     * performance issues.
     */
    useParsers?: boolean;
    limit?: number;
    offset?: number | string;
    fields?: TFieldsOfModel;
    search?: TSearch;
  },
  internal: {
    model: TModel;
    engine: DatabaseAdapter;
    includes: TIncludes;
  }
): Promise<ModelFieldsWithIncludes<TModel, TIncludes, TFieldsOfModel>[]> {
  const modelInstanceAsModel = internal.model as InstanceType<ReturnType<typeof model>>;

  const result: ModelFieldsWithIncludes<TModel, TIncludes, TFieldsOfModel>[] = [];
  const selectedFields = (args.fields || Object.keys(modelInstanceAsModel.fields)) as TFieldsOfModel;
  const useParsers = {
    input: true,
    output: typeof args.useParsers === 'boolean' ? args.useParsers : true
  };
  let hasRun = false;
  if (internal.engine.query.get.queryDataNatively) {
    const modelConstructor = modelInstanceAsModel.constructor as any;
    try {
      hasRun = true;
      return await internal.engine.query.get.queryDataNatively(
        internal.engine,
        modelConstructor,
        args.search,
        selectedFields as unknown as string[],
        internal.includes,
        async (modelInstance: InstanceType<ReturnType<typeof model>>, search: any) =>
          parseSearch(
            internal.engine,
            modelInstance,
            await modelConstructor.default.getInstance(internal.engine.connectionName),
            search
          )
      );
    } catch (e) {
      if ((e as Error).name === NotImplementedAdapterException.name) hasRun = false;
      else throw e;
    }
  }

  // eslint-disable-next-line ts/no-unnecessary-condition
  if (!hasRun) {
    await getResultsWithIncludes(
      internal.engine,
      internal.model,
      useParsers,
      selectedFields,
      internal.includes,
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
  }
  return result;
}
