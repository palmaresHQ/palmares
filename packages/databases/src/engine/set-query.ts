/* eslint-disable @typescript-eslint/no-unused-vars */
import { ForeignKeyField } from '../models/fields';
import model from '../models/model';
import {
  Includes,
  FieldsOFModelType,
  ModelFieldsWithIncludes,
} from '../models/types';
import type EngineQuery from './query';
/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 *
 * @param objects - Objects to merge
 * @returns  New object with merged key/values
 */
function mergeDeep(results: any[], data: any) {
  const isObject = (obj: any) => obj && typeof obj === 'object';

  for (const result of results) {
    for (const key in data) {
      const resultValue = result[key];
      const dataValue = data[key];
      /*if (Array.isArray(dataValue) || isObject(dataValue))
        result[key] = mergeDeep(
          Array.isArray(resultValue) ? resultValue : [resultValue],
          dataValue
        );*/
      result[key] = dataValue;
    }
  }
  return results;
}
export default class EngineSetQuery {
  engineQueryInstance: EngineQuery;

  constructor(engineQuery: EngineQuery) {
    this.engineQueryInstance = engineQuery;
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
    modelOfEngineInstance: any,
    search: any,
    fields?: readonly string[],
    data?: any,
    transaction?: any
  ): Promise<any[]> {
    console.log('queryData', data, modelOfEngineInstance, search);
    console.log('-----------------------');
    return data.map((eachData: any) => ({ ...eachData }));
  }

