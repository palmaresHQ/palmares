/* eslint-disable @typescript-eslint/no-unused-vars */
import Engine from '.';
import { ForeignKeyField } from '../models/fields';
import model from '../models/model';
import {
  Includes,
  ModelFieldsWithIncludes,
  FieldsOFModelType,
} from '../models/types';
import EngineGetQuery from './get-query';
import EngineSetQuery from './set-query';

type QueryDataFnType = (
  modelOfEngineInstance: any,
  search: any,
  fields?: readonly string[],
  data?: any,
  transaction?: any
) => Promise<any>;

/**
 * Offers >>>>BASIC<<<< querying functionalities, this enables us to create libs that works well on every
 * database engine without needing to specify a database engine. We usually advise AGAINST using this on
 * real projects since this is not really well optimized for many operations like joins, select only a bunch of fields
 * and so on.
 *
 * By default this will query for all of the fields in the database, so they are all non optimized. It's preferred
 * to use the engine directly for querying. Although this not advised this enables us to create functionalities
 * that can work well on every engine. This is also really easy to implement for people that want to create new
 * database engines. Besides that something that it enable us is to create distributed databases, that are
 * in multiple servers
 *
 * The basic methods `get`, `set` and `remove` have the API idea taken of the browser's `localhost` and also
 * from `redis`. This guarantees this can work on most kind of databases without issues.
 */
export default class EngineQuery {
  engineInstance: Engine;
  get: EngineGetQuery;
  set: EngineSetQuery;

  constructor(
    engineInstance: Engine,
    engineGetQuery: typeof EngineGetQuery,
    engineSetQuery: typeof EngineSetQuery
  ) {
    this.engineInstance = engineInstance;
    this.get = new engineGetQuery(this);
    this.set = new engineSetQuery(this);
  }

  /**
   * Retrieve the model instance so we can query from it from the default manager.
   *
   * @param modelToRetrieve - The model to retrieve the instance from.
   */
  getModelInstance(modelToRetrieve: ReturnType<typeof model>) {
    return (modelToRetrieve.constructor as any).default.getInstance(
      this.engineInstance.databaseName
    );
  }

  /**
   * The search parser is used to parse the search that we will use to query the database, with this we are able to remove the fields
   * that are not in the model, and also translate queries like `in`, `not in` and so on
   *
   * @param modelInstance - The model instance to use to parse the search.
   * @param search - The search to parse.
   *
   * @returns The parsed search, translated to the database engine so we can make a query.
   */
  async parseSearch(
    modelInstance: InstanceType<ReturnType<typeof model>>,
    search: any
  ) {
    if (search) {
      const fieldsInModelInstance = Object.keys(modelInstance.fields);
      const fieldsInSearch = Object.keys(search);

      const formattedSearch: Record<string, any> = {};
      for (const key of fieldsInSearch) {
        if (fieldsInModelInstance.includes(key)) {
          formattedSearch[key] = search[key];
        }
      }
      return formattedSearch;
    }
    return {};
  }

  /**
   * The data parser is used to parse the data that we will use to save it to the database.
   */
  async parseData(
    modelInstance: InstanceType<ReturnType<typeof model>>,
    data: any
  ) {
    if (data) {
      const dataAsArray = Array.isArray(data) ? data : [data];
      const formattedData = dataAsArray.map((eachDataToFormat) => {
        const fieldsInModelInstance = Object.keys(modelInstance.fields);
        const fieldsInData = Object.keys(eachDataToFormat);

        const formattedData: Record<string, any> = {};
        for (const key of fieldsInData) {
          if (fieldsInModelInstance.includes(key)) {
            formattedData[key] = eachDataToFormat[key];
          }
        }
        return formattedData;
      });
      return formattedData;
    }
    return undefined;
  }

