import model from '../models/model';
import getResultsWithIncludes from '.';
import Transaction from '../transaction';

import type Engine from '../engine';
import type { Includes, ModelFieldsWithIncludes, FieldsOFModelType } from '../models/types';

export default async function removeQuery<
  TModel,
  TIncludes extends Includes = undefined,
  TSearch extends
    | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>, false, false, true, true>
    | undefined = undefined,
>(
  args: {
    isToPreventEvents?: boolean;
    /**
     * This object is used to specify if we should try to parse the data on input or output. Or both.
     * By default we always parse the data.
     *
     * What is parsing the data? It's guaranteeing that the data is in the right format that you expect. Like on Prisma, a decimal might be Decimal.js, but on palmares, we try
     * to guarantee it's always a number.
     * By default we loop through the data retrieved and we parse it to the right format. Some fields can implement their parser, others might not.
     * The problem is that we will always loop through the fields so it can bring some performance issues.
     */
    useParsers?: boolean;
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
    const internalModelAsModel = internal.model as InstanceType<ReturnType<typeof model>>;
    const selectedFields = Object.keys(internalModelAsModel.fields) as unknown as FieldsOFModelType<TModel>;
    const useParsers = {
      input: true,
      output: typeof args.useParsers === 'boolean' ? args.useParsers : true,
    };

    await getResultsWithIncludes(
      internal.engine,
      internal.model as TModel,
      useParsers,
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
