import model from '../models/model';
import getResultsWithIncludes from '.';
import Transaction from '../transaction';
import getQuery from './get';

import type Engine from '../engine';
import type { Includes, ModelFieldsWithIncludes, FieldsOFModelType } from '../models/types';

export default async function setQuery<
  TModel extends InstanceType<ReturnType<typeof model>>,
  TIncludes extends Includes = undefined,
  TSearch extends
    | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>, false, false, true, true>
    | undefined = undefined
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
  const isToUseTransaction = isUseTransactionDefined && isTransactionNeededForQuery ? true : false;
  const palmaresTransaction = args.usePalmaresTransaction ? new Transaction('set') : undefined;

  // used to retrieve the results of the query, we separate this in a function so
  // we can use it in the transaction and outside of it
  async function getResults(transaction: any) {
    const results = [] as ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>[];
    const fields = Object.keys(internal.model.fields);
    const doesSearchExist = args.search !== undefined;
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
        fields as FieldsOFModelType<TModel>,
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
        fields as FieldsOFModelType<TModel>,
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
