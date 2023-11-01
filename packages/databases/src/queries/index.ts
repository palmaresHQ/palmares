import { BaseModel, model } from '../models';
import DatabaseAdapter from '../engine';
import { extractDefaultEventsHandlerFromModel } from './utils';
import { UnmanagedModelsShouldImplementSpecialMethodsException } from './exceptions';
import { Field, ForeignKeyField } from '../models/fields';
import parseSearch from './search';

import type { QueryDataFnType } from './types';
import type Transaction from '../transaction';
import type {
  Includes,
  ModelFieldsWithIncludes,
  FieldsOFModelType,
  OrderingOfModelsType,
  FieldsOfModelOptionsType,
  Include,
} from '../models/types';

/**
 * Used for parsing the values of each field of the result of the query. With that the value that the user expects will be exactly what is returned from the query.
 */
async function parseResults(
  engine: DatabaseAdapter,
  modelName: string,
  modelInstance: InstanceType<ReturnType<typeof model>>,
  fieldsWithParserInModel: string[],
  fields: NonNullable<(typeof BaseModel)['__cachedFields']>,
  data: object
) {
  if (typeof data === 'object') {
    const keysOfData = Object.keys(data);
    const fieldKeysToParse = fieldsWithParserInModel.length > keysOfData.length ? keysOfData : fieldsWithParserInModel;
    await Promise.all(
      fieldKeysToParse.map(async (key) => {
        const value = (data as any)[key];
        const field = fields[key];
        if (field) {
          const fieldHasOutputParser = field.outputParsers.has(engine.connectionName);
          if (fieldHasOutputParser) {
            const parsedValue = await field.outputParsers.get(engine.connectionName)?.({
              value,
              field,
              engine,
              fieldParser: engine.fields.fieldsParser,
              model: modelInstance as InstanceType<ReturnType<typeof model>> & BaseModel,
              modelName: modelName,
            });
            (data as any)[key] = parsedValue;
          }
        }
      })
    );
  }
  return data;
}

/**
 * The data parser is used to parse the data that we will use to save it to the database.
 */
