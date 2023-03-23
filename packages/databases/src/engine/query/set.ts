/* eslint-disable @typescript-eslint/no-unused-vars */
import model from '../../models/model';
import {
  Includes,
  FieldsOFModelType,
  ModelFieldsWithIncludes,
} from '../../models/types';
import type EngineQuery from '.';
import Transaction from '../../transaction';

export default class EngineSetQuery {
  engineQueryInstance: EngineQuery;

  constructor(engineQuery: EngineQuery) {
    this.engineQueryInstance = engineQuery;
  }

  /**
   * This is a simple query, by default you should always implement this function in your EngineGetQuery.
   *
   * This will guarantee that you are able to retrieve the data, it's not much performatic because it will do
   * many small queries to the database, which might slow things down, but you will be guaranteed to work 100%
   * with the types.
   *
   * For a more performatic approach you should implement `queryDataNatively`. That will translate the query to the
   * native query, but the second can be harder to implement since it relies on knowing about palmares objects and
   * model structure.
   *
   * @param modelConstructor - The model instance to query.
   * @param search - The search argument to search on the database.
   * @param fields - The fields to be included in the search and the output.
   */
  async queryData(args: {
    modelOfEngineInstance: any;
    search: any;
    data: any;
    transaction?: any;
  }): Promise<[boolean, any][]> {
    return args.data.map((eachData: any) => [true, { ...eachData }]);
  }

  async run<
    TModel extends InstanceType<ReturnType<typeof model>>,
    TIncludes extends Includes = undefined,
    TSearch extends
      | ModelFieldsWithIncludes<
          TModel,
          TIncludes,
          FieldsOFModelType<TModel>,
          false,
          false,
          true,
          true
        >
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
      transaction?: any;
      model: TModel;
      includes: TIncludes;
    }
  ): Promise<
    ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>[]
  > {
    type TData = ModelFieldsWithIncludes<
      TModel,
      TIncludes,
      FieldsOFModelType<TModel>,
      true,
      false,
      TSearch extends undefined ? false : true,
      false
    >[];

    const isUseTransactionDefined =
      typeof args.useTransaction === 'boolean' ? args.useTransaction : true;
    const isTransactionNeededForQuery =
      data.length > 1 ||
      (internal.includes !== undefined && internal.includes.length > 0);
    const isToUseTransaction =
      isUseTransactionDefined && isTransactionNeededForQuery ? true : false;
    const palmaresTransaction = args.usePalmaresTransaction
      ? new Transaction('set')
      : undefined;

    // used to retrieve the results of the query, we separate this in a function so
    // we can use it in the transaction and outside of it
    async function getResults(this: EngineSetQuery, transaction: any) {
      const results = [] as ModelFieldsWithIncludes<
        TModel,
        TIncludes,
        FieldsOFModelType<TModel>
      >[];
      const fields = Object.keys(internal.model.fields);
      const doesSearchExist = args.search !== undefined;
      if (doesSearchExist) {
        const allResultsOfSearch = await this.engineQueryInstance.get.run<
          TModel,
          TIncludes,
          FieldsOFModelType<TModel>,
          TSearch
        >(
          {
            fields: fields,
            search: args.search as TSearch,
          },
          {
            model: internal.model,
            includes: internal.includes,
          }
        );
        await this.engineQueryInstance.getResultsWithIncludes(
          internal.model,
          fields as FieldsOFModelType<TModel>,
          internal.includes,
          args.search as TSearch,
          results,
          this.queryData.bind(this),
          true,
          true,
          undefined,
          undefined,
          undefined,
          false,
          (allResultsOfSearch.length > 0
            ? allResultsOfSearch
            : undefined) as ModelFieldsWithIncludes<
            TModel,
            TIncludes,
            FieldsOFModelType<TModel>
          >,
          data as TData,
          args.isToPreventEvents,
          transaction,
          palmaresTransaction
        );
        return results;
      } else {
        await this.engineQueryInstance.getResultsWithIncludes(
          internal.model,
          fields as FieldsOFModelType<TModel>,
          internal.includes,
          args.search as TSearch,
          results,
          this.queryData.bind(this),
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
        return results;
      }
    }
    try {
      if (isToUseTransaction) {
        return this.engineQueryInstance.engineInstance.transaction(
          async (transaction) => getResults.bind(this)(transaction)
        );
      } else return getResults.bind(this)(internal.transaction);
    } catch (error) {
      if (palmaresTransaction) {
        palmaresTransaction.rollback();
        return [];
      } else throw error;
    }
  }
}
