/* eslint-disable @typescript-eslint/no-unused-vars */
import model from '../models/model';
import type EngineQuery from './query';
import type {
  Includes,
  ModelFieldsWithIncludes,
  FieldsOFModelType,
} from '../models/types';
import { ForeignKeyField } from '../models/fields';
import { NotImplementedEngineException } from './exceptions';

/** This class is used to run `.get` queries, so when we want to retrieve a value from the database to the user. */
export default class EngineGetQuery {
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
  async queryData(
    modelConstructor: any,
    search: any,
    fields?: readonly string[]
  ): Promise<any[]> {
    return [];
  }

  async queryDataNatively(
    modelConstructor: ReturnType<typeof model>,
    search: any,
    fields: readonly string[],
    includes: Includes
  ): Promise<any[]> {
    throw new NotImplementedEngineException('queryDataNatively');
  }

  getFieldNameOfRelationInIncludedModelRelationNameAndParentFieldName<
    TToField extends string,
    TRelatedName extends string,
    TRelationName extends string,
    TIsDirectlyRelated extends boolean | undefined = undefined
  >(
    relatedField: ForeignKeyField<
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      TToField,
      TRelatedName,
      TRelationName
    >,
    isDirectlyRelated?: TIsDirectlyRelated
  ): {
    relationName: TIsDirectlyRelated extends true
      ? TRelationName
      : TRelatedName;
    parentFieldName: TIsDirectlyRelated extends true ? string : TToField;
    fieldNameOfRelationInIncludedModel: TIsDirectlyRelated extends true
      ? TToField
      : string;
  } {
    return {
      relationName: (isDirectlyRelated
        ? relatedField.relationName
        : relatedField.relatedName) as TIsDirectlyRelated extends true
        ? TRelationName
        : TRelatedName,
      parentFieldName: (isDirectlyRelated
        ? relatedField.fieldName
        : relatedField.toField) as TIsDirectlyRelated extends true
        ? string
        : TToField,
      fieldNameOfRelationInIncludedModel: (isDirectlyRelated
        ? relatedField.toField
        : relatedField.fieldName) as TIsDirectlyRelated extends true
        ? TToField
        : string,
    };
  }