  /**
   * This is used to get the field names of the relation. If we are working on a direct relation
   * or an indirect relation we should behave differently.
   *
   * For a direct related model, the relation name is the relation name, and for an indirect related model
   * the relation name is the related name (related names are used to define the relation name on the parent model,
   * in other words, if the relation is between Post and User and the post has a postId foreign key with
   * the related name userPosts, when we are fetching the user model data we can fetch all of the userPosts (posts)
   * tied to it)
   * We also change other values like `parentFieldName` that refers to the field name of the parent model
   * and `fieldNameOfRelationInIncludedModel` that refers to the field name of the relation in the included model.
   *
   * @param relatedField - The related field to get the field names of the relation.
   * @param isDirectlyRelated - If the related field is directly related or not.
   */
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

  async #resultsFromRelatedModelWithSearch<
    TRelatedField extends ForeignKeyField,
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
    TSearchOfIncluded extends
      | ModelFieldsWithIncludes<
          TIncludedModel,
          TIncludesOfIncludes,
          TFieldsOfIncluded,
          false,
          false,
          true,
          true
        >
      | undefined = undefined,
    TIncludes extends Includes<boolean> = Includes<false>,
    TIncludesOfIncludes extends Includes<boolean> = Includes<false>,
    TResult extends ModelFieldsWithIncludes<
      TModel,
      TIncludes,
      TFields
    >[] = ModelFieldsWithIncludes<TModel, TIncludes, TFields>[]
  >(
    relatedField: TRelatedField,
    modelInstance: TModel,
    includedModelInstance: TIncludedModel,
    includesOfModel: TIncludes,
    includesOfIncluded: TIncludesOfIncludes,
    fieldsOfModel: TFields,
    fieldsOfIncludedModel: TFieldsOfIncluded,
    searchForRelatedModel: TSearchOfIncluded,
    search: TSearch,
    results: TResult,
    isDirectlyRelated = false,
    queryData: QueryDataFnType,
    isSetOperation = false,
    isToReturnResults = true
  ) {
    const {
      relationName,
      parentFieldName,
      fieldNameOfRelationInIncludedModel,
    } = this.getFieldNameOfRelationInIncludedModelRelationNameAndParentFieldName(
      relatedField,
      isDirectlyRelated
    );

    const resultOfIncludes: ModelFieldsWithIncludes<
      TIncludedModel,
      TIncludesOfIncludes,
      TFieldsOfIncluded
    >[] = [];
    const [hasIncludedField, fieldsOfIncludedModelWithFieldsFromRelation] =
      fieldsOfIncludedModel.includes(fieldNameOfRelationInIncludedModel)
        ? [false, fieldsOfIncludedModel]
        : [
            true,
            fieldsOfIncludedModel.concat([fieldNameOfRelationInIncludedModel]),
          ];

    await this.getResultsWithIncludes(
      includedModelInstance as TIncludedModel,
      fieldsOfIncludedModelWithFieldsFromRelation as TFieldsOfIncluded,
      includesOfIncluded as TIncludesOfIncludes,
      searchForRelatedModel,
      resultOfIncludes,
      queryData,
      isSetOperation,
      isToReturnResults,
      undefined,
      undefined,
      undefined
    );
    const resultByUniqueFieldValue: Record<string, any[]> = {};

    for (const result of resultOfIncludes) {
      const uniqueFieldValueOnRelation = (result as any)[
        fieldNameOfRelationInIncludedModel
      ];

      if (hasIncludedField)
        delete (result as any)[fieldNameOfRelationInIncludedModel];

      const existsValueForUniqueFieldValueOnResults =
        resultByUniqueFieldValue[uniqueFieldValueOnRelation] !== undefined;

      if (existsValueForUniqueFieldValueOnResults) {
        resultByUniqueFieldValue[uniqueFieldValueOnRelation].push(result);
      } else {
        const nextSearch = {
          [parentFieldName]: uniqueFieldValueOnRelation,
          ...search,
        };

        await this.getResultsWithIncludes(
          modelInstance as TModel,
          fieldsOfModel as TFields,
          includesOfModel as TIncludes,
          nextSearch,
          results,
          queryData,
          isSetOperation,
          isToReturnResults,
          undefined,
          undefined,
          undefined
        );

        resultByUniqueFieldValue[uniqueFieldValueOnRelation] = [result];

        (results as any)[results.length - 1][relationName] =
          relatedField.unique || isDirectlyRelated
            ? resultByUniqueFieldValue[uniqueFieldValueOnRelation][0]
            : resultByUniqueFieldValue[uniqueFieldValueOnRelation];
      }
    }
  }

