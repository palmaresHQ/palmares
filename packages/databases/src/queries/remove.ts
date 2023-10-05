import model from '../models/model';
import getResultsWithIncludes from '.';
import Transaction from '../transaction';

import type Engine from '../engine';
import type { Includes, ModelFieldsWithIncludes, FieldsOFModelType } from '../models/types';

export default async function removeQuery<
  TModel extends InstanceType<ReturnType<typeof model>>,
  TIncludes extends Includes = undefined,
  TSearch extends
    | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>, false, false, true, true>
    | undefined = undefined
>(
  args: {
    isToPreventEvents?: boolean;
    usePalmaresTransaction?: boolean;
    useTransaction?: boolean;
    search?: TSearch;
    shouldRemove?: boolean;
  },
  internal: {
    model: TModel;
    includes: TIncludes;
    engine: Engine;
    transaction?: any;
  }
): Promise<ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>[]> {
  const palmaresTransaction = args.usePalmaresTransaction ? new Transaction('remove') : undefined;
  const shouldRemove = typeof args.shouldRemove === 'boolean' ? args.shouldRemove : true;
  const isToUseTransaction = typeof args.useTransaction === 'boolean' ? args.useTransaction : true;

  async function getResults(transaction: any) {
    const results = [] as ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>[];
    const selectedFields = Object.keys(internal.model.fields) as FieldsOFModelType<TModel>;

    await getResultsWithIncludes(
      internal.engine,
      internal.model as TModel,
      selectedFields as FieldsOFModelType<TModel>,
      internal.includes as TIncludes,
      args.search as TSearch,
      results,
      internal.engine.query.remove.queryData.bind(internal.engine.query.remove),
      false,
      true,
      undefined,
      undefined,
      undefined,
      shouldRemove,
      undefined,
      undefined,
      args.isToPreventEvents,
      transaction,
      palmaresTransaction
    );
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
