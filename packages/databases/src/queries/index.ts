import { Model as model } from '../models';
import Engine from '../engine';

import type Transaction from '../transaction';
import type {
  Includes,
  ModelFieldsWithIncludes,
  FieldsOFModelType,
  OrderingOfModelsType,
  FieldsOfModelOptionsType,
  ExtractFieldNames,
  Include,
} from '../models/types';
import { QueryDataFnType } from './types';
import { extractDefaultEventsHandlerFromModel } from './utils';
import { UnmanagedModelsShouldImplementSpecialMethodsException } from './exceptions';
import { ForeignKeyField } from '../models/fields';
import parseSearch from './search';

/**
 * Retrieve the model instance so we can query from it from the default manager.
 *
 * @param modelToRetrieve - The model to retrieve the instance from.
 */
function getModelInstance(engine: Engine, modelToRetrieve: ReturnType<typeof model>) {
  return (modelToRetrieve.constructor as any).default.getInstance(engine.connectionName);
}

/**
 * The data parser is used to parse the data that we will use to save it to the database.
 */
async function parseData(modelInstance: InstanceType<ReturnType<typeof model>>, data: any) {
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

async function getDataForOnSetOrOnRemoveOptionFunctions(
  onSetOrOnRemove: 'onSet' | 'onRemove',
  args: {
    data: any;
    search: any;
    shouldRemove?: boolean;
    shouldReturnData?: boolean;
  }
) {
  return onSetOrOnRemove === 'onSet'
    ? {
        data: args.data,
        search: args.search,
      }
    : {
        search: args.search,
        shouldRemove: args.shouldRemove,
        shouldReturnData: args.shouldReturnData,
      };
}

/**
 * This method will save every data that we retrieve from the database to the palmares transaction object. This object will hold each transaction
 * that was made so we are able to roll everything back if something goes wrong. For example, if creating a user fails, we remove, if updating fails
 * we use the `.set` method again to update the values to the previous ones as it was before the update.
 *
 * The palmares transaction instance should be garbage collected after the query is done. If the user fo some reason change the value of the result
 * of the query the rolled back data will be lost.
 */
async function storePalmaresTransaction<
  TModelConstructor extends ReturnType<typeof model>,
  TSearch extends
    | ModelFieldsWithIncludes<
        InstanceType<TModelConstructor>,
        Includes,
        FieldsOFModelType<InstanceType<TModelConstructor>>,
        false,
        false,
        true,
        true
      >
    | undefined = undefined,
  TResult extends
    | ModelFieldsWithIncludes<
        InstanceType<TModelConstructor>,
        Includes,
        FieldsOFModelType<InstanceType<TModelConstructor>>
      >[]
    | undefined = ModelFieldsWithIncludes<
    InstanceType<TModelConstructor>,
    Includes,
    FieldsOFModelType<InstanceType<TModelConstructor>>
  >[]
>(
  engine: Engine,
  palmaresTransaction: Transaction | undefined,
  modelConstructor: TModelConstructor,
  search: TSearch,
  results: TResult
) {
  if (palmaresTransaction && results) {
    palmaresTransaction.appendData(engine.connectionName, modelConstructor, search, results);
  }
}

/**
 * This method will fire the events that are related to the query. In other words, if we are doing a `set` operation for example we can notify
 * every listener that we are doing a `set` operation on this model. The nice thing about this is that it will use a layer if it exists.
 *
 * So for example, let's say that application A and B has the model users. But they are completely different applications with different databases.
 * This means that we can sync the users from application A to application B. So when we do a `set` operation on application A we can notify
 * application B that we are doing a `set` operation on the users model. This way we can sync the users from application A to application B.
 *
 * So in other words, both applications will have the same users.
 *
 * Before syncing systems, for events that does not use a layer, we can just send a simple signal to notify that a user was created for example.
 * With this you can have side effects on your application. But we do not recommend using too much side effects because it can be hard to debug.
 */
async function fireEventsAfterQueryDataFn<
  TModel extends InstanceType<ReturnType<typeof model>>,
  TSearch extends
    | ModelFieldsWithIncludes<TModel, Includes, FieldsOFModelType<TModel>, false, false, true, true>
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
    | undefined = undefined
>(
  engine: Engine,
  args: {
    modelInstance: TModel;
    isSetOperation: boolean;
    isRemoveOperation: boolean;
    isToPreventEvents: boolean;
    shouldReturnData: boolean;
    shouldRemove: boolean;
    parsedData: TData;
    parsedSearch: TSearch;
  }
) {
  const shouldCallEvents =
    engine.databaseSettings?.events?.emitter &&
    (args.isRemoveOperation || args.isSetOperation) &&
    args.isToPreventEvents !== true;

  if (engine.databaseSettings?.events?.emitter && shouldCallEvents) {
    const operationName = args.isRemoveOperation ? 'onRemove' : 'onSet';
    const eventEmitter = await Promise.resolve(engine.databaseSettings?.events?.emitter);
    const dataForFunction = await getDataForOnSetOrOnRemoveOptionFunctions(operationName, {
      data: args.parsedData,
      search: args.parsedSearch,
      shouldRemove: args.shouldRemove,
      shouldReturnData: args.shouldReturnData,
    });

    const isDataTheSameReceivedThroughEvent = args.modelInstance.stringfiedArgumentsOfEvents.has(
      JSON.stringify(dataForFunction)
    );

    if (isDataTheSameReceivedThroughEvent === false) {
      if (eventEmitter.hasLayer) {
        eventEmitter.emitToChannel(
          engine.databaseSettings?.events.channels ? engine.databaseSettings?.events.channels : eventEmitter.channels,
          `${args.modelInstance.hashedName}.${operationName}`,
          engine.connectionName,
          dataForFunction
        );
      } else {
        eventEmitter.emit(`${args.modelInstance.hashedName}.${operationName}`, engine.connectionName, dataForFunction);
      }
    }
  }
}

/**
 * Calls the query data function to retrieve the results of the
 */
async function callQueryDataFn<
  TModel extends InstanceType<ReturnType<typeof model>>,
  TFields extends FieldsOFModelType<TModel> = readonly (keyof TModel['fields'])[],
  TSearch extends ModelFieldsWithIncludes<TModel, Includes, TFields, false, false, true, true> | undefined = undefined,
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
  TResult extends ModelFieldsWithIncludes<TModel, Includes, TFields>[] | undefined = ModelFieldsWithIncludes<
    TModel,
    Includes,
    TFields
  >[]
>(
  engine: Engine,
  args: {
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
    palmaresTransaction?: Transaction;
    isToPreventEvents?: boolean;
    resultToMergeWithData?: ModelFieldsWithIncludes<TModel, Includes, FieldsOFModelType<TModel>> | undefined;
    ordering?: OrderingOfModelsType<
      FieldsOfModelOptionsType<TModel> extends string ? FieldsOfModelOptionsType<TModel> : string
    >;
    limit?: number;
    offset?: number | string;
    results?: TResult;
  }
) {
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

  const fields = (args.fields || Object.keys(modelInstance.fields)) as TFields;

  const modelConstructor = modelInstance.constructor as ReturnType<typeof model>;
  const mergedSearchForData =
    resultToMergeWithData !== undefined ? Object.assign(search ? search : {}, resultToMergeWithData) : search;

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
    parseSearch(engine, modelInstance, mergedSearchForData),
    parseData(modelInstance, mergedData),
    (async () => {
      if (Array.isArray(ordering))
        return engine.query.ordering.parseOrdering(ordering as (`${string}` | `${string}`)[]);
    })(),
  ]);

  async function fetchFromDatabase() {
    const translatedModelInstance = await modelConstructor.default.getInstance(engine.connectionName);
    return (queryDataFn as any)(engine, {
      modelOfEngineInstance: translatedModelInstance,
      search: parsedSearch,
      fields: fields as readonly string[],
      data: parsedData,
      transaction,
      ordering: parsedOrdering,
      offset,
      limit,
      shouldRemove,
      shouldReturnData: typeof args.shouldReturnData === 'boolean' ? args.shouldReturnData : true,
    });
  }

  async function fetchFromExternalSource() {
    if (args.isSetOperation && modelInstance.options.onSet) {
      const onSetHandler = extractDefaultEventsHandlerFromModel(modelInstance, 'onSet');
      if (onSetHandler) {
        const dataForFunction = await getDataForOnSetOrOnRemoveOptionFunctions('onSet', {
          data: parsedData,
          search: parsedSearch,
          shouldRemove: shouldRemove,
          shouldReturnData: args.shouldReturnData,
        });
        return onSetHandler(dataForFunction as any);
      }
    } else if (args.isRemoveOperation && modelInstance.options.onRemove) {
      const onRemoveHandler = extractDefaultEventsHandlerFromModel(modelInstance, 'onRemove');
      if (onRemoveHandler) {
        const dataForFunction = await getDataForOnSetOrOnRemoveOptionFunctions('onRemove', {
          data: parsedData,
          search: parsedSearch,
          shouldRemove: shouldRemove,
          shouldReturnData: args.shouldReturnData,
        });
        return onRemoveHandler(dataForFunction);
      }
    } else if (modelInstance.options.onGet)
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
        args.isRemoveOperation ? 'onRemove' : args.isSetOperation ? 'onSet' : 'onGet'
      );
  }

  const isToFetchExternally = modelInstance.options.managed === false;
  const queryDataResults = isToFetchExternally ? await fetchFromExternalSource() : await fetchFromDatabase();

  await Promise.all([
    fireEventsAfterQueryDataFn(engine, {
      isToPreventEvents: args.isToPreventEvents || false,
      isRemoveOperation: args.isRemoveOperation || false,
      isSetOperation: args.isSetOperation || false,
      modelInstance,
      parsedSearch: parsedSearch as
        | ModelFieldsWithIncludes<TModel, Includes, FieldsOFModelType<TModel>, false, false, true, true>
        | undefined,
      parsedData: parsedData as TData,
      shouldRemove: args.shouldRemove || false,
      shouldReturnData: args.shouldReturnData || false,
    }),
    storePalmaresTransaction(engine, args.palmaresTransaction, modelConstructor, parsedSearch, queryDataResults),
  ]);

  if (Array.isArray(args.results)) {
    if (args.isSetOperation)
      args.results.push(
        ...queryDataResults.map(
          (eachResult: [boolean, ModelFieldsWithIncludes<TModel, undefined, TFields>]) => eachResult[1]
        )
      );
    else args.results.push(...queryDataResults);
  }
}