  async #resultsFromRelatedModelWithSearch(
    relatedField: ForeignKeyField,
    modelInstance: InstanceType<ReturnType<typeof model>>,
    includedModelInstance: InstanceType<ReturnType<typeof model>>,
    includesOfModel: Includes,
    includesOfIncluded: Includes,
    fieldsOfModel: string[],
    fieldsOfIncludedModel: string[],
    searchForRelatedModel: any,
    search: any,
    results: any[],
    isDirectlyRelated: boolean,
    resultToMergeWithData = undefined as any,
    data = undefined as any,
    transaction = undefined
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
    const hasData = data !== undefined && data[relationName] !== undefined;
    const doesNotExistsRelatedValueForNextData =
      hasData && data[parentFieldName] === undefined;
    if (hasData) {
      if (doesNotExistsRelatedValueForNextData) {
        throw new Error('does not exist related value for next data');
      }
      const nextSearch = {
        ...searchForRelatedModel,
        [fieldNameOfRelationInIncludedModel]: data[parentFieldName],
      };
      console.log('aqui', (resultToMergeWithData || {})[relationName] || []);
      await this.#getResultsWithIncludes(
        includedModelInstance,
        fieldsOfIncludedModelWithFieldsFromRelation,
        includesOfIncluded,
        nextSearch,
        resultOfIncludes,
        resultToMergeWithData[relationName],
        data
          ? {
              ...(resultToMergeWithData[relationName] || {}),
              ...data[relationName],
            }
          : undefined,
        transaction
      );
    } else {
      await this.#getResultsWithIncludes(
        includedModelInstance,
        fieldsOfIncludedModelWithFieldsFromRelation,
        includesOfIncluded,
        searchForRelatedModel,
        resultOfIncludes,
        undefined,
        transaction
      );
    }

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
        if (!doesNotExistsRelatedValueForNextData)
          await this.#getResultsWithIncludes(
            modelInstance,
            fieldsOfModel,
            includesOfModel,
            nextSearch,
            results,
            data,
            transaction
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
    fieldsOfModel: string[],
    fieldsOfIncludedModel: string[],
    search: any,
    results: any[],
    isDirectlyRelated: boolean,
    resultToMergeWithData = undefined as any,
    data: any = undefined,
    transaction = undefined
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
    console.log(search);
    await this.#getResultsWithIncludes(
      modelInstance,
      fieldsOfModelWithFieldsFromRelations,
      includesOfModel,
      { ...search, ...resultToMergeWithData },
      results,
      resultToMergeWithData,
      { ...resultToMergeWithData, ...data },
      transaction
    );

    const isCreatingOrUpdating = data !== undefined;
    const allOfTheResultsToFetch = isCreatingOrUpdating
      ? [results[results.length - 1]]
      : results;

    for (const result of allOfTheResultsToFetch) {
      const resultOfIncludes: any[] = [];
      const uniqueFieldValueOnRelation = result[parentFieldName];
      console.log(search, relationName);
      const nextSearch = {
        ...(search || {})[relationName],
        [fieldNameOfRelationInIncludedModel]: uniqueFieldValueOnRelation,
      };
      if (isCreatingOrUpdating) {
        const resultToMergeWithDataToAdd =
          resultToMergeWithData !== undefined
            ? resultToMergeWithData[relationName]
            : undefined;
        const dataToAdd = data[relationName];

        await this.#getResultsWithIncludes(
          includedModelInstance,
          fieldsOfIncludedModel,
          includesOfIncluded,
          nextSearch,
          resultOfIncludes,
          resultToMergeWithDataToAdd,
          dataToAdd,
          transaction
        );
      } else {
        await this.#getResultsWithIncludes(
          includedModelInstance,
          fieldsOfIncludedModel,
          includesOfIncluded,
          nextSearch,
          resultOfIncludes,
          undefined,
          undefined,
          transaction
        );
      }

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
   * Indirectly related models are relations that does not exist on the parent model by itself. What?
   *
   * For example, if we have two models: `User` and `Post`, if Post has the field `userId` and is directly connected to User.
   * There is no way for the `User` model to know that `Post` is related to it, so we need to access the Post model and get the reference.
   *
   * The problem here relies when there is a search statement for the included model.
   *
   * By default we first retrieve the results from the parent model, after that we retrieve the values from the children. But with search we
   * should first retrieve the children data, and just after that we should retrieve the parent data. Because of that everything should work recursively.
   *
   * Another problem relies on the fields, we do need the fields of the relation on the model, for example, if the user just wants to retrieve the `firstName` field
   * from the `User` model, we still might need the `id` field so we can use this value in the relation, because of that we will always add the field of the relation
   * on the actual query.
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
          FieldsOFModelType<TModel>,
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
    resultToMergeWithData = undefined as TData | undefined,
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

      if (
        foreignKeyFieldRelatedToModel &&
        searchForRelatedModel &&
        data === undefined
      ) {
        await this.#resultsFromRelatedModelWithSearch(
          foreignKeyFieldRelatedToModel,
          modelInstance,
          includedModelInstance,
          includesOfModel,
          includesOfIncluded,
          fieldsOfModel as unknown as string[],
          fieldsOfIncludedModel as unknown as string[],
          searchForRelatedModel,
          search,
          results,
          false,
          resultToMergeWithData,
          data,
          transaction
        );
      } else if (foreignKeyFieldRelatedToModel) {
        await this.#resultsFromRelatedModelsWithoutSearch(
          foreignKeyFieldRelatedToModel,
          modelInstance,
          includedModelInstance,
          includesOfModel,
          includesOfIncluded,
          fieldsOfModel as unknown as string[],
          fieldsOfIncludedModel as unknown as string[],
          search,
          results,
          false,
          resultToMergeWithData,
          data,
          transaction
        );
      }
    }
  }

  async #getResultsWithIncludes<
    TModel extends InstanceType<ReturnType<typeof model>>,
    TFields extends FieldsOFModelType<TModel> = readonly (keyof TModel['fields'])[],
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
    resultsToMergeWithData = undefined as TData,
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
                fields as readonly string[],
                search as TSearch,
                result,
                isDirectlyRelatedModel,
                resultToMergeWithData,
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
                fields as readonly string[],
                search as TSearch,
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
            fields as readonly string[],
            search as TSearch,
            result,
            isDirectlyRelatedModel,
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
          fields as readonly string[],
          await this.engineQueryInstance.parseData(modelInstance, data),
          transaction
        ))
      );
    }
  }

  async run<
    TModel extends InstanceType<ReturnType<typeof model>>,
    TIncludes extends Includes<true> = undefined,
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

    const getResults = async (transaction: any) => {
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
        await this.#getResultsWithIncludes(
          internal.model,
          fields,
          internal.includes,
          args.search as TSearch,
          results,
          (allResultsOfSearch.length > 0
            ? allResultsOfSearch
            : undefined) as TData,
          data as TData,
          transaction
        );
        return results;
      } else {
        await this.#getResultsWithIncludes(
          internal.model,
          fields,
          internal.includes,
          args.search as TSearch,
          results,
          undefined,
          data as TData,
          transaction
        );
        return results;
      }
    };

    if (isToUseTransaction)
      return this.engineQueryInstance.engineInstance.transaction(
        async (transaction) => await getResults(transaction)
      );
    else return getResults(undefined);
  }
}