  async #resultsFromRelatedModelsWithoutSearch<
    TRelatedField extends ForeignKeyField,
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
    TIncludesOfIncludes extends Includes<boolean> = Includes<
      TData extends undefined ? false : true
    >,
    TResult extends ModelFieldsWithIncludes<
      TModel,
      TIncludes,
      TFields
    >[] = ModelFieldsWithIncludes<TModel, TIncludes, TFields>[]
  >(
    relatedField: TRelatedField,
    modelInstance: TModel,
    includedModelInstance: TIncludedModel,
    includesOfModel: TIncludes,
    includesOfIncluded: TIncludesOfIncludes,
    fieldsOfModel: TFields,
    fieldsOfIncludedModel: TFieldsOfIncluded,
    search: TSearch,
    results: TResult,
    isDirectlyRelated: boolean,
    queryData: QueryDataFnType,
    isSetOperation = false,
    isToReturnResults = true,
    resultToMergeWithData = undefined as
      | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>
      | undefined,
    data = undefined as TData,
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
    const mergedSearch = (
      search && resultToMergeWithData
        ? { ...search, ...resultToMergeWithData }
        : search
        ? search
        : undefined
    ) as TSearch;
    const mergedData = (
      data && resultToMergeWithData
        ? { ...resultToMergeWithData, ...data }
        : data
        ? data
        : undefined
    ) as
      | ModelFieldsWithIncludes<
          TModel,
          TIncludes,
          FieldsOFModelType<TModel>,
          true,
          false,
          TSearch extends undefined ? false : true,
          false
        >[]
      | undefined;
    await this.getResultsWithIncludes(
      modelInstance as TModel,
      fieldsOfModelWithFieldsFromRelations as TFields,
      includesOfModel as TIncludes,
      mergedSearch as TSearch,
      results,
      queryData,
      isSetOperation,
      isToReturnResults,
      resultToMergeWithData as
        | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>
        | ModelFieldsWithIncludes<
            TModel,
            TIncludes,
            FieldsOFModelType<TModel>
          >[]
        | undefined,
      mergedData,
      transaction
    );

    const isCreatingOrUpdating = data !== undefined;
    // If we are creating or updating we only want to fetch the children of the last result.
    // because we are only updating or creating one result at a time.
    const allOfTheResultsToFetch = isCreatingOrUpdating
      ? [results[results.length - 1]]
      : results;

    for (const result of allOfTheResultsToFetch) {
      const nextSearch = (() => {
        if (isCreatingOrUpdating)
          return { ...((resultToMergeWithData as any) || {})[relationName] };
        else {
          const uniqueFieldValueOnRelation = (result as any)[parentFieldName];
          return {
            [fieldNameOfRelationInIncludedModel]: uniqueFieldValueOnRelation,
          };
        }
      })() as
        | ModelFieldsWithIncludes<
            TIncludedModel,
            TIncludesOfIncludes,
            TFieldsOfIncluded,
            false,
            false,
            true,
            true
          >
        | undefined;

      const resultOfIncludes: ModelFieldsWithIncludes<
        TIncludedModel,
        TIncludesOfIncludes,
        TFieldsOfIncluded
      >[] = [];
      const resultToMergeWithDataToAdd = ((resultToMergeWithData || {}) as any)[
        relationName
      ];
      const dataToAdd = ((data || {}) as any)[relationName];

      await this.getResultsWithIncludes(
        includedModelInstance as TIncludedModel,
        fieldsOfIncludedModel as TFieldsOfIncluded,
        includesOfIncluded as TIncludesOfIncludes,
        nextSearch,
        resultOfIncludes,
        queryData,
        isSetOperation,
        isToReturnResults,
        resultToMergeWithDataToAdd,
        dataToAdd,
        transaction
      );

      if (hasIncludedField) delete (result as any)[parentFieldName];

      (result as any)[relationName] =
        relatedField.unique || isDirectlyRelated
          ? resultOfIncludes[0]
          : resultOfIncludes;
    }
  }

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
      TFields
    >[] = ModelFieldsWithIncludes<TModel, TIncludes, TFields>[],
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
    isSetOperation = false,
    isToReturnResults = true,
    queryData: QueryDataFnType,
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
            TFieldsOfIncluded,
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
      const isToGetResultsWithSearch =
        foreignKeyFieldRelatedToModel &&
        searchForRelatedModel &&
        isSetOperation !== true;
      const isToGetResultsWithoutSearch = foreignKeyFieldRelatedToModel;