async function getDefaultValuesForResultsWithSearchAndWithoutSearch(args: {
  isToPreventEvents?: boolean;
  isDirectlyRelated?: boolean;
  isSetOperation?: boolean;
  isRemoveOperation?: boolean;
  shouldRemove?: boolean;
  shouldRemoveIncluded?: boolean;
}) {
  if (typeof args.isDirectlyRelated !== 'boolean') args.isDirectlyRelated = false;
  if (typeof args.isSetOperation !== 'boolean') args.isSetOperation = false;
  if (typeof args.isRemoveOperation !== 'boolean') args.isRemoveOperation = false;
  if (typeof args.shouldRemove !== 'boolean') args.shouldRemove = true;
  if (typeof args.shouldRemoveIncluded !== 'boolean') args.shouldRemoveIncluded = true;
  if (typeof args.isToPreventEvents !== 'boolean') args.isToPreventEvents = false;
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
function getFieldNameOfRelationInIncludedModelRelationNameAndParentFieldName<
  TToField extends string,
  TRelatedName extends string,
  TRelationName extends string,
  TIsDirectlyRelated extends boolean | undefined = undefined
>(
  relatedField: ForeignKeyField<any, any, any, any, any, any, any, any, any, TToField, TRelatedName, TRelationName>,
  isDirectlyRelated?: TIsDirectlyRelated
): {
  relationName: TIsDirectlyRelated extends true ? TRelationName : TRelatedName;
  parentFieldName: TIsDirectlyRelated extends true ? string : TToField;
  fieldNameOfRelationInIncludedModel: TIsDirectlyRelated extends true ? TToField : string;
} {
  return {
    relationName: (isDirectlyRelated
      ? relatedField.relationName
      : relatedField.relatedName) as TIsDirectlyRelated extends true ? TRelationName : TRelatedName,
    parentFieldName: (isDirectlyRelated
      ? relatedField.fieldName
      : relatedField.toField) as TIsDirectlyRelated extends true ? string : TToField,
    fieldNameOfRelationInIncludedModel: (isDirectlyRelated
      ? relatedField.toField
      : relatedField.fieldName) as TIsDirectlyRelated extends true ? TToField : string,
  };
}

async function resultsFromRelatedModelWithSearch<
  TRelatedField extends ForeignKeyField,
  TModel extends InstanceType<ReturnType<typeof model>>,
  TIncludedModel extends InstanceType<ReturnType<typeof model>>,
  TFields extends FieldsOFModelType<TModel> = readonly (keyof TModel['fields'])[],
  TFieldsOfIncluded extends FieldsOFModelType<TIncludedModel> = readonly (keyof TIncludedModel['fields'])[],
  TSearch extends ModelFieldsWithIncludes<TModel, TIncludes, TFields, false, false, true, true> | undefined = undefined,
  TSearchOfIncluded extends
    | ModelFieldsWithIncludes<TIncludedModel, TIncludesOfIncludes, TFieldsOfIncluded, false, false, true, true>
    | undefined = undefined,
  TIncludes extends Includes = Includes,
  TIncludesOfIncludes extends Includes = Includes,
  TResult extends ModelFieldsWithIncludes<TModel, TIncludes, TFields>[] = ModelFieldsWithIncludes<
    TModel,
    TIncludes,
    TFields
  >[]
>(
  engine: Engine,
  args: {
    relatedField: TRelatedField;
    modelInstance: TModel;
    includedModelInstance: TIncludedModel;
    includesOfModel: TIncludes;
    includesOfIncluded: TIncludesOfIncludes;
    fieldsOfModel: TFields;
    fieldsOfIncludedModel: TFieldsOfIncluded;
    searchForRelatedModel: TSearchOfIncluded;
    search: TSearch;
    results: TResult;
    isDirectlyRelated?: boolean;
    queryData: QueryDataFnType;
    isSetOperation?: boolean;
    isRemoveOperation?: boolean;
    shouldRemove?: boolean;
    ordering?: OrderingOfModelsType<
      FieldsOfModelOptionsType<TModel> extends string ? FieldsOfModelOptionsType<TModel> : string
    >;
    limit?: number;
    offset?: number | string;
    shouldRemoveIncluded?: boolean;
    orderingOfIncluded?: OrderingOfModelsType<
      FieldsOfModelOptionsType<TIncludedModel> extends string ? FieldsOfModelOptionsType<TIncludedModel> : string
    >;
    limitOfIncluded?: number;
    offsetOfIncluded?: number | string;
    isToPreventEvents?: boolean;
    transaction?: any;
    palmaresTransaction?: Transaction;
  }
) {
  await getDefaultValuesForResultsWithSearchAndWithoutSearch(args);

  const { relationName, parentFieldName, fieldNameOfRelationInIncludedModel } =
    getFieldNameOfRelationInIncludedModelRelationNameAndParentFieldName(args.relatedField, args.isDirectlyRelated);

  const resultOfIncludes: ModelFieldsWithIncludes<TIncludedModel, TIncludesOfIncludes, TFieldsOfIncluded>[] = [];
  const [hasIncludedField, fieldsOfIncludedModelWithFieldsFromRelation] = args.fieldsOfIncludedModel.includes(
    fieldNameOfRelationInIncludedModel
  )
    ? [false, args.fieldsOfIncludedModel]
    : [true, args.fieldsOfIncludedModel.concat([fieldNameOfRelationInIncludedModel])];
  const isARemoveOperationAndShouldGetResultsBeforeRemove = args.isRemoveOperation && args.isDirectlyRelated === true;

  await getResultsWithIncludes(
    engine,
    args.includedModelInstance as TIncludedModel,
    fieldsOfIncludedModelWithFieldsFromRelation as TFieldsOfIncluded,
    args.includesOfIncluded as TIncludesOfIncludes,
    args.searchForRelatedModel,
    resultOfIncludes,
    isARemoveOperationAndShouldGetResultsBeforeRemove ? engine.query.get.queryData : args.queryData,
    args.isSetOperation,
    args.isRemoveOperation,
    args.orderingOfIncluded,
    args.limitOfIncluded,
    args.offsetOfIncluded,
    args.shouldRemoveIncluded,
    undefined,
    undefined,
    args.isToPreventEvents,
    args.transaction
  );
  const resultByUniqueFieldValue: Record<string, any[]> = {};
  const promises = resultOfIncludes.map(async (result) => {
    const uniqueFieldValueOnRelation = (result as any)[fieldNameOfRelationInIncludedModel];

    if (hasIncludedField) delete (result as any)[fieldNameOfRelationInIncludedModel];

    const existsValueForUniqueFieldValueOnResults = resultByUniqueFieldValue[uniqueFieldValueOnRelation] !== undefined;

    if (existsValueForUniqueFieldValueOnResults) {
      resultByUniqueFieldValue[uniqueFieldValueOnRelation].push(result);
    } else {
      const nextSearch = {
        [parentFieldName]: uniqueFieldValueOnRelation,
        ...args.search,
      };

      await getResultsWithIncludes(
        engine,
        args.modelInstance as TModel,
        args.fieldsOfModel as TFields,
        args.includesOfModel as TIncludes,
        nextSearch,
        args.results,
        args.queryData,
        args.isSetOperation,
        args.isRemoveOperation,
        args.ordering,
        args.limit,
        args.offset,
        args.shouldRemove,
        undefined,
        undefined,
        args.isToPreventEvents,
        args.transaction
      );

      resultByUniqueFieldValue[uniqueFieldValueOnRelation] = [result];

      (args.results as any)[args.results.length - 1][relationName] =
        args.relatedField.unique || args.isDirectlyRelated
          ? resultByUniqueFieldValue[uniqueFieldValueOnRelation][0]
          : resultByUniqueFieldValue[uniqueFieldValueOnRelation];
    }
  });
  await Promise.all(promises);

  if (isARemoveOperationAndShouldGetResultsBeforeRemove) {
    await callQueryDataFn<
      TIncludedModel,
      TFieldsOfIncluded,
      ModelFieldsWithIncludes<TIncludedModel, Includes, TFieldsOfIncluded, false, false, true, true> | undefined,
      undefined,
      undefined
    >(engine, {
      isSetOperation: args.isSetOperation,
      isRemoveOperation: args.isRemoveOperation,
      modelInstance: args.includedModelInstance,
      search: args.searchForRelatedModel,
      queryDataFn: args.queryData,
      shouldReturnData: false,
      shouldRemove: args.shouldRemove,
      ordering: args.ordering,
      offset: args.offset,
      limit: args.limit,
      transaction: args.transaction,
      palmaresTransaction: args.palmaresTransaction,
      isToPreventEvents: args.isToPreventEvents,
    });
  }
}

async function resultsFromRelatedModelsWithoutSearch<
  TRelatedField extends ForeignKeyField,
  TModel extends InstanceType<ReturnType<typeof model>>,
  TIncludedModel extends InstanceType<ReturnType<typeof model>>,
  TFields extends FieldsOFModelType<TModel> = readonly (keyof TModel['fields'])[],
  TFieldsOfIncluded extends FieldsOFModelType<TIncludedModel> = readonly (keyof TIncludedModel['fields'])[],
  TSearch extends ModelFieldsWithIncludes<TModel, TIncludes, TFields, false, false, true, true> | undefined = undefined,
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
  TResult extends ModelFieldsWithIncludes<TModel, TIncludes, TFields>[] = ModelFieldsWithIncludes<
    TModel,
    TIncludes,
    TFields
  >[]
>(
  engine: Engine,
  args: {
    relatedField: TRelatedField;
    modelInstance: TModel;
    includedModelInstance: TIncludedModel;
    includesOfModel: TIncludes;
    includesOfIncluded: TIncludesOfIncludes;
    fieldsOfModel: TFields;
    fieldsOfIncludedModel: TFieldsOfIncluded;
    search: TSearch;
    results: TResult;
    isDirectlyRelated: boolean;
    queryData: QueryDataFnType;
    isSetOperation?: boolean;
    isRemoveOperation?: boolean;
    shouldRemove?: boolean;
    ordering?: OrderingOfModelsType<
      FieldsOfModelOptionsType<TModel> extends string ? FieldsOfModelOptionsType<TModel> : string
    >;
    limit?: number;
    offset?: number | string;
    shouldRemoveIncluded?: boolean;
    orderingOfIncluded?: OrderingOfModelsType<
      FieldsOfModelOptionsType<TIncludedModel> extends string ? FieldsOfModelOptionsType<TIncludedModel> : string
    >;
    limitOfIncluded?: number;
    offsetOfIncluded?: number | string;
    resultToMergeWithData?: ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>> | undefined;
    data?: TData;
    isToPreventEvents?: boolean;
    transaction?: any;
    palmaresTransaction?: Transaction;
  }
) {
  await getDefaultValuesForResultsWithSearchAndWithoutSearch(args);

  const { relationName, parentFieldName, fieldNameOfRelationInIncludedModel } =
    getFieldNameOfRelationInIncludedModelRelationNameAndParentFieldName(args.relatedField, args.isDirectlyRelated);

  // Get the results of the parent model and then get the results of the children (included) models
  const [hasIncludedField, fieldsOfModelWithFieldsFromRelations] = args.fieldsOfModel.includes(parentFieldName)
    ? [false, args.fieldsOfModel]
    : [true, args.fieldsOfModel.concat([parentFieldName])];
  const isARemoveOperationAndShouldGetResultsBeforeRemove = args.isRemoveOperation && args.isDirectlyRelated === false;

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
  const isASetOperationAndShouldSetResultsAfterChildren = args.isSetOperation && args.isDirectlyRelated === true;
  let resultOfChildren: ModelFieldsWithIncludes<TIncludedModel, TIncludesOfIncludes, TFieldsOfIncluded> | undefined =
    undefined;

  if (isASetOperationAndShouldSetResultsAfterChildren === false) {
    await getResultsWithIncludes(
      engine,
      args.modelInstance as TModel,
      fieldsOfModelWithFieldsFromRelations as TFields,
      args.includesOfModel as TIncludes,
      args.search as TSearch,
      args.results,
      isARemoveOperationAndShouldGetResultsBeforeRemove ? engine.query.get.queryData : args.queryData,
      args.isSetOperation,
      args.isRemoveOperation,
      args.ordering,
      args.limit,
      args.offset,
      args.shouldRemove,
      args.resultToMergeWithData as
        | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>
        | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>[]
        | undefined,
      args.data as
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
      typeof args.isToPreventEvents === 'boolean' ? args.isToPreventEvents : false,
      args.transaction,
      args.palmaresTransaction
    );
  }
  // If we are creating or updating we only want to fetch the children of the last result.
  // because we are only updating or creating one result at a time.
  const allOfTheResultsToFetch = args.isSetOperation ? [args.results[args.results.length - 1]] : args.results;

  const promises = allOfTheResultsToFetch.map(async (result) => {
    const nextSearch = (() => {
      if (args.isSetOperation)
        return {
          ...((args.resultToMergeWithData as any) || {})[relationName],
        };
      else {
        const uniqueFieldValueOnRelation = (result as any)[parentFieldName];
        return {
          [fieldNameOfRelationInIncludedModel]: uniqueFieldValueOnRelation,
        };
      }
    })() as
      | ModelFieldsWithIncludes<TIncludedModel, TIncludesOfIncludes, TFieldsOfIncluded, false, false, true, true>
      | undefined;
    const resultOfIncludes: ModelFieldsWithIncludes<TIncludedModel, TIncludesOfIncludes, TFieldsOfIncluded>[] = [];
    const resultToMergeWithDataToAdd = ((args.resultToMergeWithData || {}) as any)[relationName];
    const allDataToAdd = ((args.data || {}) as any)[relationName];
    const dataToAdd = (Array.isArray(allDataToAdd) ? allDataToAdd : [allDataToAdd]).map((dataToMerge: any) =>
      result && (result as any)[parentFieldName]
        ? {
            ...dataToMerge,
            [fieldNameOfRelationInIncludedModel]: (result as any)[parentFieldName],
          }
        : dataToMerge
    );

    await getResultsWithIncludes(
      engine,
      args.includedModelInstance as TIncludedModel,
      args.fieldsOfIncludedModel as TFieldsOfIncluded,
      args.includesOfIncluded as TIncludesOfIncludes,
      nextSearch,
      resultOfIncludes,
      args.queryData,
      args.isSetOperation,
      args.isRemoveOperation,
      args.orderingOfIncluded,
      args.limitOfIncluded,
      args.offsetOfIncluded,
      args.shouldRemoveIncluded,
      resultToMergeWithDataToAdd,
      dataToAdd,
      args.isToPreventEvents,
      args.transaction,
      args.palmaresTransaction
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
        args.relatedField.unique || args.isDirectlyRelated ? resultOfIncludes[0] : resultOfIncludes;
    }
  });
  await Promise.all(promises);

  if (isARemoveOperationAndShouldGetResultsBeforeRemove) {
    await callQueryDataFn<
      TModel,
      TFields,
      ModelFieldsWithIncludes<TModel, Includes, TFields, false, false, true, true> | undefined,
      undefined,
      undefined
    >(engine, {
      isSetOperation: args.isSetOperation,
      isRemoveOperation: args.isRemoveOperation,
      modelInstance: args.modelInstance,
      search: args.search,
      queryDataFn: args.queryData,
      shouldReturnData: false,
      shouldRemove: args.shouldRemove,
      transaction: args.transaction,
      palmaresTransaction: args.palmaresTransaction,
      ordering: args.ordering,
      limit: args.limit,
      offset: args.offset,
      isToPreventEvents: args.isToPreventEvents,
    });
    return;
  }

  if (isASetOperationAndShouldSetResultsAfterChildren) {
    await getResultsWithIncludes(
      engine,
      args.modelInstance as TModel,
      fieldsOfModelWithFieldsFromRelations as TFields,
      args.includesOfModel as TIncludes,
      args.search as TSearch,
      args.results,
      args.queryData,
      args.isSetOperation,
      args.isRemoveOperation,
      args.ordering,
      args.limit,
      args.offset,
      args.shouldRemove,
      args.resultToMergeWithData as
        | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>
        | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>[]
        | undefined,
      (resultOfChildren && (resultOfChildren as any)[fieldNameOfRelationInIncludedModel]
        ? {
            ...args.data,
            [parentFieldName]: (resultOfChildren as any)[fieldNameOfRelationInIncludedModel],
          }
        : args.data) as
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
      args.isToPreventEvents,
      args.transaction,
      args.palmaresTransaction
    );
    for (const result of args.results) {
      if (hasIncludedField) delete (result as any)[parentFieldName];

      (result as any)[relationName] = resultOfChildren;
    }
  }
}

async function resultsFromRelatedModels<
  TModel extends InstanceType<ReturnType<typeof model>>,
  TIncludedModel extends InstanceType<ReturnType<typeof model>>,
  TFields extends FieldsOFModelType<TModel> = readonly (keyof TModel['fields'])[],
  TFieldsOfIncluded extends FieldsOFModelType<TIncludedModel> = readonly (keyof TIncludedModel['fields'])[],
  TSearch extends ModelFieldsWithIncludes<TModel, TIncludes, TFields, false, false, true, true> | undefined = undefined,
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
  TResult extends ModelFieldsWithIncludes<TModel, TIncludes, TFields>[] = ModelFieldsWithIncludes<
    TModel,
    TIncludes,
    TFields
  >[],
  TIsDirectlyRelated extends boolean = false
>(
  engine: Engine,
  modelInstance: TModel,
  includedModelInstance: TIncludedModel,
  includesOfModel: TIncludes,
  includesOfIncluded: TIncludesOfIncluded,
  includesRelationNames: readonly string[] | undefined,
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
    FieldsOfModelOptionsType<TModel> extends string ? FieldsOfModelOptionsType<TModel> : string
  >,
  limit?: number,
  offset?: number | string,
  shouldRemoveIncluded = false,
  orderingOfIncluded?: OrderingOfModelsType<
    FieldsOfModelOptionsType<TIncludedModel> extends string ? FieldsOfModelOptionsType<TIncludedModel> : string
  >,
  limitOfIncluded?: number,
  offsetOfIncluded?: number | string,
  data = undefined as TData,
  isToPreventEvents = false,
  transaction = undefined,
  palmaresTransaction: Transaction | undefined = undefined
) {
  const fieldToUseToGetRelationName = isDirectlyRelated ? 'relationName' : 'relatedName';
  const relatedNamesDirectlyOrIndirectlyRelatedToModel =
    (isDirectlyRelated
      ? modelInstance.directlyRelatedTo[includedModelInstance.originalName]
      : modelInstance.indirectlyRelatedTo[includedModelInstance.originalName]) || [];
  const filteredRelatedNamesDirectlyOrIndirectlyRelatedToModel = Array.isArray(includesRelationNames)
    ? relatedNamesDirectlyOrIndirectlyRelatedToModel.filter((relationName) =>
        includesRelationNames.includes(relationName)
      )
    : relatedNamesDirectlyOrIndirectlyRelatedToModel;
  const associationsOfIncludedModel = isDirectlyRelated
    ? modelInstance.associations[includedModelInstance.originalName] || []
    : includedModelInstance.associations[modelInstance.originalName] || [];

  const promises = filteredRelatedNamesDirectlyOrIndirectlyRelatedToModel.map(async (relationNameOrRelatedName) => {
    const searchForRelatedModel:
      | ModelFieldsWithIncludes<TIncludedModel, TIncludesOfIncluded, TFieldsOfIncluded, false, false, true, true>
      | undefined = search ? (search as any)[relationNameOrRelatedName] : undefined;
    const foreignKeyFieldRelatedToModel = associationsOfIncludedModel.find(
      (association) => association[fieldToUseToGetRelationName] === relationNameOrRelatedName
    );
    const isToGetResultsWithSearch = foreignKeyFieldRelatedToModel && searchForRelatedModel && isSetOperation !== true;

    const isToGetResultsWithoutSearch = foreignKeyFieldRelatedToModel;

    const parametersForResultsFromRelatedModelsWithAndWithoutSearch = {
      relatedField: foreignKeyFieldRelatedToModel as ForeignKeyField,
      modelInstance: modelInstance as TModel,
      includedModelInstance: includedModelInstance as TIncludedModel,
      includesOfModel: includesOfModel as TIncludes,
      includesOfIncluded: includesOfIncluded as TIncludesOfIncluded,
      fieldsOfModel: fieldsOfModel as TFields,
      fieldsOfIncludedModel: fieldsOfIncludedModel as TFieldsOfIncluded,
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
      transaction,
      isToPreventEvents,
      palmaresTransaction,
      resultToMergeWithData,
      data,
    };

    if (isToGetResultsWithSearch) {
      await resultsFromRelatedModelWithSearch(engine, parametersForResultsFromRelatedModelsWithAndWithoutSearch);
    } else if (isToGetResultsWithoutSearch) {
      await resultsFromRelatedModelsWithoutSearch(engine, parametersForResultsFromRelatedModelsWithAndWithoutSearch);
    }
  });
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
export default async function getResultsWithIncludes<
  TModel extends InstanceType<ReturnType<typeof model>>,
  TFields extends FieldsOFModelType<TModel> = readonly (keyof TModel['fields'])[],
  TSearch extends ModelFieldsWithIncludes<TModel, TIncludes, TFields, false, false, true, true> | undefined = undefined,
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
  TResult extends ModelFieldsWithIncludes<TModel, TIncludes, TFields>[] = ModelFieldsWithIncludes<
    TModel,
    TIncludes,
    TFields
  >[]
>(
  engine: Engine,
  modelInstance: TModel,
  fields: TFields,
  includes: TIncludes,
  search: TSearch,
  results: TResult,
  queryData: QueryDataFnType,
  isSetOperation = false,
  isRemoveOperation = false,
  ordering?: OrderingOfModelsType<
    FieldsOfModelOptionsType<TModel> extends string ? FieldsOfModelOptionsType<TModel> : string
  >,
  limit?: number,
  offset?: number | string,
  shouldRemove?: boolean,
  resultsToMergeWithData = undefined as
    | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>
    | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>[]
    | undefined,
  data = undefined as TData,
  isToPreventEvents = false,
  transaction = undefined,
  palmaresTransaction: Transaction | undefined = undefined
) {
  async function fetchResults(
    dataToAdd = undefined as TData,
    resultToMergeWithData = undefined as
      | ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>
      | undefined,
    safeIncludes = includes as TIncludes
  ) {
    const safeSearch = Object.keys(search || {}).length > 0 ? search : undefined;
    const hasIncludes = (safeIncludes || []).length > 0;
    if (hasIncludes && safeIncludes) {
      const include = safeIncludes[0];
      const engineNameToUse = typeof include.engineName === 'string' ? include.engineName : engine.connectionName;
      const includedModelInstance = include.model.default.getModel(engineNameToUse);
      const allFieldsOfIncludedModel = Object.keys(includedModelInstance['fields']);
      const isDirectlyRelatedModel = modelInstance.directlyRelatedTo[includedModelInstance.originalName] !== undefined;
      const relatedNamesDirectlyOrIndirectlyRelatedToModel =
        (isDirectlyRelatedModel
          ? modelInstance.directlyRelatedTo[includedModelInstance.originalName]
          : modelInstance.indirectlyRelatedTo[includedModelInstance.originalName]) || [];
      const isToFetchAnyRelatedNames = Array.isArray(include.relationNames)
        ? relatedNamesDirectlyOrIndirectlyRelatedToModel.some((relatedNameDirectlyOrIndirectlyRelatedToModel) =>
            include.relationNames?.includes(relatedNameDirectlyOrIndirectlyRelatedToModel)
          )
        : true;
      if (isToFetchAnyRelatedNames) {
        const includesForRemove = include as Include<{
          shouldRemove: boolean;
        }>;
        const includesForGet = include as Include<{
          fields?: readonly string[];
          ordering?: readonly (string | `-${string}`)[];
          limit?: number;
          offset?: number | string;
        }>;
        await resultsFromRelatedModels(
          engine,
          modelInstance,
          includedModelInstance,
          safeIncludes.slice(1),
          include.includes,
          include.relationNames,
          (includesForGet.fields ||
            allFieldsOfIncludedModel) as readonly (keyof typeof includedModelInstance['fields'])[],
          fields,
          safeSearch,
          results as TResult,
          isDirectlyRelatedModel,
          isSetOperation,
          isRemoveOperation,
          queryData,
          resultToMergeWithData as ModelFieldsWithIncludes<TModel, TIncludes, FieldsOFModelType<TModel>>,
          shouldRemove,
          ordering,
          limit,
          offset,
          typeof includesForRemove.shouldRemove === 'boolean' ? includesForRemove.shouldRemove : true,
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
          isToPreventEvents,
          transaction,
          palmaresTransaction
        );
        return;
      }
    }
    await callQueryDataFn<
      TModel,
      TFields,
      ModelFieldsWithIncludes<TModel, Includes, TFields, false, false, true, true> | undefined,
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
    >(engine, {
      isSetOperation: isSetOperation,
      isRemoveOperation: isRemoveOperation,
      modelInstance,
      search: safeSearch,
      queryDataFn: queryData,
      fields,
      results,
      ordering,
      limit,
      offset,
      shouldRemove,
      data: dataToAdd,
      transaction: transaction,
      palmaresTransaction: palmaresTransaction,
      resultToMergeWithData,
      isToPreventEvents: isToPreventEvents,
    });
  }

  const safeIncludes: Includes = typeof includes !== 'undefined' ? includes : [];
  const allDataToAdd = Array.isArray(data) ? data : [data];
  const hasDataToAdd = typeof data !== 'undefined' && (typeof data === 'object' || Array.isArray(data));

  if (hasDataToAdd) {
    const promises = Array.from({ length: allDataToAdd.length }).map(async (_, indexOfDataToAdd) => {
      const dataToAdd = allDataToAdd[indexOfDataToAdd];
      const allResultsToMergeWithData = Array.isArray(resultsToMergeWithData)
        ? resultsToMergeWithData
        : [resultsToMergeWithData];
      const resultToMergeWithData = allResultsToMergeWithData[indexOfDataToAdd];
      await fetchResults(dataToAdd, resultToMergeWithData, safeIncludes as TIncludes);
    });
    await Promise.all(promises);
  } else {
    await fetchResults(undefined, undefined, safeIncludes as TIncludes);
  }
}
