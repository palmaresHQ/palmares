/* eslint-disable @typescript-eslint/no-unused-vars */
import model from '../../models/model';

import type {
  Includes,
  ModelFieldsWithIncludes,
  FieldsOFModelType,
} from '../../models/types';
import type EngineQuery from '.';

export default class EngineRemoveQuery {
  engineQueryInstance: EngineQuery;

  constructor(engineQuery: EngineQuery) {
    this.engineQueryInstance = engineQuery;
  }

  /**
   * Should return the data removed from the database, this way we are able to revert the changes if something fails.
   *
   * @param modelOfEngineInstance - The model instance to query.
   */
  async queryData(args: {
    modelOfEngineInstance: any;
    search: any;
    shouldReturnData?: boolean;
    transaction?: any;
  }): Promise<any[]> {
    return [{}];
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
    args: {
      useTransaction?: boolean;
      search?: TSearch;
    },
    internal: {
      model: TModel;
      includes: TIncludes;
    }
  ): Promise<
    ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>[]
  > {
    const isToUseTransaction =
      typeof args.useTransaction === 'boolean' ? args.useTransaction : true;

    async function getResults(this: EngineRemoveQuery, transaction: any) {
      const results = [] as ModelFieldsWithIncludes<
        TModel,
        TIncludes,
        FieldsOFModelType<TModel>
      >[];
      const selectedFields = Object.keys(
        internal.model.fields
      ) as FieldsOFModelType<TModel>;

      await this.engineQueryInstance.getResultsWithIncludes(
        internal.model as TModel,
        selectedFields as FieldsOFModelType<TModel>,
        internal.includes as TIncludes,
        args.search as TSearch,
        results,
        this.queryData.bind(this),
        false,
        true,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        transaction
      );
      return results;
    }

    if (isToUseTransaction)
      return this.engineQueryInstance.engineInstance.transaction(
        async (transaction) => await getResults.bind(this)(transaction)
      );
    else return getResults.bind(this)(undefined);
  }
}