      if (isToGetResultsWithSearch) {
        await this.#resultsFromRelatedModelWithSearch(
          foreignKeyFieldRelatedToModel,
          modelInstance as TModel,
          includedModelInstance as TIncludedModel,
          includesOfModel as TIncludes,
          includesOfIncluded as TIncludesOfIncluded,
          fieldsOfModel as TFields,
          fieldsOfIncludedModel as TFieldsOfIncluded,
          searchForRelatedModel,
          search,
          results,
          isDirectlyRelated,
          queryData,
          isSetOperation,
          isToReturnResults
        );
      } else if (isToGetResultsWithoutSearch) {
        await this.#resultsFromRelatedModelsWithoutSearch(
          foreignKeyFieldRelatedToModel,
          modelInstance,
          includedModelInstance,
          includesOfModel,
          includesOfIncluded,
          fieldsOfModel,
          fieldsOfIncludedModel,
          search,
          results,
          isDirectlyRelated,
          queryData,
          isSetOperation,
          isToReturnResults,
          resultToMergeWithData,
          data,
          transaction
        );
      }
    }
  }

  /**
   * Gets the results of the related model with or without the search.
   * Look that we separate the logic of the function in a function called fetchResults.
   *
   * If the data is defined we need to loop through the data and get the results of the related model.
   * If the data is not defined we need to get the results of the related model.
   *
   * The idea here is that we get the results of the included models in a recursion so for every result we get
   * we loop through the data and get the results of the related models as well and then
   * we append this to the original object.
   */
  async getResultsWithIncludes<
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
      TFields
    >[] = ModelFieldsWithIncludes<TModel, TIncludes, TFields>[]
  >(
    modelInstance: TModel,
    fields: TFields,
    includes: TIncludes,
    search: TSearch,
    results: TResult,
    queryData: QueryDataFnType,
    isSetOperation = false,
    isToReturnResults = true,
    resultsToMergeWithData = undefined as
      | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>
      | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>[]
      | undefined,
    data = undefined as TData,
    transaction = undefined
  ) {
    async function fetchResults(
      this: EngineQuery,
      dataToAdd = undefined as TData,
      resultToMergeWithData = undefined as
        | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>
        | undefined,
      safeIncludes = includes as TIncludes
    ) {
      const hasIncludes = (safeIncludes || []).length > 0;
      if (hasIncludes && safeIncludes) {
        const include = safeIncludes[0];
        const includedModelInstance = include.model.default.getModel(
          this.engineInstance.databaseName
        );
        const allFieldsOfIncludedModel = Object.keys(
          includedModelInstance['fields']
        );
        const isDirectlyRelatedModel =
          modelInstance.directlyRelatedTo[
            includedModelInstance.originalName
          ] !== undefined;

        await this.#resultsFromRelatedModels(
          modelInstance,
          includedModelInstance,
          safeIncludes.slice(1),
          include.includes,
          ((include as any).fields ||
            allFieldsOfIncludedModel) as readonly (keyof typeof includedModelInstance['fields'])[],
          fields,
          search,
          results as TResult,
          isDirectlyRelatedModel,
          isSetOperation,
          isToReturnResults,
          queryData,
          resultToMergeWithData as ModelFieldsWithIncludes<
            TModel,
            TIncludes,
            FieldsOFModelType<TModel>
          >,
          dataToAdd as ModelFieldsWithIncludes<
            TModel,
            TIncludes,
            FieldsOFModelType<TModel>,
            true,
            false,
            TSearch extends undefined ? false : true,
            false
          >,
          transaction
        );
      } else {
        const modelConstructor = modelInstance.constructor as ReturnType<
          typeof model
        >;
        const translatedModelInstance =
          await modelConstructor.default.getInstance(
            this.engineInstance.databaseName
          );
        const mergedSearchForData =
          resultToMergeWithData !== undefined
            ? { ...search, ...resultToMergeWithData }
            : search;
        const mergedData = (
          resultToMergeWithData !== undefined && dataToAdd !== undefined
            ? {
                ...resultToMergeWithData,
                ...dataToAdd,
              }
            : dataToAdd !== undefined
            ? dataToAdd
            : undefined
        ) as
          | ModelFieldsWithIncludes<
              TModel,
              TIncludes,
              FieldsOFModelType<TModel>,
              true,
              false,
              TSearch extends undefined ? false : true,
              false
            >[]
          | undefined;
        console.log(
          '',
          await this.parseSearch(modelInstance, mergedSearchForData)
        );
        const queryDataResults = await queryData(
          translatedModelInstance,
          await this.parseSearch(modelInstance, mergedSearchForData),
          Object.keys(modelInstance.fields) as readonly string[],
          await this.parseData(modelInstance, mergedData),
          transaction
        );
        results.push(...queryDataResults);
      }
    }

    const safeIncludes: Includes =
      typeof includes !== 'undefined' ? includes : [];
    const allDataToAdd = Array.isArray(data) ? data : [data];
    const hasDataToAdd =
      typeof data !== 'undefined' &&
      (typeof data === 'object' || Array.isArray(data));

    if (hasDataToAdd) {
      for (
        let indexOfDataToAdd = 0;
        indexOfDataToAdd < allDataToAdd.length;
        indexOfDataToAdd++
      ) {
        const dataToAdd = allDataToAdd[indexOfDataToAdd];
        const allResultsToMergeWithData = Array.isArray(resultsToMergeWithData)
          ? resultsToMergeWithData
          : [resultsToMergeWithData];
        const resultToMergeWithData =
          allResultsToMergeWithData[indexOfDataToAdd];
        await fetchResults.bind(this)(
          dataToAdd,
          resultToMergeWithData,
          safeIncludes as TIncludes
        );
      }
    } else {
      await fetchResults.bind(this)(
        undefined,
        undefined,
        safeIncludes as TIncludes
      );
    }
  }

  /**
   * Simple query to remove one or more instances from the database. Be aware that not defining a search
   * might mean removing all of the instances of your database.
   *
   * @param instance - The model instance (translated by the engine) that we will use for this query.
   * @param search - All of the parameters of a model that can be used for querying.
   *
   * @return - Returns true if everything went fine and false otherwise.
   * /
  async remove<
    TModel extends InstanceType<ReturnType<typeof model>>,
    TIncludes extends Includes | undefined = undefined
  >(
    instance: any,
    search?: ModelFieldsWithIncludes<
      TModel,
      TIncludes,
      false,
      false,
      true,
      true
    >,
    internal?: {
      model: TModel;
      includes: TIncludes;
    }
  ): Promise<boolean> {
    return false;
  }*/
}