  async #resultsFromRelatedModelWithSearch(
    relatedField: ForeignKeyField<
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any
    >,
    modelInstance: InstanceType<ReturnType<typeof model>>,
    includedModelInstance: InstanceType<ReturnType<typeof model>>,
    includesOfModel: Includes,
    includesOfIncluded: Includes,
    fieldsOfModel: readonly string[],
    fieldsOfIncludedModel: readonly string[],
    searchForRelatedModel: any,
    search: any,
    results: any[],
    isDirectlyRelated = false
  ) {
    const {
      relationName,
      parentFieldName,
      fieldNameOfRelationInIncludedModel,
    } = this.getFieldNameOfRelationInIncludedModelRelationNameAndParentFieldName(
      relatedField,
      isDirectlyRelated
    );

    const resultOfIncludes: any[] = [];
    const [hasIncludedField, fieldsOfIncludedModelWithFieldsFromRelation] =
      fieldsOfIncludedModel.includes(fieldNameOfRelationInIncludedModel)
        ? [false, fieldsOfIncludedModel]
        : [
            true,
            fieldsOfIncludedModel.concat([fieldNameOfRelationInIncludedModel]),
          ];

    await this.#getResultsWithIncludes(
      includedModelInstance,
      fieldsOfIncludedModelWithFieldsFromRelation,
      includesOfIncluded,
      await this.engineQueryInstance.parseSearch(
        includedModelInstance,
        searchForRelatedModel
      ),
      resultOfIncludes
    );
    const resultByUniqueFieldValue: Record<string, any[]> = {};

    for (const result of resultOfIncludes) {
      const uniqueFieldValueOnRelation =
        result[fieldNameOfRelationInIncludedModel];

      if (hasIncludedField) delete result[fieldNameOfRelationInIncludedModel];

      const existsValueForUniqueFieldValueOnResults =
        resultByUniqueFieldValue[uniqueFieldValueOnRelation] !== undefined;

      if (existsValueForUniqueFieldValueOnResults) {
        resultByUniqueFieldValue[uniqueFieldValueOnRelation].push(result);
      } else {
        const nextSearch = {
          [parentFieldName]: uniqueFieldValueOnRelation,
          ...search,
        };
        await this.#getResultsWithIncludes(
          modelInstance,
          fieldsOfModel,
          includesOfModel,
          await this.engineQueryInstance.parseSearch(modelInstance, nextSearch),
          results
        );

        resultByUniqueFieldValue[uniqueFieldValueOnRelation] = [result];
        results[results.length - 1][relationName] =
          relatedField.unique || isDirectlyRelated
            ? resultByUniqueFieldValue[uniqueFieldValueOnRelation][0]
            : resultByUniqueFieldValue[uniqueFieldValueOnRelation];
      }
    }
  }

  async #resultsFromRelatedModelsWithoutSearch(
    relatedField: ForeignKeyField,
    modelInstance: InstanceType<ReturnType<typeof model>>,
    includedModelInstance: InstanceType<ReturnType<typeof model>>,
    includesOfModel: Includes,
    includesOfIncluded: Includes,
    fieldsOfModel: readonly string[],
    fieldsOfIncludedModel: readonly string[],
    search: any,
    results: any[],
    isDirectlyRelated = false
  ) {
    const {
      relationName,
      parentFieldName,
      fieldNameOfRelationInIncludedModel,
    } = this.getFieldNameOfRelationInIncludedModelRelationNameAndParentFieldName(
      relatedField,
      isDirectlyRelated
    );
    // Get the results of the parent model and then get the results of the children (included) models
    const [hasIncludedField, fieldsOfModelWithFieldsFromRelations] =
      fieldsOfModel.includes(parentFieldName)
        ? [false, fieldsOfModel]
        : [true, fieldsOfModel.concat([parentFieldName])];

    await this.#getResultsWithIncludes(
      modelInstance,
      fieldsOfModelWithFieldsFromRelations,
      includesOfModel,
      search,
      results
    );
    for (const result of results) {
      const uniqueFieldValueOnRelation = result[parentFieldName];
      const nextSearch = {
        [fieldNameOfRelationInIncludedModel]: uniqueFieldValueOnRelation,
      };

      const resultOfIncludes: any[] = [];
      await this.#getResultsWithIncludes(
        includedModelInstance,
        fieldsOfIncludedModel,
        includesOfIncluded,
        nextSearch,
        resultOfIncludes
      );

      if (hasIncludedField) delete result[parentFieldName];
      result[relationName] =
        relatedField.unique || isDirectlyRelated
          ? resultOfIncludes[0]
          : resultOfIncludes;
    }
  }

  /**
   * Directly related models are relations that exist on the parent model by itself. What?
   *
   * For example, if we have two models: `User` and `Post`, if Post has the field `userId` and is directly connected to User.
   * a direct relation is the `user` existing in the `Post` model.
   *
   * This is basically the same as `#resultsFromIndirectlyRelatedModels` but just flipping the `toField` on the association to the
   * `relationName` to get the name of the associated field.
   *
   * @param modelInstance - The model instance of the parent (not the children)
   * @param includedModelInstance - The model instance of the included children.
   * @param includesOfModel - All of the other included models.
   * @param includesOfIncluded - All of the included models of the included model, this refers to the
   * includes inside of the included model.
   * @param fieldsOfIncludedModel - The fields accepted in the included model. On the included model, what fields
   * should be displayed
   * @param fieldsOfModel -The fields of the `modelInstance` (parent model).
   * @param search - The search arguments.
   * @param results - All of the fetched results.
   */
  async #resultsFromRelatedModels<
    TModel extends InstanceType<ReturnType<typeof model>>,
    TIncludedModel extends InstanceType<ReturnType<typeof model>>,
    TFields extends FieldsOFModelType<TModel> = readonly (keyof TModel['fields'])[],
    TFieldsOfIncluded extends FieldsOFModelType<TIncludedModel> = readonly (keyof TIncludedModel['fields'])[],
    TSearch extends
      | ModelFieldsWithIncludes<
          TModel,
          TIncludes,
          TFields,
          false,
          false,
          true,
          true
        >
      | undefined = undefined,
    TData extends
      | ModelFieldsWithIncludes<
          TModel,
          TIncludes,
          FieldsOFModelType<TModel>,
          true,
          false,
          TSearch extends undefined ? false : true,
          false
        >
      | undefined = undefined,
    TIncludes extends Includes<boolean> = Includes<
      TData extends undefined ? false : true
    >,
    TIncludesOfIncluded extends Includes<boolean> = Includes<
      TData extends undefined ? false : true
    >,
    TResult extends ModelFieldsWithIncludes<
      TModel,
      TIncludes,
      FieldsOFModelType<TModel>
    >[] = ModelFieldsWithIncludes<
      TModel,
      TIncludes,
      FieldsOFModelType<TModel>
    >[],
    TIsDirectlyRelated extends boolean = false
  >(
    modelInstance: TModel,
    includedModelInstance: TIncludedModel,
    includesOfModel: TIncludes,
    includesOfIncluded: TIncludesOfIncluded,
    fieldsOfIncludedModel: TFieldsOfIncluded,
    fieldsOfModel: TFields,
    search: TSearch,
    results: TResult,
    isDirectlyRelated: TIsDirectlyRelated,
    resultToMergeWithData = undefined as
      | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>
      | undefined,
    data = undefined as TData,
    transaction = undefined
  ) {
    const fieldToUseToGetRelationName = isDirectlyRelated
      ? 'relationName'
      : 'relatedName';
    const relatedNamesDirectlyOrIndirectlyRelatedToModel =
      (isDirectlyRelated
        ? modelInstance.directlyRelatedTo[includedModelInstance.originalName]
        : modelInstance.indirectlyRelatedTo[
            includedModelInstance.originalName
          ]) || [];

    const associationsOfIncludedModel =
      includedModelInstance.associations[modelInstance.originalName] || [];

    for (const relationNameOrRelatedName of relatedNamesDirectlyOrIndirectlyRelatedToModel) {
      const searchForRelatedModel:
        | ModelFieldsWithIncludes<
            TIncludedModel,
            TIncludesOfIncluded,
            FieldsOFModelType<TIncludedModel>,
            false,
            false,
            true,
            true
          >
        | undefined = search
        ? (search as any)[relationNameOrRelatedName]
        : undefined;
      const foreignKeyFieldRelatedToModel = associationsOfIncludedModel.find(
        (association) =>
          association[fieldToUseToGetRelationName] === relationNameOrRelatedName
      );

      if (foreignKeyFieldRelatedToModel && searchForRelatedModel) {
        await this.#resultsFromRelatedModelWithSearch(
          foreignKeyFieldRelatedToModel,
          modelInstance,
          includedModelInstance,
          includesOfModel,
          includesOfIncluded,
          fieldsOfModel as readonly string[],
          fieldsOfIncludedModel as readonly string[],
          searchForRelatedModel,
          search,
          results,
          isDirectlyRelated
        );
      } else if (foreignKeyFieldRelatedToModel) {
        await this.#resultsFromRelatedModelsWithoutSearch(
          foreignKeyFieldRelatedToModel,
          modelInstance,
          includedModelInstance,
          includesOfModel,
          includesOfIncluded,
          fieldsOfModel as readonly string[],
          fieldsOfIncludedModel as readonly string[],
          search,
          results,
          isDirectlyRelated
        );
      }
    }
  }

  // TODO: OLD Implementation
  /*async #getResultsWithIncludes(
    modelInstance: InstanceType<ReturnType<typeof model>>,
    fields: string[],
    includes: Includes,
    search: object,
    result: any[] = []
  ) {
    const safeIncludes = typeof includes !== 'undefined' ? includes : [];
    const hasIncludes = safeIncludes.length > 0;

    if (hasIncludes) {
      const include = safeIncludes[0];
      const includedModel = include.model.default.getModel(
        this.engineQueryInstance.engineInstance.databaseName
      );
      const allFieldsOfIncludedModel = Object.keys(includedModel['fields']);
      const isNotACircularReference =
        modelInstance.originalName !== includedModel.originalName;

      if (isNotACircularReference) {
        const isDirectlyRelatedModel =
          modelInstance.directlyRelatedTo[includedModel.originalName] !==
          undefined;
        const isIndirectlyRelatedModel =
          modelInstance.indirectlyRelatedTo[includedModel.originalName] !==
          undefined;

        if (isIndirectlyRelatedModel) {
          await this.#resultsFromIndirectlyRelatedModels(
            modelInstance,
            includedModel,
            safeIncludes.slice(1),
            include.includes,
            (include.fields as string[]) ||
              (allFieldsOfIncludedModel as string[]),
            fields,
            search,
            result
          );
        } else if (isDirectlyRelatedModel) {
          await this.#resultsFromDirectlyRelatedModels(
            modelInstance,
            includedModel,
            safeIncludes.slice(1),
            include.includes,
            (include.fields as string[]) ||
              (allFieldsOfIncludedModel as string[]),
            fields,
            search,
            result
          );
        }
      }
    } else {
      const modelConstructor = modelInstance.constructor as ReturnType<
        typeof model
      >;
      const translatedModelInstance =
        await modelConstructor.default.getInstance(
          this.engineQueryInstance.engineInstance.databaseName
        );
      result.push(
        ...(await this.queryData(translatedModelInstance, search, fields))
      );
    }
  }*/

  async #getResultsWithIncludes<
    TModel extends InstanceType<ReturnType<typeof model>>,
    TFields extends FieldsOFModelType<TModel> = readonly (keyof TModel['fields'])[],
    TSearch extends
      | ModelFieldsWithIncludes<
          TModel,
          TIncludes,
          TFields,
          false,
          false,
          true,
          true
        >
      | undefined = undefined,
    TData extends
      | ModelFieldsWithIncludes<
          TModel,
          TIncludes,
          FieldsOFModelType<TModel>,
          true,
          false,
          TSearch extends undefined ? false : true,
          false
        >[]
      | undefined = undefined,
    TIncludes extends Includes<boolean> = Includes<
      TData extends undefined ? false : true
    >,
    TResult extends ModelFieldsWithIncludes<
      TModel,
      TIncludes,
      FieldsOFModelType<TModel>
    >[] = ModelFieldsWithIncludes<
      TModel,
      TIncludes,
      FieldsOFModelType<TModel>
    >[]
  >(
    modelInstance: TModel,
    fields: TFields,
    includes: TIncludes,
    search: TSearch,
    result: TResult,
    resultsToMergeWithData = undefined as
      | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>
      | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>[]
      | undefined,
    data = undefined as TData,
    transaction = undefined
  ) {
    const safeIncludes: Includes =
      typeof includes !== 'undefined' ? includes : [];
    const hasIncludes = safeIncludes.length > 0;

    if (hasIncludes) {
      const include = safeIncludes[0];
      const includedModel = include.model.default.getModel(
        this.engineQueryInstance.engineInstance.databaseName
      );
      const allFieldsOfIncludedModel = Object.keys(includedModel['fields']);

      const isNotACircularReference =
        modelInstance.originalName !== includedModel.originalName;

      if (isNotACircularReference) {
        const isDirectlyRelatedModel =
          modelInstance.directlyRelatedTo[includedModel.originalName] !==
          undefined;

        const hasData =
          (typeof data === 'object' && data !== undefined) ||
          Array.isArray(data);

        if (hasData) {
          let allDataToAdd: TData = data;
          if (Array.isArray(data) === false) allDataToAdd = [data] as TData;

          const isResultsToMergeWithDataDefinedAndNotAnArray =
            resultsToMergeWithData !== undefined &&
            Array.isArray(resultsToMergeWithData);
          const resultsToMerge = isResultsToMergeWithDataDefinedAndNotAnArray
            ? (resultsToMergeWithData as TData)
            : ([resultsToMergeWithData] as unknown as TData);

          for (
            let indexOfDataToAdd = 0;
            indexOfDataToAdd < (allDataToAdd || []).length;
            indexOfDataToAdd++
          ) {
            const dataToAdd = (allDataToAdd || [])[indexOfDataToAdd];
            const resultToMergeWithData = (resultsToMerge || [])[
              indexOfDataToAdd
            ];
            if ((resultsToMerge || []).length > 0) {
              await this.#resultsFromRelatedModels(
                modelInstance,
                includedModel,
                safeIncludes.slice(1),
                include.includes,
                (include.fields as string[]) ||
                  (allFieldsOfIncludedModel as string[]),
                fields,
                search,
                result,
                isDirectlyRelatedModel,
                resultToMergeWithData as ModelFieldsWithIncludes<
                  TModel,
                  TIncludes,
                  FieldsOFModelType<TModel>
                >,
                dataToAdd,
                transaction
              );
            } else {
              await this.#resultsFromRelatedModels(
                modelInstance,
                includedModel,
                safeIncludes.slice(1),
                include.includes,
                (include.fields as string[]) ||
                  (allFieldsOfIncludedModel as string[]),
                fields,
                search,
                result,
                isDirectlyRelatedModel,
                undefined,
                dataToAdd,
                transaction
              );
            }
          }
        } else {
          await this.#resultsFromRelatedModels(
            modelInstance,
            includedModel,
            safeIncludes.slice(1),
            include.includes,
            (include.fields as string[]) ||
              (allFieldsOfIncludedModel as string[]),
            fields,
            search,
            result,
            isDirectlyRelatedModel,
            undefined,
            data as undefined,
            transaction
          );
        }
      }
    } else {
      const modelConstructor = modelInstance.constructor as ReturnType<
        typeof model
      >;
      const translatedModelInstance =
        await modelConstructor.default.getInstance(
          this.engineQueryInstance.engineInstance.databaseName
        );

      result.push(
        ...(await this.queryData(
          translatedModelInstance,
          await this.engineQueryInstance.parseSearch(modelInstance, search),
          fields as readonly string[]
          //await this.engineQueryInstance.parseData(modelInstance, data),
          //transaction
        ))
      );
    }
  }

  async run<
    TModel extends InstanceType<ReturnType<typeof model>>,
    TIncludes extends Includes = undefined,
    TFieldsOfModel extends FieldsOFModelType<
      InstanceType<ReturnType<typeof model>>
    > = readonly (keyof TModel['fields'])[],
    TSearch extends
      | ModelFieldsWithIncludes<
          TModel,
          TIncludes,
          TFieldsOfModel,
          false,
          false,
          true,
          true
        >
      | undefined = undefined
  >(
    args: {
      fields?: TFieldsOfModel;
      search?: TSearch;
    },
    internal: {
      model: TModel;
      includes: TIncludes;
    }
  ): Promise<ModelFieldsWithIncludes<TModel, TIncludes>[]> {
    const result: any[] = [];
    const selectedFields = (args.fields ||
      Object.keys(internal.model.fields)) as TFieldsOfModel;
    try {
      throw new NotImplementedEngineException('queryDataNatively');
      return await this.queryDataNatively(
        internal.model.constructor as ReturnType<typeof model>,
        args.search,
        selectedFields as unknown as string[],
        internal.includes
      );
    } catch (e) {
      if ((e as Error).name === NotImplementedEngineException.name)
        await this.#getResultsWithIncludes<
          TModel,
          TFieldsOfModel,
          TSearch,
          undefined,
          TIncludes,
          ModelFieldsWithIncludes<
            TModel,
            TIncludes,
            FieldsOFModelType<TModel>
          >[]
        >(
          internal.model,
          selectedFields,
          internal.includes,
          args.search as TSearch,
          result
        );
      else throw e;
    }
    return result as ModelFieldsWithIncludes<TModel, TIncludes>[];
  }
}
