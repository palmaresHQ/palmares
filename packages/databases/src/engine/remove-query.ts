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
  async queryData(
    modelOfEngineInstance: any,
    search: any,
    fields?: readonly string[],
    data = undefined,
    transaction?: any
  ): Promise<any[]> {
    return [];
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
  ): Promise<void> {
    const selectedFields = Object.keys(
      internal.model.fields
    ) as FieldsOFModelType<TModel>;
    await this.engineQueryInstance.getResultsWithIncludes(
      internal.model as TModel,
      selectedFields as FieldsOFModelType<TModel>,
      internal.includes as TIncludes,
      args.search as TSearch,
      [],
      this.queryData.bind(this),
      false,
      false,
      undefined,
      undefined,
      undefined
    );

    return;
  }
}
