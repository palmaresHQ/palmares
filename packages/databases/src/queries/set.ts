import model from '../models/model';
import getResultsWithIncludes from '.';
import Transaction from '../transaction';
import getQuery from './get';

import type Engine from '../engine';
import type { Includes, ModelFieldsWithIncludes, FieldsOFModelType } from '../models/types';

export default async function setQuery<
  TModel,
  TIncludes extends Includes = undefined,
  TSearch extends
    | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>, false, false, true, true>
    | undefined = undefined,
>(
  data: ModelFieldsWithIncludes<
    TModel,
    TIncludes,
    FieldsOFModelType<TModel>,
    true,
    false,
    TSearch extends undefined ? false : true,
    false
  >[],
  args: {
    isToPreventEvents?: boolean;
    usePalmaresTransaction?: boolean;
    /**
     * This object is used to specify if we should try to parse the data on input or output. Or both.
     * By default we always parse the data.
     *
     * What is parsing the data? It's guaranteeing that the data is in the right format that you expect. Like on Prisma, a decimal might be Decimal.js, but on palmares, we try
     * to guarantee it's always a number.
     * By default we loop through the data retrieved and we parse it to the right format. Some fields can implement their parser, others might not.
     * The problem is that we will always loop through the fields so it can bring some performance issues.
     */
    useParsers?: {
      input?: boolean;
      output?: boolean;
    };
    useTransaction?: boolean;
    search?: TSearch;
  },
  internal: {
    engine: Engine;
    transaction?: any;
    model: TModel;
    includes: TIncludes;
  }
): Promise<ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>[]> {
  type TData = ModelFieldsWithIncludes<
    TModel,
    TIncludes,
    FieldsOFModelType<TModel>,
    true,
    false,
    TSearch extends undefined ? false : true,
    false
  >[];

  const isUseTransactionDefined = typeof args.useTransaction === 'boolean' ? args.useTransaction : true;
  const isTransactionNeededForQuery =
    data.length > 1 || (internal.includes !== undefined && internal.includes.length > 0);
  const isToUseTransaction =
    isUseTransactionDefined && isTransactionNeededForQuery && internal.transaction === undefined ? true : false;
  const palmaresTransaction = args.usePalmaresTransaction ? new Transaction('set') : undefined;

  // used to retrieve the results of the query, we separate this in a function so
  // we can use it in the transaction and outside of it
  async function getResults(transaction: any) {
    const results = [] as ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>[];
    const internalModelAsModel = internal.model as InstanceType<ReturnType<typeof model>>;
    const fields = Object.keys(internalModelAsModel.fields) as unknown as FieldsOFModelType<TModel>;
    const doesSearchExist = args.search !== undefined;
    const useParsers = {
      input: typeof args.useParsers?.input === 'boolean' ? args.useParsers.input : true,
      output: typeof args.useParsers?.output === 'boolean' ? args.useParsers.output : true,
    };

    if (doesSearchExist) {
      const allResultsOfSearch = await getQuery<TModel, TIncludes, FieldsOFModelType<TModel>, TSearch>(
        {
          fields: fields,
          search: args.search as TSearch,
        },
        {
          model: internal.model,
          engine: internal.engine,
          includes: internal.includes,
        }
      );
      await getResultsWithIncludes(
        internal.engine,
        internal.model,
        useParsers,
        fields,
        internal.includes,
        args.search as TSearch,
        results,
        internal.engine.query.set.queryData.bind(internal.engine.query.set),
        true,
        true,
        undefined,
        undefined,
        undefined,
        false,
        (allResultsOfSearch.length > 0 ? allResultsOfSearch : undefined) as ModelFieldsWithIncludes<
          TModel,
          TIncludes,
          FieldsOFModelType<TModel>
        >,
        data as TData,
        args.isToPreventEvents,
        transaction,
        palmaresTransaction
      );
    } else {
      await getResultsWithIncludes(
        internal.engine,
        internal.model,
        useParsers,
        fields,
        internal.includes,
        args.search as TSearch,
        results,
        internal.engine.query.set.queryData.bind(internal.engine.query.set),
        true,
        false,
        undefined,
        undefined,
        undefined,
        false,
        undefined,
        data as TData,
        args.isToPreventEvents,
        transaction,
        palmaresTransaction
      );
    }
    return results;
  }
  try {
    if (isToUseTransaction) {
      return internal.engine.transaction(async (transaction) => getResults(transaction));
    } else return getResults(internal.transaction);
  } catch (error) {
    if (palmaresTransaction) {
      palmaresTransaction.rollback();
      return [];
    } else throw error;
  }
}
