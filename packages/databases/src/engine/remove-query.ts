/* eslint-disable @typescript-eslint/no-unused-vars */
import model from '../models/model';

import type {
  Includes,
  ModelFieldsWithIncludes,
  FieldsOFModelType,
} from '../models/types';
import type EngineQuery from './query';

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
    const selectedFields = Object.keys(
      internal.model.fields
    ) as FieldsOFModelType<TModel>;
    const results = [] as ModelFieldsWithIncludes<
      TModel,
      TIncludes,
      FieldsOFModelType<TModel>
    >[];
    try {
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
        undefined
      );
    } catch (error) {
      if (args.useTransaction) {
        console.log('remove-query', results);
        await this.engineQueryInstance.set.run(
          results as any,
          {
            useTransaction: true,
          },
          {
            model: internal.model,
            includes: internal.includes,
          }
        );
        return [] as ModelFieldsWithIncludes<
          TModel,
          TIncludes,
          FieldsOFModelType<TModel>
        >[];
      } else throw error;
    }

    return results;
  }
}