async function parseData(
  engine: DatabaseAdapter,
  useInputParser: boolean,
  modelInstance: InstanceType<ReturnType<typeof model>>,
  data: any
) {
  if (data) {
    const connectionName = engine.connectionName;
    const modelConstructor = modelInstance.constructor as ReturnType<typeof model> & typeof BaseModel;
    const fieldsInModel = modelConstructor._fields();
    const fieldNamesInModel = Object.keys(fieldsInModel);

    const dataAsArray = Array.isArray(data) ? data : [data];

    return Promise.all(
      dataAsArray.map(async (eachDataToFormat) => {
        const fieldsInData = Object.keys(eachDataToFormat);

        const formattedData: Record<string, any> = {};
        await Promise.all(
          fieldsInData.map(async (key) => {
            if (fieldNamesInModel.includes(key)) {
              // This will pretty much format the data so that it can be saved on a custom orm. Sometimes a ORM might define a custom field value. Like Prisma. Prisma uses
              // Decimal.js instead of normal numbers. Because of that we need to guarantee that the data is properly formatted before saving it to the database.
              formattedData[key] =
                fieldsInModel?.[key]?.inputParsers?.has(connectionName) && useInputParser
                  ? await fieldsInModel?.[key]?.inputParsers.get(connectionName)?.({
                      value: eachDataToFormat[key],
                      field: fieldsInModel?.[key] as Field,
                      engine,
                      fieldParser: engine.fields.fieldsParser,
                      model: modelInstance,
                      modelName: modelConstructor.getName(),
                    })
                  : eachDataToFormat[key];
            }
          })
        );

        return formattedData;
      })
    );
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
  >[],
>(
  engine: DatabaseAdapter,
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
  TModel,
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
    | undefined = undefined,
>(
  engine: DatabaseAdapter,
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
  const modelInstanceAsModel = args.modelInstance as InstanceType<ReturnType<typeof model>> & BaseModel;
  const modelConstructor = modelInstanceAsModel.constructor as ReturnType<typeof model> & typeof BaseModel;

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

    const isDataTheSameReceivedThroughEvent = modelInstanceAsModel.stringfiedArgumentsOfEvents.has(
      JSON.stringify(dataForFunction)
    );

    if (isDataTheSameReceivedThroughEvent === false) {
      if (eventEmitter.hasLayer) {
        eventEmitter.emitToChannel(
          engine.databaseSettings?.events.channels ? engine.databaseSettings?.events.channels : eventEmitter.channels,
          `${modelConstructor.hashedName()}.${operationName}`,
          engine.connectionName,
          dataForFunction
        );
      } else {
        eventEmitter.emit(`${modelConstructor.hashedName()}.${operationName}`, engine.connectionName, dataForFunction);
      }
    }
  }
}

/**
 * Calls the query data function to retrieve the results of the query. Query data function can be for either `set`, `remove` or `get` operations
 */
async function callQueryDataFn<
  TModel,
  TFields extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
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
  >[],
>(
  engine: DatabaseAdapter,
  args: {
    isSetOperation?: boolean;
    isRemoveOperation?: boolean;
    useParsers: {
      input: boolean;
      output: boolean;
    };
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

  const modelInstanceAsModel = modelInstance as InstanceType<ReturnType<typeof model>> & BaseModel;
  const modelConstructor = modelInstanceAsModel.constructor as ReturnType<typeof model> & typeof BaseModel;
  const fields = (args.fields || Object.keys(modelInstanceAsModel.fields)) as TFields;

  const mergedSearchForData =
    resultToMergeWithData !== undefined ? Object.assign(search ? search : {}, resultToMergeWithData) : search;

  const mergedData = (
    resultToMergeWithData !== undefined
      ? Array.isArray(data)
        ? await Promise.all(
            data.map(async (dataToAdd) => ({
              ...resultToMergeWithData,
              ...dataToAdd,
            }))
          ) // trust me, doing this async is faster than doing it sync
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
    parseSearch(
      engine,
      modelInstance as InstanceType<ReturnType<typeof model>>,
      mergedSearchForData,
      typeof args.useParsers.input === 'boolean' ? args.useParsers.input : true
    ),
    parseData(engine, args.useParsers.input, modelInstanceAsModel, mergedData),
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
    if (args.isSetOperation && modelInstanceAsModel.options?.onSet) {
      const onSetHandler = extractDefaultEventsHandlerFromModel(modelInstanceAsModel, 'onSet');
      if (onSetHandler) {
        const dataForFunction = await getDataForOnSetOrOnRemoveOptionFunctions('onSet', {
          data: parsedData,
          search: parsedSearch,
          shouldRemove: shouldRemove,
          shouldReturnData: args.shouldReturnData,
        });
        return onSetHandler(dataForFunction as any);
      }
    } else if (args.isRemoveOperation && modelInstanceAsModel.options?.onRemove) {
      const onRemoveHandler = extractDefaultEventsHandlerFromModel(modelInstanceAsModel, 'onRemove');
      if (onRemoveHandler) {
        const dataForFunction = await getDataForOnSetOrOnRemoveOptionFunctions('onRemove', {
          data: parsedData,
          search: parsedSearch,
          shouldRemove: shouldRemove,
          shouldReturnData: args.shouldReturnData,
        });
        return onRemoveHandler(dataForFunction);
      }
    } else if (modelInstanceAsModel.options?.onGet)
      return modelInstanceAsModel.options.onGet({
        search: parsedSearch as any,
        fields: fields as any,
        ordering: parsedOrdering,
        offset,
        limit,
      });
    else
      throw new UnmanagedModelsShouldImplementSpecialMethodsException(
        modelConstructor.getName(),
        args.isRemoveOperation ? 'onRemove' : args.isSetOperation ? 'onSet' : 'onGet'
      );
  }

  const isToFetchExternally = modelInstanceAsModel.options?.managed === false;
  const queryDataResults = isToFetchExternally ? await fetchFromExternalSource() : await fetchFromDatabase();

  await Promise.all([
    fireEventsAfterQueryDataFn(engine, {
      isToPreventEvents: args.isToPreventEvents || false,
      isRemoveOperation: args.isRemoveOperation || false,
      isSetOperation: args.isSetOperation || false,
      modelInstance: modelInstanceAsModel,
      parsedSearch: parsedSearch,
      parsedData: parsedData,
      shouldRemove: args.shouldRemove || false,
      shouldReturnData: args.shouldReturnData || false,
    }),
    storePalmaresTransaction(engine, args.palmaresTransaction, modelConstructor, parsedSearch, queryDataResults),
  ]);

  const modelName = modelConstructor.getName();
  const modelFields = modelConstructor._fields();
  const fieldsToParseOutput = modelConstructor.fieldParsersByEngine.get(engine.connectionName)?.output;
  if (Array.isArray(args.results)) {
    if (args.isSetOperation)
      args.results.push(
        ...(await Promise.all(
          queryDataResults.map(async (eachResult: [boolean, ModelFieldsWithIncludes<TModel, undefined, TFields>]) =>
            args.useParsers.output && Array.isArray(fieldsToParseOutput) && fieldsToParseOutput.length > 0
              ? await parseResults(
                  engine,
                  modelName,
                  modelInstanceAsModel,
                  fieldsToParseOutput,
                  modelFields,
                  eachResult[1]
                )
              : eachResult[1]
          )
        ))
      );
    else {
      if (args.useParsers.output && Array.isArray(fieldsToParseOutput) && fieldsToParseOutput.length > 0) {
        await Promise.all(
          queryDataResults.map(async (eachResult: any) => {
            const parsedOutputData = await parseResults(
              engine,
              modelName,
              modelInstanceAsModel,
              fieldsToParseOutput,
              modelFields,
              eachResult
            );
            args.results?.push(parsedOutputData as any);
          })
        );
      } else {
        args.results.push(...queryDataResults);
      }
    }
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
  TIsDirectlyRelated extends boolean | undefined = undefined,
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
  TModel,
  TIncludedModel,
  TFields extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TFieldsOfIncluded extends FieldsOFModelType<TIncludedModel> = FieldsOFModelType<TIncludedModel>,
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
  >[],
>(
  engine: DatabaseAdapter,
  args: {
    relatedField: TRelatedField;
    modelInstance: TModel;
    useParsers: {
      input: boolean;
      output: boolean;
    };
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
    args.useParsers,
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
        args.useParsers,
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
      useParsers: args.useParsers,
      modelInstance: args.includedModelInstance,
      search: args.searchForRelatedModel,
      queryDataFn: args.queryData,
      shouldReturnData: false,
      shouldRemove: args.shouldRemove,
      ordering: args.ordering as any,
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
  TModel,
  TIncludedModel,
  TFields extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TFieldsOfIncluded extends FieldsOFModelType<TIncludedModel> = FieldsOFModelType<TIncludedModel>,
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
  >[],
>(
  engine: DatabaseAdapter,
  args: {
    relatedField: TRelatedField;
    modelInstance: TModel;
    useParsers: {
      input: boolean;
      output: boolean;
    };
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
      args.useParsers,
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
    const dataToAdd = await Promise.all(
      (Array.isArray(allDataToAdd) ? allDataToAdd : [allDataToAdd]).map(async (dataToMerge: any) =>
        result && (result as any)[parentFieldName]
          ? {
              ...dataToMerge,
              [fieldNameOfRelationInIncludedModel]: (result as any)[parentFieldName],
            }
          : dataToMerge
      )
    );

    await getResultsWithIncludes(
      engine,
      args.includedModelInstance as TIncludedModel,
      args.useParsers,
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
      useParsers: args.useParsers,
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
      args.useParsers,
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
  TModel,
  TIncludedModel,
  TFields extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TFieldsOfIncluded extends FieldsOFModelType<TIncludedModel> = FieldsOFModelType<TIncludedModel>,
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
  TIsDirectlyRelated extends boolean = false,
>(
  engine: DatabaseAdapter,
  modelInstance: TModel,
  useParsers: { input: boolean; output: boolean },
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
  const modelInstanceAsModel = modelInstance as InstanceType<ReturnType<typeof model>> & BaseModel;
  const modelConstructor = modelInstanceAsModel.constructor as ReturnType<typeof model> & typeof BaseModel;
  const includedModelInstanceAsModel = includedModelInstance as InstanceType<ReturnType<typeof model>> & BaseModel;
  const includedModelConstructor = includedModelInstanceAsModel.constructor as ReturnType<typeof model> &
    typeof BaseModel;

  const fieldToUseToGetRelationName = isDirectlyRelated ? 'relationName' : 'relatedName';
  const relatedNamesDirectlyOrIndirectlyRelatedToModel =
    (isDirectlyRelated
      ? modelConstructor.directlyRelatedTo[includedModelConstructor.originalName()]
      : modelConstructor.indirectlyRelatedTo[includedModelConstructor.originalName()]) || [];
  const filteredRelatedNamesDirectlyOrIndirectlyRelatedToModel = Array.isArray(includesRelationNames)
    ? relatedNamesDirectlyOrIndirectlyRelatedToModel.filter((relationName) =>
        includesRelationNames.includes(relationName)
      )
    : relatedNamesDirectlyOrIndirectlyRelatedToModel;
  const associationsOfIncludedModel = isDirectlyRelated
    ? modelConstructor.associations[includedModelConstructor.originalName()] || []
    : includedModelConstructor.associations[modelConstructor.originalName()] || [];

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
      useParsers: useParsers,
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
  TModel,
  TFields extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
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
  >[],
>(
  engine: DatabaseAdapter,
  modelInstance: TModel,
  useParsers: { input: boolean; output: boolean },
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
    const modelInstanceAsModel = modelInstance as InstanceType<ReturnType<typeof model>> & BaseModel;
    const modelConstructor = modelInstanceAsModel.constructor as ReturnType<typeof model> & typeof BaseModel;

    const safeSearch = Object.keys(search || {}).length > 0 ? search : undefined;
    const hasIncludes = (safeIncludes || []).length > 0;
    if (hasIncludes && safeIncludes) {
      const include = safeIncludes[0];
      const engineNameToUse = typeof include.engineName === 'string' ? include.engineName : engine.connectionName;
      const includedModelInstance = include.model.default.getModel(engineNameToUse) as InstanceType<
        ReturnType<typeof model>
      > &
        BaseModel;
      const includedModelConstructor = includedModelInstance.constructor as ReturnType<typeof model> & typeof BaseModel;

      const allFieldsOfIncludedModel = Object.keys(includedModelInstance['fields']);
      const isDirectlyRelatedModel =
        modelConstructor.directlyRelatedTo[includedModelConstructor.originalName()] !== undefined;
      const relatedNamesDirectlyOrIndirectlyRelatedToModel =
        (isDirectlyRelatedModel
          ? modelConstructor.directlyRelatedTo[includedModelConstructor.originalName()]
          : modelConstructor.indirectlyRelatedTo[includedModelConstructor.originalName()]) || [];
      const isToFetchAnyRelatedNames = Array.isArray(include.relationNames)
        ? relatedNamesDirectlyOrIndirectlyRelatedToModel.some(
            (relatedNameDirectlyOrIndirectlyRelatedToModel: string) =>
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
          useParsers,
          includedModelInstance,
          safeIncludes.slice(1),
          include.includes,
          include.relationNames,
          (includesForGet.fields ||
            allFieldsOfIncludedModel) as readonly (keyof (typeof includedModelInstance)['fields'])[],
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
      useParsers,
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
