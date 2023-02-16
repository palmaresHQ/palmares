/* eslint-disable @typescript-eslint/no-unused-vars */
import Engine from '..';
import { ForeignKeyField } from '../../models/fields';
import model from '../../models/model';
import {
  Includes,
  ModelFieldsWithIncludes,
  FieldsOFModelType,
  OrderingOfModelsType,
  FieldsOfModelOptionsType,
  ExtractFieldNames,
  Include,
} from '../../models/types';
import EngineGetQuery from './get';
import EngineRemoveQuery from './remove';
import EngineQuerySearch from './search';
import EngineQueryOrdering from './ordering';
import EngineSetQuery from './set';
import { UnmanagedModelsShouldImplementSpecialMethodsException } from '../exceptions';

type QueryDataFnType =
  | ((args: {
      modelOfEngineInstance: any;
      search: any;
      data: any;
      transaction?: any;
    }) => Promise<[boolean, any][]>)
  | ((args: {
      modelOfEngineInstance: any;
      search: any;
      shouldReturnData?: boolean;
      shouldRemove?: boolean;
      transaction?: any;
    }) => Promise<any>)
  | ((args: {
      modelOfEngineInstance: any;
      search: any;
      fields: readonly string[];
      ordering?: any;
      limit?: number;
      offset?: number | string;
    }) => Promise<any>);

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
  remove: EngineRemoveQuery;
  search: EngineQuerySearch;
  ordering: EngineQueryOrdering;

  constructor(
    engineInstance: Engine,
    engineGetQuery: typeof EngineGetQuery,
    engineSetQuery: typeof EngineSetQuery,
    engineRemoveQuery: typeof EngineRemoveQuery,
    engineQueryOrdering: typeof EngineQueryOrdering,
    engineQuerySearch: typeof EngineQuerySearch
  ) {
    this.engineInstance = engineInstance;
    this.ordering = new engineQueryOrdering(this);
    this.search = new engineQuerySearch(this);
    this.get = new engineGetQuery(this);
    this.set = new engineSetQuery(this);
    this.remove = new engineRemoveQuery(this);
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
   * Calls the query data function to retrieve the results of the
   */
  async #callQueryDataFn<
    TModel extends InstanceType<ReturnType<typeof model>>,
    TFields extends FieldsOFModelType<TModel> = readonly (keyof TModel['fields'])[],
    TSearch extends
      | ModelFieldsWithIncludes<
          TModel,
          Includes,
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
          Includes,
          FieldsOFModelType<TModel>,
          true,
          false,
          TSearch extends undefined ? false : true,
          false
        >[]
      | undefined = undefined,
    TResult extends
      | ModelFieldsWithIncludes<TModel, Includes, TFields>[]
      | undefined = ModelFieldsWithIncludes<TModel, Includes, TFields>[]
  >(args: {
    isSetOperation?: boolean;
    isRemoveOperation?: boolean;
    shouldRemove?: boolean;
    modelInstance: TModel;
    search?: TSearch;
    fields?: TFields;
    data?: TData;
    transaction?: any;
    queryDataFn: QueryDataFnType;
    shouldReturnData?: boolean;
    resultToMergeWithData?:
      | ModelFieldsWithIncludes<TModel, Includes, FieldsOFModelType<TModel>>
      | undefined;
    ordering?: OrderingOfModelsType<
      FieldsOfModelOptionsType<TModel> extends string
        ? FieldsOfModelOptionsType<TModel>
        : string
    >;
    limit?: number;
    offset?: number | string;
    results?: TResult;
  }) {
    const {
      shouldRemove,
      modelInstance,
      ordering,
      offset,
      limit,
      search,
      data,
      transaction,
      queryDataFn,
      resultToMergeWithData,
    } = args;

    const fields = (args.fields ||
      Object.keys(modelInstance.fields)) as TFields;

    const modelConstructor = modelInstance.constructor as ReturnType<
      typeof model
    >;
    const mergedSearchForData =
      resultToMergeWithData !== undefined
        ? { ...search, ...resultToMergeWithData }
        : search;

    const mergedData = (
      resultToMergeWithData !== undefined
        ? Array.isArray(data)
          ? data.map((dataToAdd) => ({
              ...resultToMergeWithData,
              ...dataToAdd,
            }))
          : [{ ...resultToMergeWithData, ...(data as any) }]
        : Array.isArray(data)
        ? data
        : [data]
    )?.filter((eachData) => eachData !== undefined) as
      | ModelFieldsWithIncludes<
          TModel,
          Includes,
          FieldsOFModelType<TModel>,
          true,
          false,
          TSearch extends undefined ? false : true,
          false
        >[]
      | undefined;

    const [parsedSearch, parsedData, parsedOrdering] = await Promise.all([
      this.search.parseSearch(modelInstance, mergedSearchForData),
      this.parseData(modelInstance, mergedData),
      (async () => {
        if (Array.isArray(ordering))
          return this.ordering.parseOrdering(
            ordering as (`${string}` | `${string}`)[]
          );
      })(),
    ]);

    async function fetchFromDatabase(this: EngineQuery) {
      const translatedModelInstance =
        await modelConstructor.default.getInstance(
          this.engineInstance.databaseName
        );
      return (queryDataFn as any)({
        modelOfEngineInstance: translatedModelInstance,
        search: parsedSearch,
        fields: fields as readonly string[],
        data: parsedData,
        transaction,
        ordering: parsedOrdering,
        offset,
        limit,
        shouldReturnData:
          typeof args.shouldReturnData === 'boolean'
            ? args.shouldReturnData
            : true,
      });
    }

    async function fetchFromExternalSource(this: EngineQuery) {
      if (args.isSetOperation && modelInstance.options.onSet)
        return modelInstance.options.onSet({
          data: parsedData as any,
          search: parsedSearch as any,
        });
      else if (args.isRemoveOperation && modelInstance.options.onRemove)
        return modelInstance.options.onRemove({
          search: parsedSearch as any,
        });
      else if (modelInstance.options.onGet)
        return modelInstance.options.onGet({
          search: parsedSearch as any,
          fields: fields as ExtractFieldNames<TModel, TModel['abstracts']>,
          ordering: parsedOrdering,
          offset,
          limit,
        });
      else
        throw new UnmanagedModelsShouldImplementSpecialMethodsException(
          modelInstance.name,
          args.isRemoveOperation
            ? 'onRemove'
            : args.isSetOperation
            ? 'onSet'
            : 'onGet'
        );
    }
    const isToFetchExternally = modelInstance.options.managed === false;
    const queryDataResults = isToFetchExternally
      ? await fetchFromExternalSource.bind(this)()
      : await fetchFromDatabase.bind(this)();

    if (Array.isArray(args.results)) {
      if (args.isSetOperation)
        args.results.push(
          ...queryDataResults.map(
            (
              eachResult: [
                boolean,
                ModelFieldsWithIncludes<TModel, undefined, TFields>
              ]
            ) => eachResult[1]
          )
        );
      else args.results.push(...queryDataResults);
    }
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
  #getFieldNameOfRelationInIncludedModelRelationNameAndParentFieldName<
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
    TIncludes extends Includes = Includes,
    TIncludesOfIncludes extends Includes = Includes,
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
    isRemoveOperation = false,
    shouldRemove = true,
    ordering?: OrderingOfModelsType<
      FieldsOfModelOptionsType<TModel> extends string
        ? FieldsOfModelOptionsType<TModel>
        : string
    >,
    limit?: number,
    offset?: number | string,
    shouldRemoveIncluded = true,
    orderingOfIncluded?: OrderingOfModelsType<
      FieldsOfModelOptionsType<TIncludedModel> extends string
        ? FieldsOfModelOptionsType<TIncludedModel>
        : string
    >,
    limitOfIncluded?: number,
    offsetOfIncluded?: number | string,
    transaction = undefined
  ) {
    const {
      relationName,
      parentFieldName,
      fieldNameOfRelationInIncludedModel,
    } = this.#getFieldNameOfRelationInIncludedModelRelationNameAndParentFieldName(
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
    const isARemoveOperationAndShouldGetResultsBeforeRemove =
      isRemoveOperation && isDirectlyRelated === true;

    await this.getResultsWithIncludes(
      includedModelInstance as TIncludedModel,
      fieldsOfIncludedModelWithFieldsFromRelation as TFieldsOfIncluded,
      includesOfIncluded as TIncludesOfIncludes,
      searchForRelatedModel,
      resultOfIncludes,
      isARemoveOperationAndShouldGetResultsBeforeRemove
        ? this.get.queryData.bind(this)
        : queryData,
      isSetOperation,
      isRemoveOperation,
      orderingOfIncluded,
      limitOfIncluded,
      offsetOfIncluded,
      shouldRemoveIncluded,
      undefined,
      undefined,
      transaction
    );
    const resultByUniqueFieldValue: Record<string, any[]> = {};
    const promises = resultOfIncludes.map(async (result) => {
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
          isRemoveOperation,
          ordering,
          limit,
          offset,
          shouldRemove,
          undefined,
          undefined,
          transaction
        );

        resultByUniqueFieldValue[uniqueFieldValueOnRelation] = [result];

        (results as any)[results.length - 1][relationName] =
          relatedField.unique || isDirectlyRelated
            ? resultByUniqueFieldValue[uniqueFieldValueOnRelation][0]
            : resultByUniqueFieldValue[uniqueFieldValueOnRelation];
      }
    });
    await Promise.all(promises);

    if (isARemoveOperationAndShouldGetResultsBeforeRemove) {
      await this.#callQueryDataFn<
        TIncludedModel,
        TFieldsOfIncluded,
        | ModelFieldsWithIncludes<
            TIncludedModel,
            Includes,
            TFieldsOfIncluded,
            false,
            false,
            true,
            true
          >
        | undefined,
        undefined,
        undefined
      >({
        isSetOperation: isSetOperation,
        isRemoveOperation: isRemoveOperation,
        modelInstance: includedModelInstance,
        search: searchForRelatedModel,
        queryDataFn: queryData,
        shouldReturnData: false,
        shouldRemove: shouldRemove,
        ordering,
        offset,
        limit,
        transaction,
      });
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
    TIncludes extends Includes = Includes,
    TIncludesOfIncludes extends Includes = Includes,
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
    isRemoveOperation = false,
    shouldRemove = true,
    ordering?: OrderingOfModelsType<
      FieldsOfModelOptionsType<TModel> extends string
        ? FieldsOfModelOptionsType<TModel>
        : string
    >,
    limit?: number,
    offset?: number | string,
    shouldRemoveIncluded = true,
    orderingOfIncluded?: OrderingOfModelsType<
      FieldsOfModelOptionsType<TIncludedModel> extends string
        ? FieldsOfModelOptionsType<TIncludedModel>
        : string
    >,
    limitOfIncluded?: number,
    offsetOfIncluded?: number | string,
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
    } = this.#getFieldNameOfRelationInIncludedModelRelationNameAndParentFieldName(
      relatedField,
      isDirectlyRelated
    );

    // Get the results of the parent model and then get the results of the children (included) models
    const [hasIncludedField, fieldsOfModelWithFieldsFromRelations] =
      fieldsOfModel.includes(parentFieldName)
        ? [false, fieldsOfModel]
        : [true, fieldsOfModel.concat([parentFieldName])];
    const isARemoveOperationAndShouldGetResultsBeforeRemove =
      isRemoveOperation && isDirectlyRelated === false;

    /**
     * When it is a set operation and it is directly related, we should first update or create the children and just after that we should
     * update or create the parent model, this is why we bypass this here.
     *
     * We also use the `resultOfChildren` to get the results of the children and then we use it to update the parent model since we will just get
     * the data of the parent BEFORE the children are updated or created.
     *
     * IMPORTANT: the for loop WILL work because it will be an array of `[undefined]`
     * ```
     * const allOfTheResultsToFetch = isSetOperation
     *  ? [results[results.length - 1]]
     *  : results;
     */
    const isASetOperationAndShouldSetResultsAfterChildren =
      isSetOperation && isDirectlyRelated === true;
    let resultOfChildren:
      | ModelFieldsWithIncludes<
          TIncludedModel,
          TIncludesOfIncludes,
          TFieldsOfIncluded
        >
      | undefined = undefined;

    if (isASetOperationAndShouldSetResultsAfterChildren === false) {
      await this.getResultsWithIncludes(
        modelInstance as TModel,
        fieldsOfModelWithFieldsFromRelations as TFields,
        includesOfModel as TIncludes,
        search as TSearch,
        results,
        isARemoveOperationAndShouldGetResultsBeforeRemove
          ? this.get.queryData.bind(this)
          : queryData,
        isSetOperation,
        isRemoveOperation,
        ordering,
        limit,
        offset,
        shouldRemove,
        resultToMergeWithData as
          | ModelFieldsWithIncludes<
              TModel,
              TIncludes,
              FieldsOFModelType<TModel>
            >
          | ModelFieldsWithIncludes<
              TModel,
              TIncludes,
              FieldsOFModelType<TModel>
            >[]
          | undefined,
        data as
          | ModelFieldsWithIncludes<
              TModel,
              TIncludes,
              FieldsOFModelType<TModel>,
              true,
              false,
              TSearch extends undefined ? false : true,
              false
            >[]
          | undefined,
        transaction
      );
    }
    // If we are creating or updating we only want to fetch the children of the last result.
    // because we are only updating or creating one result at a time.
    const allOfTheResultsToFetch = isSetOperation
      ? [results[results.length - 1]]
      : results;

    const promises = allOfTheResultsToFetch.map(async (result) => {
      const nextSearch = (() => {
        if (isSetOperation)
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
      const allDataToAdd = ((data || {}) as any)[relationName];
      const dataToAdd = (
        Array.isArray(allDataToAdd) ? allDataToAdd : [allDataToAdd]
      ).map((dataToMerge: any) =>
        result && (result as any)[parentFieldName]
          ? {
              ...dataToMerge,
              [fieldNameOfRelationInIncludedModel]: (result as any)[
                parentFieldName
              ],
            }
          : dataToMerge
      );

      await this.getResultsWithIncludes(
        includedModelInstance as TIncludedModel,
        fieldsOfIncludedModel as TFieldsOfIncluded,
        includesOfIncluded as TIncludesOfIncludes,
        nextSearch,
        resultOfIncludes,
        queryData,
        isSetOperation,
        isRemoveOperation,
        orderingOfIncluded,
        limitOfIncluded,
        offsetOfIncluded,
        shouldRemoveIncluded,
        resultToMergeWithDataToAdd,
        dataToAdd,
        transaction
      );

      if (isASetOperationAndShouldSetResultsAfterChildren) {
        resultOfChildren = resultOfIncludes[0] as ModelFieldsWithIncludes<
          TIncludedModel,
          TIncludesOfIncludes,
          TFieldsOfIncluded
        >;
      } else {
        if (hasIncludedField) delete (result as any)[parentFieldName];

        (result as any)[relationName] =
          relatedField.unique || isDirectlyRelated
            ? resultOfIncludes[0]
            : resultOfIncludes;
      }
    });
    await Promise.all(promises);

    if (isARemoveOperationAndShouldGetResultsBeforeRemove) {
      await this.#callQueryDataFn<
        TModel,
        TFields,
        | ModelFieldsWithIncludes<
            TModel,
            Includes,
            TFields,
            false,
            false,
            true,
            true
          >
        | undefined,
        undefined,
        undefined
      >({
        isSetOperation: isSetOperation,
        isRemoveOperation: isRemoveOperation,
        modelInstance,
        search: search,
        queryDataFn: queryData,
        shouldReturnData: false,
        shouldRemove: shouldRemove,
        transaction,
        ordering,
        limit,
        offset,
      });
      return;
    }

    if (isASetOperationAndShouldSetResultsAfterChildren) {
      await this.getResultsWithIncludes(
        modelInstance as TModel,
        fieldsOfModelWithFieldsFromRelations as TFields,
        includesOfModel as TIncludes,
        search as TSearch,
        results,
        queryData,
        isSetOperation,
        isRemoveOperation,
        ordering,
        limit,
        offset,
        shouldRemove,
        resultToMergeWithData as
          | ModelFieldsWithIncludes<
              TModel,
              TIncludes,
              FieldsOFModelType<TModel>
            >
          | ModelFieldsWithIncludes<
              TModel,
              TIncludes,
              FieldsOFModelType<TModel>
            >[]
          | undefined,
        (resultOfChildren &&
        (resultOfChildren as any)[fieldNameOfRelationInIncludedModel]
          ? {
              ...data,
              [parentFieldName]: (resultOfChildren as any)[
                fieldNameOfRelationInIncludedModel
              ],
            }
          : data) as
          | ModelFieldsWithIncludes<
              TModel,
              TIncludes,
              FieldsOFModelType<TModel>,
              true,
              false,
              TSearch extends undefined ? false : true,
              false
            >[]
          | undefined,
        transaction
      );
      for (const result of results) {
        if (hasIncludedField) delete (result as any)[parentFieldName];

        (result as any)[relationName] = resultOfChildren;
      }
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
    TIncludes extends Includes = Includes,
    TIncludesOfIncluded extends Includes = Includes,
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
    isRemoveOperation = false,
    queryData: QueryDataFnType,
    resultToMergeWithData = undefined as
      | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>
      | undefined,
    shouldRemove = true,
    ordering?: OrderingOfModelsType<
      FieldsOfModelOptionsType<TModel> extends string
        ? FieldsOfModelOptionsType<TModel>
        : string
    >,
    limit?: number,
    offset?: number | string,
    shouldRemoveIncluded = false,
    orderingOfIncluded?: OrderingOfModelsType<
      FieldsOfModelOptionsType<TIncludedModel> extends string
        ? FieldsOfModelOptionsType<TIncludedModel>
        : string
    >,
    limitOfIncluded?: number,
    offsetOfIncluded?: number | string,
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

    const associationsOfIncludedModel = isDirectlyRelated
      ? modelInstance.associations[includedModelInstance.originalName] || []
      : includedModelInstance.associations[modelInstance.originalName] || [];
    const promises = relatedNamesDirectlyOrIndirectlyRelatedToModel.map(
      async (relationNameOrRelatedName) => {
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
            association[fieldToUseToGetRelationName] ===
            relationNameOrRelatedName
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
            isRemoveOperation,
            shouldRemove,
            ordering,
            limit,
            offset,
            shouldRemoveIncluded,
            orderingOfIncluded,
            limitOfIncluded,
            offsetOfIncluded,
            transaction
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
            isRemoveOperation,
            shouldRemove,
            ordering,
            limit,
            offset,
            shouldRemoveIncluded,
            orderingOfIncluded,
            limitOfIncluded,
            offsetOfIncluded,
            resultToMergeWithData,
            data,
            transaction
          );
        }
      }
    );
    await Promise.all(promises);
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
    TIncludes extends Includes = Includes,
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
    isRemoveOperation = false,
    ordering?: OrderingOfModelsType<
      FieldsOfModelOptionsType<TModel> extends string
        ? FieldsOfModelOptionsType<TModel>
        : string
    >,
    limit?: number,
    offset?: number | string,
    shouldRemove?: boolean,
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
        const includesForRemove = include as Include<{ shouldRemove: boolean }>;
        const includesForGet = include as Include<{
          fields?: readonly string[];
          ordering?: readonly (string | `-${string}`)[];
          limit?: number;
          offset?: number | string;
        }>;
        await this.#resultsFromRelatedModels(
          modelInstance,
          includedModelInstance,
          safeIncludes.slice(1),
          include.includes,
          (includesForGet.fields ||
            allFieldsOfIncludedModel) as readonly (keyof typeof includedModelInstance['fields'])[],
          fields,
          search,
          results as TResult,
          isDirectlyRelatedModel,
          isSetOperation,
          isRemoveOperation,
          queryData,
          resultToMergeWithData as ModelFieldsWithIncludes<
            TModel,
            TIncludes,
            FieldsOFModelType<TModel>
          >,
          shouldRemove,
          ordering,
          limit,
          offset,
          typeof includesForRemove.shouldRemove === 'boolean'
            ? includesForRemove.shouldRemove
            : true,
          includesForGet.ordering,
          includesForGet.limit,
          includesForGet.offset,
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
        await this.#callQueryDataFn<
          TModel,
          TFields,
          | ModelFieldsWithIncludes<
              TModel,
              Includes,
              TFields,
              false,
              false,
              true,
              true
            >
          | undefined,
          | ModelFieldsWithIncludes<
              TModel,
              TIncludes,
              FieldsOFModelType<TModel>,
              true,
              false,
              TSearch extends undefined ? false : true,
              false
            >[]
          | undefined,
          ModelFieldsWithIncludes<TModel, Includes, TFields>[]
        >({
          isSetOperation: isSetOperation,
          isRemoveOperation: isRemoveOperation,
          modelInstance,
          search: search,
          queryDataFn: queryData,
          fields,
          results,
          ordering,
          limit,
          offset,
          shouldRemove,
          data: dataToAdd,
          transaction: transaction,
          resultToMergeWithData,
        });
      }
    }
    const safeIncludes: Includes =
      typeof includes !== 'undefined' ? includes : [];
    const allDataToAdd = Array.isArray(data) ? data : [data];
    const hasDataToAdd =
      typeof data !== 'undefined' &&
      (typeof data === 'object' || Array.isArray(data));

    if (hasDataToAdd) {
      const promises = Array.from({ length: allDataToAdd.length }).map(
        async (_, indexOfDataToAdd) => {
          const dataToAdd = allDataToAdd[indexOfDataToAdd];
          const allResultsToMergeWithData = Array.isArray(
            resultsToMergeWithData
          )
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
      );
      await Promise.all(promises);
    } else {
      await fetchResults.bind(this)(
        undefined,
        undefined,
        safeIncludes as TIncludes
      );
    }
  }
}

export {
  EngineGetQuery,
  EngineQuerySearch,
  EngineSetQuery,
  EngineRemoveQuery,
  EngineQueryOrdering,
};
