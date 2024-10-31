import { parseSearchField } from './search';
import { databaseLogger } from '../logging';
import { Manager } from '../models';
import { initialize as define, model } from '../models/model';
import { retrieveInputAndOutputParsersFromFieldAndCache } from '../models/utils';

import type { DatabaseAdapter } from '../engine';
import type {
  AutoField,
  BigAutoField,
  BigIntegerField,
  BooleanField,
  CharField,
  DateField,
  DecimalField,
  EnumField,
  Field,
  ForeignKeyField,
  IntegerField,
  ON_DELETE,
  TextField,
  UuidField
} from '../models/fields';
import type { BaseModel, Model, ModelType } from '../models/model';
import type { ModelFields, ModelOptionsType } from '../models/types';

type ModelsFields<TModel> = TModel extends ModelType<{ fields: infer TFields }, any> | { fields: infer TFields }
  ? TFields
  : never;

type ForeignKeyFieldNameByRelationOrRelatedName<TModel, TRelationOrRelatedName> = {
  [TKey in keyof ModelsFields<TModel> as ModelsFields<TModel>[TKey] extends ForeignKeyField<
    any,
    infer TDefinitions,
    any
  >
    ? TDefinitions['relatedName'] extends TRelationOrRelatedName
      ? TKey
      : TDefinitions['relationName'] extends TRelationOrRelatedName
        ? TKey
        : never
    : never]: any;
};

// This will create an object where they keys are the relationName and the values are either unknown or
// undefined.
// If it's unknown it means it should return the object as it is. If it's undefined the object is optional.
export type ForeignKeyModelsRelationName<TModel, TIncludedModel> = {
  [TKey in keyof ModelsFields<TModel> as ModelsFields<TModel>[TKey] extends ForeignKeyField<
    any,
    infer TDefinitions,
    any
  >
    ? TDefinitions['relatedTo'] extends
        | ((_: any) => infer TRelatedToModel)
        | (() => infer TRelatedToModel)
        | infer TRelatedToModel
      ? TIncludedModel extends abstract new (...args: any) => any
        ? InstanceType<
            TRelatedToModel extends abstract new (...args: any) => any ? TRelatedToModel : never
          > extends InstanceType<TIncludedModel>
          ? TDefinitions['relationName']
          : never
        : InstanceType<
              TRelatedToModel extends abstract new (...args: any) => any ? TRelatedToModel : never
            > extends TIncludedModel
          ? TDefinitions['relationName']
          : never
      : never
    : never]: {
    originalKey: TKey;
    returnType: ModelsFields<TModel>[TKey] extends ForeignKeyField<any, infer TDefinitions, any>
      ? TDefinitions['allowNull'] extends true
        ? 'optionalObject'
        : 'object'
      : 'object';
  };
};

// This will create an object where they keys are the relationName and the values are either unknown, or
// undefined, or unknown[] or undefined[]
// If it's unknown it means it should return the object as it is. If it's undefined the object is optional.
// The unknown[] and undefined[] is the same thing but for arrays
export type ForeignKeyModelsRelatedName<TModel, TIncludedModel> = {
  [TKey in keyof ModelsFields<TModel> as ModelsFields<TModel>[TKey] extends ForeignKeyField<
    any,
    infer TDefinitions,
    any
  >
    ? TDefinitions['relatedTo'] extends
        | ((_: any) => infer TRelatedToModel)
        | (() => infer TRelatedToModel)
        | infer TRelatedToModel
      ? TIncludedModel extends abstract new (...args: any) => any
        ? InstanceType<
            TRelatedToModel extends abstract new (...args: any) => any ? TRelatedToModel : never
          > extends InstanceType<TIncludedModel>
          ? TDefinitions['relatedName']
          : never
        : InstanceType<
              TRelatedToModel extends abstract new (...args: any) => any ? TRelatedToModel : never
            > extends TIncludedModel
          ? TDefinitions['relatedName']
          : never
      : never
    : never]: {
    originalKey: TKey;
    returnType: ModelsFields<TModel>[TKey] extends ForeignKeyField<any, infer TDefinitions, any>
      ? TDefinitions['allowNull'] extends true
        ? TDefinitions['unique'] extends true
          ? 'optionalObject'
          : 'optionalArray'
        : TDefinitions['unique'] extends true
          ? 'object'
          : 'array'
      : 'array';
  };
};

type AddOperation<TField extends Field<any, any, any>> = TField extends
  | Field<any, any, infer TAllowedQueryOperations>
  | ForeignKeyField<any, any, infer TAllowedQueryOperations>
  | AutoField<any, any, infer TAllowedQueryOperations>
  | BigAutoField<any, any, infer TAllowedQueryOperations>
  | BigIntegerField<any, any, infer TAllowedQueryOperations>
  | BooleanField<any, any, infer TAllowedQueryOperations>
  | EnumField<any, any, infer TAllowedQueryOperations>
  | CharField<any, any, infer TAllowedQueryOperations>
  | DateField<any, any, infer TAllowedQueryOperations>
  | UuidField<any, any, infer TAllowedQueryOperations>
  | IntegerField<any, any, infer TAllowedQueryOperations>
  | TextField<any, any, infer TAllowedQueryOperations>
  ? TAllowedQueryOperations
  : never;

type _GetDataFromModel<TModel, TType extends 'create' | 'update' | 'read' = 'read', TIsSearch = false> = {
  [TKey in keyof ModelsFields<TModel>]: ModelsFields<TModel>[TKey] extends
    | Field<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | AutoField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | BigAutoField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | BooleanField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | TextField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | CharField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | UuidField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | IntegerField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | DecimalField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | DateField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | EnumField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | ForeignKeyField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | BigIntegerField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    ? TType extends 'create'
      ? TCreate
      : TType extends 'update'
        ? TUpdate
        : TIsSearch extends true
          ? AddOperation<ModelsFields<TModel>[TKey]> | TRead
          : TRead
    : never;
};

export type GetDataFromModel<TModel, TType extends 'create' | 'update' | 'read' = 'read', TIsSearch = false> = Omit<
  {
    [TKey in keyof _GetDataFromModel<TModel, TType, TIsSearch> as undefined extends _GetDataFromModel<
      TModel,
      TType,
      TIsSearch
    >[TKey]
      ? TKey
      : never]?: _GetDataFromModel<TModel, TType, TIsSearch>[TKey];
  } & {
    [TKey in keyof _GetDataFromModel<TModel, TType, TIsSearch> as undefined extends _GetDataFromModel<
      TModel,
      TType,
      TIsSearch
    >[TKey]
      ? never
      : TKey]: _GetDataFromModel<TModel, TType, TIsSearch>[TKey];
  },
  never
>;

type OrderingOfFields<TFields extends string> = readonly (TFields extends string ? TFields | `-${TFields}` : never)[];

type QuerySetQueryData = {
  fields?: () => {
    toIncludeAfterQuery: string[];
    // This will add a callback that removes the field after the data is retrieved
    toLazyRemoveAfterQuery: string[];
  };
  orderBy?: () => string[];
  limit?: () => number;
  offset?: () => number;
  data?: () => [Set<string>, Record<string, any>[]];
  where?: () => Record<string, any | OrderingOfFields<any>>;
  joins?: () => Record<
    string,
    {
      model: any;
      querySet: QuerySet<any, any, any, any, any, any, any>;
    }
  >;
};

type ReturnTypeOfBaseQuerySetMethods<
  TType extends 'get' | 'set' | 'remove',
  TModel,
  TResult = GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'read'>,
  TUpdate = Partial<
    GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'update'>
  >,
  TCreate = GetDataFromModel<
    TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel,
    'create'
  >,
  TSearch = Partial<
    GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'read', true>
  >,
  TOrder = GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel>,
  THasSearch extends boolean = false,
  THasData extends boolean = false,
  THasRemove extends boolean = false,
  TIsJoin extends boolean = false,
  TAlreadyDefinedRelations = never
> = TType extends 'set'
  ? SetQuerySet<
      TType,
      TModel,
      TResult,
      TUpdate,
      TCreate,
      TSearch,
      TOrder,
      THasSearch,
      THasData,
      THasRemove,
      TIsJoin,
      TAlreadyDefinedRelations
    >
  : TType extends 'remove'
    ? RemoveQuerySet<
        TType,
        TModel,
        TResult,
        TUpdate,
        TCreate,
        TSearch,
        TOrder,
        THasSearch,
        THasData,
        THasRemove,
        TIsJoin,
        TAlreadyDefinedRelations
      >
    : TIsJoin extends true
      ? THasSearch extends true
        ? GetQuerySetIfSearchOnJoin<
            TType,
            TModel,
            TResult,
            TUpdate,
            TCreate,
            TSearch,
            TOrder,
            THasSearch,
            THasData,
            THasRemove,
            TIsJoin,
            TAlreadyDefinedRelations
          >
        : GetQuerySet<
            TType,
            TModel,
            TResult,
            TUpdate,
            TCreate,
            TSearch,
            TOrder,
            THasSearch,
            THasData,
            THasRemove,
            TIsJoin,
            TAlreadyDefinedRelations
          >
      : GetQuerySet<
          TType,
          TModel,
          TResult,
          TUpdate,
          TCreate,
          TSearch,
          TOrder,
          THasSearch,
          THasData,
          THasRemove,
          TIsJoin,
          TAlreadyDefinedRelations
        >;

export class QuerySet<
  TType extends 'get' | 'set' | 'remove',
  TModel,
  _TResult = GetDataFromModel<
    TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel,
    'read'
  >,
  _TUpdate = Partial<
    GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'update'>
  >,
  _TCreate = GetDataFromModel<
    TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel,
    'create'
  >,
  _TSearch = Partial<
    GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'read', true>
  >,
  _TOrder = GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel>,
  THasSearch extends boolean = false,
  _THasData extends boolean = false,
  _THasRemove extends boolean = false,
  TIsJoin extends boolean = false,
  _TAlreadyDefinedRelations = never
> {
  protected __isJoin!: TIsJoin;
  protected __hasSearch!: THasSearch;
  protected __markToRemove = false;
  protected __markToCreateOrUpdate = false;
  protected __type: TType;
  protected __query: QuerySetQueryData;
  protected __cachedData: any;
  protected __model: TModel;

  constructor(model: TModel, type: TType) {
    this.__model = model;
    this.__type = type;
    this.__query = {};
  }

  static new<TModel, TType extends 'set' | 'remove' | 'get' = 'get'>(
    model: TModel,
    type?: TType
  ): TType extends 'remove'
    ? RemoveQuerySet<'remove', TModel>
    : TType extends 'set'
      ? SetQuerySet<'set', TModel>
      : GetQuerySet<'get', TModel> {
    if (type === 'set') return new SetQuerySet(model, 'set') as any;
    if (type === 'remove') return new RemoveQuerySet(model, 'remove') as any;
    return new GetQuerySet(model, 'get') as any;
  }

  protected _makeQuery() {
    const type = this.__type;
    if (type === 'remove') return (this.__model as any).default.remove(() => this as any);
    if (type === 'set') return (this.__model as any).default.set(() => this as any);
    return (this.__model as any).default.get(() => this as any);
  }

  /**
   * The problem: A user select the fields `name` and `address` to be included on the query.
   *
   * When we send the query to the engine, we will get just the fields `name` and `address`, as expected.
   * But if we have a relation, we might need to include the field that relates the data. Let's use the `id` field as
   * an example.
   *
   * So the actual query should include the fields
   * `name`, `address` and `id`.
   *
   * The problem is that the user don't want the `id` field to be included on the query, but we need it to relate the
   * data.
   *
   * What do we do? We lazy remove the field after we use it to relate the data.
   *
   * Notice: We just need this if the user is selecting the fields to be included on the query, if the user selected
   * the field we need to make the relation, that's unnecessary.
   *
   * @param queryset - The query set instance that we are going to append the field to be lazy removed on each record
   * of the retrieved data.
   * @param fieldName - The name of the field that we are going to lazy remove after the query.
   */
  protected __duringQueryAppendFieldToBeLazyRemovedAfterQuery(
    queryset: QuerySet<any, any, any, any, any, any, any, any, any, any, any, any>,
    fieldName: string
  ) {
    if (queryset['__query'].fields) {
      const fieldsOfQueryset = queryset['__query'].fields();
      const doesNotContainFieldOnFields =
        fieldsOfQueryset.toIncludeAfterQuery.concat(fieldsOfQueryset.toLazyRemoveAfterQuery).includes(fieldName) ===
        false;

      if (doesNotContainFieldOnFields)
        queryset['__query'].fields = () => ({
          toIncludeAfterQuery: fieldsOfQueryset.toIncludeAfterQuery,
          toLazyRemoveAfterQuery: fieldsOfQueryset.toLazyRemoveAfterQuery.concat([fieldName])
        });
    }
  }

  protected async __duringQueryFormatWhereClauseAndDoABasicValidation(
    model: typeof BaseModel & typeof Model & ModelType<any, any>,
    translatedModel: any,
    engine: DatabaseAdapter,
    search: any
  ) {
    if (search) {
      const invalidFields = new Map<string, NonNullable<Awaited<ReturnType<typeof parseSearchField>>>>();
      let fieldsInModelInstance = [];
      const fieldsInSearch = Object.keys(search);

      const formattedSearch: Record<string, any> = {};
      const promises = fieldsInSearch.map(async (key) => {
        const modelInstanceFields = model['_fields']();
        fieldsInModelInstance = Object.keys(modelInstanceFields);

        const field = modelInstanceFields[key];
        const { input: inputFieldParser } = retrieveInputAndOutputParsersFromFieldAndCache(engine, model, key, field);
        const fieldInputParserFunction = inputFieldParser
          ? // eslint-disable-next-line ts/require-await
            async (value: any) =>
              inputFieldParser({
                engine,
                field: modelInstanceFields[key]['__getArguments'](),
                fieldParser: engine.fields.fieldsParser,
                translatedModel,
                modelName: model['__getName'](),
                value
              })
          : // eslint-disable-next-line ts/require-await
            async (value: any) => value;
        if (fieldsInModelInstance.includes(key)) {
          const isValidObject = await parseSearchField(
            engine,
            key,
            search[key],
            fieldInputParserFunction,
            translatedModel,
            formattedSearch
          );
          if (isValidObject?.isValid === false) invalidFields.set(key, isValidObject);
        }
      });
      await Promise.all(promises);
      return [invalidFields, formattedSearch];
    }
    return [new Set(), search || {}];
  }

  protected __duringQueryAppendInsertedOrUpdatedDataToQuery(
    queryset: QuerySet<any, any, any, any, any, any, any, any, any, any, any, any>,
    dataInsertedOnParent: any[],
    fieldNameOnRelationToFilter: string
  ) {
    const hasSearch = queryset['__hasSearch'];
    if (queryset['__query'].data) {
      const [existingFieldNamesOnSet, existingDataClauseOnChild] = queryset['__query'].data();

      if (existingDataClauseOnChild.length > 0) {
        queryset['__query'].data = () => {
          // Update clause,
          if (hasSearch) {
            return [existingFieldNamesOnSet, existingDataClauseOnChild];
          }

          // Create clause
          const dataToInsert = [];
          for (const valueToAddOnRelationField of dataInsertedOnParent) {
            for (const dataToAddOrUpdate of existingDataClauseOnChild) {
              dataToAddOrUpdate[fieldNameOnRelationToFilter] = valueToAddOnRelationField;
              dataToInsert.push({ ...dataToAddOrUpdate });
            }
          }
          existingFieldNamesOnSet.add(fieldNameOnRelationToFilter);
          return [existingFieldNamesOnSet, dataToInsert as Record<string, any>[]];
        };
      }
    }
  }

  /**
   * The model might not be properly because it's lazy loaded, so we need to check if
   * we have input and output parsers for all of the fields that we are trying to save or retrieve.
   *
   * We load the input and output parsers as we need to use on the fields. This gets appended on searches,
   * data insertion and data retrieval. It's lazy loaded, this means, we just get the parsers when we are
   * using the fields. If the search is searching for the 'id' field, we will cache JUST the 'id' field
   * input and output parsers. You understand? Its progressively adding more data, the more data you need.
   *
   * Because of that we need to check if all the data we are trying to save or retrieve has a parser cached.
   * If not we guarantee to retrieve and cache it.
   */
  protected __duringQueryCompareObjectWithInputAndOutputParsersOnModelCache(
    engine: DatabaseAdapter,
    model: typeof BaseModel & typeof Model & ModelType<any, any>,
    keysYouAreTryingToSaveOrRetrieve: Set<string>,
    inputOrOutput: 'input' | 'output'
  ) {
    // When getting the data from the model, we need to check if the field has a parser for the engine.
    // First we check if all field parsers have been cached, because if not we need to parse and cache them.
    // Then we can check if the field has an input parser, and if so we need to parse the data before sending it
    let parsedFieldParsers = model['__fieldParsersByEngine'].get(engine.connectionName) || {
      input: new Set(),
      output: new Set(),
      toIgnore: new Set()
    };
    const allFieldParsersAsArray = Array.from(parsedFieldParsers.input)
      .concat(Array.from(parsedFieldParsers.output))
      .concat(Array.from(parsedFieldParsers.toIgnore));
    const allFieldParsers = new Set(allFieldParsersAsArray);
    const differenceBetweenFieldsOnQueryAndFieldsOnModel = new Set(
      Array.from(keysYouAreTryingToSaveOrRetrieve).filter((fieldName) => !allFieldParsers.has(fieldName))
    );

    if (differenceBetweenFieldsOnQueryAndFieldsOnModel.size > 0) {
      const modelFields = model['_fields']();
      for (const field of differenceBetweenFieldsOnQueryAndFieldsOnModel) {
        retrieveInputAndOutputParsersFromFieldAndCache(engine, model, field, modelFields[field]);
      }
    }
    parsedFieldParsers = model['__fieldParsersByEngine'].get(engine.connectionName) || {
      input: new Set(),
      output: new Set(),
      toIgnore: new Set()
    };

    const fieldsWithInputOrOutputParser = new Set(
      Array.from(keysYouAreTryingToSaveOrRetrieve).filter((field) => parsedFieldParsers[inputOrOutput].has(field))
    );

    return fieldsWithInputOrOutputParser;
  }

  protected async __duringQueryActuallyQueryTheDatabase(
    model: typeof BaseModel & typeof Model & ModelType<any, any>,
    engine: DatabaseAdapter,
    queryset: QuerySet<any, any, any, any, any, any, any, any, any, any, any, any>,
    args: {
      cachedData: any;
      relations?: {
        /**
         * When the join contains a queryset WITHOUT a where clause, we should query the parent
         * first and then query the Child.
         *
         * There are two maps:
         * ```newMap``` - This assigns each data to the value of `fieldNameToGetRelationData` from each record.
         * ```mapTo``` - On the related model, this assigns each data to the array or object value of
         * `relationOrRelatedName`
         */
        mappingsFromJoinsWithoutWhereClause: {
          newMap?: Map<string, any[]>;
          mapTo?: Map<string, any[]>;
        };
        /**
         * When the join contains a queryset WITH a where clause, we should query the child first and then query the
         * parent.
         */
        relationsFromJoinsWithWhereClause: {
          newMap?: Map<string, Map<string, any>>;
          mapTo?: Map<string, Map<string, any>>;
        };
        /**
         * The actual relationName or relatedName from the ForeignKeyField.
         */
        relationOrRelatedName: string;
        /**
         * If isUnique is true we append an object, otherwise we append an array. For direct relation this should
         * always be true.
         */
        isUnique: boolean;
        /**
         * The name of the field on the current model that relates the data. For example if we have a `User` model
         * that relates to the `Company` model, through the `companyId` field that exists on the `User` model.
         *
         * For a query like:
         * ```
         *  const company = await Company.default.get((qs) => qs.join(User, 'usersOfCompany', (qs) => qs.where({
         *    name: 'test'
         *  }));
         * ```
         *
         * Notice that we have a `where` clause on the join. This means we should query User first, and after
         * we should query Company. So the `fieldNameToGetRelationData` should be `companyId`.
         *
         * If we have a query like:
         * ```
         * const company = await Company.default.get((qs) => qs.join(User, 'usersOfCompany'));
         * ```
         *
         * We should query Company first, and after we should query User. So the `fieldNameToGetRelationData` should
         * be `id`.
         */
        fieldNameToGetRelationData: string;
        /**
         * Kinda the same as `fieldNameToGetRelationData`, but the other way around.
         *
         * On the example gave on `fieldNameToGetRelationData`, the
         * `fieldNameThatMustBeIncludedInTheQueryToRelateTheData`would be `id` on the first example, and `companyId`
         * on the second example.
         */
        fieldNameThatMustBeIncludedInTheQueryToRelateTheData: string;
        /**
         * This set is transformed to an array and appended to an `in` clause on the query.
         */
        valuesToFilterOnRelatedModelAsSet?: Set<any>;
      };
    }
  ) {
    if (this.__cachedData instanceof Promise) return this.__cachedData;
    const query: any = {};

    const translatedModel = await model.default.getInstance(engine.connectionName);
    let fieldsToLazyRemoveAfterQuery: string[] = [];
    if (queryset['__query'].fields) {
      const existingFields = queryset['__query'].fields();
      fieldsToLazyRemoveAfterQuery = existingFields.toLazyRemoveAfterQuery;
      query['fields'] = existingFields.toIncludeAfterQuery.concat(existingFields.toLazyRemoveAfterQuery);
    }
    if (queryset['__query'].data) {
      const [allFieldsOnDataAsSet, dataToSaveOrUpdate] = queryset['__query'].data();
      const fieldsWithInputParser = this.__duringQueryCompareObjectWithInputAndOutputParsersOnModelCache(
        engine,
        model,
        allFieldsOnDataAsSet,
        'input'
      );

      if (fieldsWithInputParser.size > 0) {
        const fieldsOfModel = model['_fields']();
        for (const field of fieldsWithInputParser) {
          const { input } = retrieveInputAndOutputParsersFromFieldAndCache(engine, model, field, fieldsOfModel[field]);
          for (const data of dataToSaveOrUpdate) {
            data[field] = await input!({
              engine,
              field: fieldsOfModel[field]['__getArguments'](),
              fieldParser: engine.fields.fieldsParser,
              translatedModel,
              modelName: model['__getName'](),
              value: data[field]
            });
          }
        }
      }
      query['data'] = dataToSaveOrUpdate;
    }
    if (queryset['__query'].orderBy) query['ordering'] = queryset['__query'].orderBy();
    if (queryset['__query'].limit) query['limit'] = queryset['__query'].limit();
    if (queryset['__query'].offset) query['offset'] = queryset['__query'].offset();
    if (queryset['__query'].where) {
      const [invalidFields, formattedSearch] = await this.__duringQueryFormatWhereClauseAndDoABasicValidation(
        model,
        translatedModel,
        engine,
        queryset['__query'].where()
      );

      // Return the empty array if the search is invalid. We do this because empty `in` clauses will never reach the
      // Engine, and return early.
      if (invalidFields.size > 0) {
        this.__cachedData = Promise.resolve([]);
        databaseLogger.logMessage('QUERY_NOT_PROPERLY_SET', {
          modelName: model['__getName'](),
          invalidFields
        });
        return this.__cachedData;
      }

      query['search'] = formattedSearch;
    }

    const queryPerOperation = async () => {
      if (queryset.__type === 'set' && queryset.__markToCreateOrUpdate) {
        const isUpdate = queryset['__hasSearch'] === true;
        const dataToSendToEngine = isUpdate
          ? Array.isArray(query['data'][0])
            ? query['data'][0]
            : [query['data'][0]]
          : Array.isArray(query['data'])
            ? query['data']
            : [query['data']];

        const allDataAddedOrUpdated = await engine.query.set.queryData(engine, {
          search: query['search'],
          modelOfEngineInstance: translatedModel,
          data: dataToSendToEngine
        });
        return allDataAddedOrUpdated.map((data: any) => data[1]);
      }
      if (queryset.__type === 'remove' && queryset.__markToRemove) {
        return engine.query.remove.queryData(engine, {
          search: query['search'],
          modelOfEngineInstance: translatedModel
        });
      }

      return engine.query.get.queryData(engine, {
        modelOfEngineInstance: translatedModel,
        search: query['search'],
        fields: query['fields'],
        ordering: query['ordering'],
        limit: query['limit'],
        offset: query['offset']
      });
    };

    this.__cachedData = args.cachedData ? args.cachedData : queryPerOperation();

    let shouldLoopThroughData =
      fieldsToLazyRemoveAfterQuery.length > 0 ||
      // eslint-disable-next-line ts/no-unnecessary-condition
      args.relations?.mappingsFromJoinsWithoutWhereClause?.mapTo instanceof Map ||
      // eslint-disable-next-line ts/no-unnecessary-condition
      args.relations?.mappingsFromJoinsWithoutWhereClause?.newMap instanceof Map ||
      // eslint-disable-next-line ts/no-unnecessary-condition
      args.relations?.relationsFromJoinsWithWhereClause?.mapTo instanceof Map ||
      // eslint-disable-next-line ts/no-unnecessary-condition
      args.relations?.relationsFromJoinsWithWhereClause?.newMap instanceof Map;
    const awaitedCachedData = await this.__cachedData;
    let fieldsWithOutputParserAsArray = [] as string[];

    // Appending the output parser to the data and rechecking if we need to loop through the data again.
    if (Array.isArray(awaitedCachedData) && awaitedCachedData.length > 0) {
      const fieldsWithOutputParser = this.__duringQueryCompareObjectWithInputAndOutputParsersOnModelCache(
        engine,
        model,
        new Set(Object.keys(awaitedCachedData[0])),
        'output'
      );
      if (fieldsWithOutputParser.size > 0) {
        shouldLoopThroughData = true;
        fieldsWithOutputParserAsArray = Array.from(fieldsWithOutputParser);
      }
    }

    if (shouldLoopThroughData) {
      for (const dataItem of awaitedCachedData) {
        await Promise.all(
          fieldsWithOutputParserAsArray.map(async (field) => {
            const { output } = retrieveInputAndOutputParsersFromFieldAndCache(
              engine,
              model,
              field,
              model['_fields']()[field]
            );
            dataItem[field] = await output!({
              engine,
              field: model['_fields']()[field]['__getArguments'](),
              fieldParser: engine.fields.fieldsParser,
              translatedModel,
              modelName: model['__getName'](),
              value: dataItem[field]
            });
          })
        );

        // Instead of the actual field, we cache the value of the field, and the field is transformed to a getter
        // When we get the value of the field, it's automatically removed from the object.
        for (const fieldToLazyRemove of fieldsToLazyRemoveAfterQuery) {
          const existingPropertyValue = dataItem[fieldToLazyRemove];
          Object.defineProperty(dataItem, fieldToLazyRemove, {
            get() {
              delete dataItem[fieldToLazyRemove];
              return existingPropertyValue;
            }
          });
        }

        if (args.relations) {
          let valueOfFieldOnRelationToFilter = undefined;
          const relationOrRelatedName = args.relations.relationOrRelatedName;

          if (args.relations.fieldNameToGetRelationData)
            valueOfFieldOnRelationToFilter = dataItem[args.relations.fieldNameToGetRelationData];

          // Assign unique value to the set so we can filter the data on the related model using the `in` clause.
          args.relations.valuesToFilterOnRelatedModelAsSet?.add(valueOfFieldOnRelationToFilter);

          // eslint-disable-next-line ts/no-unnecessary-condition
          if (args.relations?.mappingsFromJoinsWithoutWhereClause?.newMap) {
            if (!args.relations.mappingsFromJoinsWithoutWhereClause.newMap.has(valueOfFieldOnRelationToFilter))
              args.relations.mappingsFromJoinsWithoutWhereClause.newMap.set(valueOfFieldOnRelationToFilter, []);
            args.relations.mappingsFromJoinsWithoutWhereClause.newMap
              .get(valueOfFieldOnRelationToFilter)
              ?.push(dataItem);
          }

          // eslint-disable-next-line ts/no-unnecessary-condition
          if (args.relations?.mappingsFromJoinsWithoutWhereClause?.mapTo) {
            const parentDataToAppendRelationTo =
              args.relations.mappingsFromJoinsWithoutWhereClause.mapTo.get(valueOfFieldOnRelationToFilter) || [];

            for (const toAssign of parentDataToAppendRelationTo) {
              if (args.relations.isUnique) toAssign[relationOrRelatedName] = dataItem;
              else {
                if (Array.isArray(toAssign[relationOrRelatedName]) === false) toAssign[relationOrRelatedName] = [];
                toAssign[relationOrRelatedName].push(dataItem);
              }
            }
          }

          // eslint-disable-next-line ts/no-unnecessary-condition
          if (args.relations?.relationsFromJoinsWithWhereClause?.newMap) {
            const fieldNameWithDataFromCurrentModel =
              args.relations.fieldNameThatMustBeIncludedInTheQueryToRelateTheData;

            if (!args.relations.relationsFromJoinsWithWhereClause.newMap.has(fieldNameWithDataFromCurrentModel))
              args.relations.relationsFromJoinsWithWhereClause.newMap.set(fieldNameWithDataFromCurrentModel, new Map());

            if (
              !args.relations.relationsFromJoinsWithWhereClause.newMap
                .get(fieldNameWithDataFromCurrentModel)
                ?.has(valueOfFieldOnRelationToFilter)
            ) {
              const relationForFieldName = args.relations.relationsFromJoinsWithWhereClause.newMap.get(
                fieldNameWithDataFromCurrentModel
              ) as Map<string, any>;

              relationForFieldName.set(valueOfFieldOnRelationToFilter, {
                [relationOrRelatedName]: args.relations.isUnique ? undefined : []
              });
            }

            if (args.relations.isUnique)
              (
                args.relations.relationsFromJoinsWithWhereClause.newMap.get(fieldNameWithDataFromCurrentModel) as Map<
                  string,
                  any
                >
              ).get(valueOfFieldOnRelationToFilter)[relationOrRelatedName] = dataItem;
            else
              args.relations.relationsFromJoinsWithWhereClause.newMap
                .get(fieldNameWithDataFromCurrentModel)
                ?.get(valueOfFieldOnRelationToFilter)
                [relationOrRelatedName].push(dataItem);
          }

          // eslint-disable-next-line ts/no-unnecessary-condition
          if (args.relations?.relationsFromJoinsWithWhereClause?.mapTo) {
            for (const [field, mapOfRelationsOfThatField] of args.relations.relationsFromJoinsWithWhereClause.mapTo) {
              const valueOfField = dataItem[field];
              const dataToAdd = mapOfRelationsOfThatField.get(valueOfField);
              if (dataToAdd) {
                for (const [relationName, data] of Object.entries(dataToAdd)) {
                  dataItem[relationName] = data;
                }
              }
            }
          }
        }
      }
    }

    return this.__cachedData;
  }

  /**
   * To Query the database we need to do the hard work ourselves.
   *
   * Because the way palmares work, we can't rely on native relations of the database. At the same
   * time we need to minimize the number of hits we do the database. To do that we do the hardwork ourselves.
   * This hardwork involves doing a inner join-like query in memory. What we do is:
   *
   * - If there is a search on the join we need to fetch first the data from the join before we fetch the data from
   * the parent model.
   * - If there is no search on the join we query the parent model first and then we query the joins.
   *
   * This is recursive, so more joins you have, more queries will be made. In order to minimize the number of queries
   * we use the `in` clause on the query to filter the data. At the same time we need to minimize the number of loops
   * we do on the retrieved data. For that we rely on Maps, there are 2 types:
   *
   * - Mappings - Those are used when you query the parent first and then the child.
   * - Relations - Those are used when you query the child first and then the parent.
   */
  protected async __queryTheData(
    model: {
      new (...args: any[]): any;
    },
    engine: DatabaseAdapter,
    args?: {
      relations: Parameters<
        QuerySet<any, any, any, any, any, any, any, any, any, any>['__duringQueryActuallyQueryTheDatabase']
      >[3]['relations'];
    }
  ) {
    const toFilterOnChildModelAsSet = new Set();
    const mappings = new Map<string, any>();

    const baseModelAsModel = model as typeof BaseModel & typeof Model & ModelType<any, any>;
    baseModelAsModel['_fields']();

    const relations = new Map<string, any>();

    const toQueryAfterBase = [];
    const toQueryBeforeBase = [];

    const joins = this.__query.joins?.();

    const joinsEntries = joins ? Object.entries(joins) : [];
    for (const joinsData of joinsEntries) {
      const [relationOrRelatedName, { model, querySet }] = joinsData;

      /**
       * From here  to the `isUnique` line variable, is just to guarantee the model is always properly initialized
       * when making the query. We can't rely or guarantee the happy path of it always being initialized when making
       * the query.
       */
      const joinedModel = model as typeof BaseModel & typeof Model & ModelType<any, any>;
      const joinedModelName = joinedModel['__getName']();
      const directlyRelated = baseModelAsModel['__directlyRelatedTo'];
      const indirectlyRelated = baseModelAsModel['__indirectlyRelatedTo'];
      // eslint-disable-next-line ts/no-unnecessary-condition
      const isDirectlyRelated = (directlyRelated?.[joinedModelName] || []).includes(relationOrRelatedName);
      // eslint-disable-next-line ts/no-unnecessary-condition
      let isIndirectlyRelated = (indirectlyRelated?.[joinedModelName] || []).includes(relationOrRelatedName);

      const isNotDirectlyRelatedNorIndirectRelated = !isDirectlyRelated && !isIndirectlyRelated;
      // The field/model might not have been initialized yet when it reach out here
      // (Since the database is designed to be lazy loaded). So we attach the data ourselves.
      if (isNotDirectlyRelatedNorIndirectRelated) {
        const fieldsOfModel = joinedModel['_fields']();
        // eslint-disable-next-line ts/no-unnecessary-condition
        isIndirectlyRelated = (baseModelAsModel['__indirectlyRelatedTo']?.[joinedModelName] || []).includes(
          relationOrRelatedName
        );
        if (isIndirectlyRelated === false) {
          for (const [fieldName, probablyAForeignKeyField] of Object.entries(fieldsOfModel)) {
            const isAForeignKeyFieldAndIsRelatedName =
              (probablyAForeignKeyField as any)['$$type'] === '$PForeignKeyField' &&
              (probablyAForeignKeyField as ForeignKeyField<any, any>)['__relatedName'] === relationOrRelatedName;

            if (isAForeignKeyFieldAndIsRelatedName) {
              isIndirectlyRelated = true;
              const foreignKeyField = probablyAForeignKeyField as ForeignKeyField<any, any>;
              foreignKeyField['__attachRelationsToModel'](foreignKeyField, fieldName, joinedModel, baseModelAsModel);
              break;
            }
          }
        }
      }
      if (isDirectlyRelated === false && isIndirectlyRelated === false)
        throw new Error(`The relation ${relationOrRelatedName} is not a relation or related name`);

      if (querySet['__hasSearch'] as boolean) (this as any)['__hasSearch'] = true;
      else if (this['__hasSearch']) (querySet as any)['__hasSearch'] = true;

      const fieldNameOnRelationToFilter = isDirectlyRelated
        ? baseModelAsModel['__associations'][joinedModelName].byRelationName.get(relationOrRelatedName)?.['__toField']
        : baseModelAsModel['__associations'][joinedModelName].byRelatedName.get(relationOrRelatedName)?.['__fieldName'];
      const fromCurrentModelsFieldData = isDirectlyRelated
        ? baseModelAsModel['__associations'][joinedModelName].byRelationName.get(relationOrRelatedName)?.['__fieldName']
        : baseModelAsModel['__associations'][joinedModelName].byRelatedName.get(relationOrRelatedName)?.['__toField'];
      const isUnique = isDirectlyRelated
        ? true
        : baseModelAsModel['__associations'][joinedModelName].byRelatedName.get(relationOrRelatedName)?.['__unique'] ||
          false;

      // We need to check by the `where` clause on the query, because what changes the ordering
      const shouldBeQueriedBeforeBase =
        (querySet['__hasSearch'] as boolean) || // For GET queries
        (querySet['__query'].data !== undefined && (querySet['__hasSearch'] as boolean)) || // For Update SET queries
        (querySet['__query'].data !== undefined && isDirectlyRelated === true); // For Creates SET queries

      if (shouldBeQueriedBeforeBase)
        toQueryBeforeBase.push(async () => {
          this.__duringQueryAppendFieldToBeLazyRemovedAfterQuery(querySet, fieldNameOnRelationToFilter);

          const parentWhereClause = this['__query'].where ? this['__query'].where() : {};
          const toFilterOnParentModelAsSet = new Set();
          const hasTheInFilterOnFieldNameOnRelationToFilter =
            (parentWhereClause[fromCurrentModelsFieldData]?.['in'] || []).length > 0;

          if (hasTheInFilterOnFieldNameOnRelationToFilter) {
            querySet['__query'].where = () => ({
              ...(querySet['__query'].where?.() || {}),
              [fieldNameOnRelationToFilter]: { in: parentWhereClause[fromCurrentModelsFieldData]['in'] }
            });
          }

          await querySet['__queryTheData'](joinedModel, engine, {
            relations: {
              isUnique,
              fieldNameToGetRelationData: fieldNameOnRelationToFilter,
              relationOrRelatedName,
              fieldNameThatMustBeIncludedInTheQueryToRelateTheData: fromCurrentModelsFieldData,
              valuesToFilterOnRelatedModelAsSet: toFilterOnParentModelAsSet,
              relationsFromJoinsWithWhereClause: {
                newMap: relations,
                mapTo: args?.relations?.relationsFromJoinsWithWhereClause.mapTo
              },
              mappingsFromJoinsWithoutWhereClause: {
                mapTo: args?.relations?.mappingsFromJoinsWithoutWhereClause.mapTo
              }
            }
          });

          if (querySet['__hasSearch'] as boolean) (this as any)['__hasSearch'] = true;

          const formattedToFilterOnParentModelAsSet = Array.from(toFilterOnParentModelAsSet);

          this.__duringQueryAppendFieldToBeLazyRemovedAfterQuery(this, fromCurrentModelsFieldData);
          this.__duringQueryAppendInsertedOrUpdatedDataToQuery(
            this,
            formattedToFilterOnParentModelAsSet,
            fromCurrentModelsFieldData
          );

          const doesNotHaveADifferentWhereClauseForField =
            parentWhereClause[fromCurrentModelsFieldData] === undefined ||
            Array.isArray(parentWhereClause[fromCurrentModelsFieldData]?.['in']);
          const shouldAppendWhereClauseOnParent =
            (this['__query'].data !== undefined && this['__hasSearch']) || this['__query'].data === undefined;
          if (shouldAppendWhereClauseOnParent && doesNotHaveADifferentWhereClauseForField) {
            const currentWhereClause = this['__query'].where ? this['__query'].where() : {};
            this['__query'].where = () => ({
              ...currentWhereClause,
              [fromCurrentModelsFieldData]: { in: formattedToFilterOnParentModelAsSet }
            });
          }
        });
      else {
        this.__duringQueryAppendFieldToBeLazyRemovedAfterQuery(this, fromCurrentModelsFieldData);

        toQueryAfterBase.push(async () => {
          await this.__duringQueryActuallyQueryTheDatabase(baseModelAsModel, engine, this, {
            cachedData: undefined,
            relations: {
              fieldNameThatMustBeIncludedInTheQueryToRelateTheData: fieldNameOnRelationToFilter,
              fieldNameToGetRelationData: fromCurrentModelsFieldData,
              isUnique: isUnique,
              mappingsFromJoinsWithoutWhereClause: {
                newMap: mappings,
                mapTo: args?.relations?.mappingsFromJoinsWithoutWhereClause.mapTo
              },
              relationsFromJoinsWithWhereClause: {
                newMap: args?.relations?.relationsFromJoinsWithWhereClause.newMap,
                mapTo: relations
              },
              valuesToFilterOnRelatedModelAsSet: toFilterOnChildModelAsSet,
              relationOrRelatedName: (args?.relations?.relationOrRelatedName || undefined) as string
            }
          });

          const formattedToFilterOnChildModelAsSet = Array.from(toFilterOnChildModelAsSet);

          this.__duringQueryAppendInsertedOrUpdatedDataToQuery(
            querySet,
            formattedToFilterOnChildModelAsSet,
            fieldNameOnRelationToFilter
          );

          const existingWhereClauseOnChild = querySet['__query'].where?.() || {};
          // If it's creating a new data, we should not append the where clause on the child model
          const shouldAppendWhereClauseOnChild =
            (querySet['__query'].data !== undefined && (querySet['__hasSearch'] as boolean)) ||
            querySet['__query'].data === undefined;

          if (shouldAppendWhereClauseOnChild)
            querySet['__query'].where = () => ({
              ...existingWhereClauseOnChild,
              [fieldNameOnRelationToFilter]: { in: formattedToFilterOnChildModelAsSet }
            });

          this.__duringQueryAppendFieldToBeLazyRemovedAfterQuery(querySet, fieldNameOnRelationToFilter);

          await querySet['__queryTheData'](joinedModel, engine, {
            relations: {
              fieldNameThatMustBeIncludedInTheQueryToRelateTheData: fromCurrentModelsFieldData,
              fieldNameToGetRelationData: fieldNameOnRelationToFilter,
              isUnique,
              relationOrRelatedName,
              mappingsFromJoinsWithoutWhereClause: {
                mapTo: mappings
              },
              relationsFromJoinsWithWhereClause: {
                mapTo: args?.relations?.relationsFromJoinsWithWhereClause.mapTo
              }
            }
          });
        });
      }
    }

    if (toQueryBeforeBase.length > 0) await Promise.all(toQueryBeforeBase.map((queryBeforeBase) => queryBeforeBase()));
    if (toQueryAfterBase.length > 0) await Promise.all(toQueryAfterBase.map((queryAfterBase) => queryAfterBase()));
    else {
      await this.__duringQueryActuallyQueryTheDatabase(baseModelAsModel, engine, this, {
        cachedData: undefined,
        relations: {
          ...((args?.relations || {}) as any),
          relationsFromJoinsWithWhereClause: {
            mapTo: relations,
            newMap: args?.relations?.relationsFromJoinsWithWhereClause.newMap as any
          } as any
        }
      });
    }

    return this.__cachedData;
  }
}
export class CommonQuerySet<
  TType extends 'get' | 'set' | 'remove',
  TModel,
  TResult = GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'read'>,
  TUpdate = Partial<
    GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'update'>
  >,
  TCreate = ModelFields<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel>,
  TSearch = Partial<
    GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'read', true>
  >,
  TOrder = GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel>,
  THasSearch extends boolean = false,
  THasData extends boolean = false,
  THasRemove extends boolean = false,
  TIsJoin extends boolean = false,
  TAlreadyDefinedRelations = never
> extends QuerySet<
  TType,
  TModel,
  TResult,
  TUpdate,
  TCreate,
  TSearch,
  TOrder,
  THasSearch,
  THasData,
  THasRemove,
  TIsJoin,
  TAlreadyDefinedRelations
> {
  /**
   * Join a model with another model, you can also pass a callback to make nested queries.
   *
   * @param model - The model you want to join with.
   * @param relationName - The name of the relation you want to join. Let's say the model
   * you are joining with is called `Profile` on the `User` model, and there are two foreignKeyFields on
   * the `User` model that points to the `Profile` model, one called `profileId` and the other called `profileId2`.
   * The relationName would be `profileId` or `profileId2`.
   * IMPORTANT: If the relationName is not inferred from typescript it's invalid and you cannot relate the data.
   * @param queryCallback - A callback to make nested queries or to filter through a nested relation
   */
  join<
    TIncludedModel,
    TRelationName extends keyof TAllRelationNames,
    TAllRelationNames extends Record<
      string,
      {
        originalKey: string;
        returnType: 'array' | 'object' | 'optionalArray' | 'optionalObject';
      }
    > = ForeignKeyModelsRelationName<
      TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel,
      TIncludedModel extends abstract new (...args: any) => any ? InstanceType<TIncludedModel> : TIncludedModel
    > &
      ForeignKeyModelsRelatedName<
        TIncludedModel extends abstract new (...args: any) => any ? InstanceType<TIncludedModel> : TIncludedModel,
        TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel
      >,
    TNestedQuerySet extends (
      querySet: ReturnTypeOfBaseQuerySetMethods<
        TType,
        TIncludedModel extends abstract new (...args: any) => any ? InstanceType<TIncludedModel> : TIncludedModel,
        GetDataFromModel<TIncludedModel>,
        Omit<
          Partial<GetDataFromModel<TIncludedModel, 'update'>>,
          | keyof ForeignKeyFieldNameByRelationOrRelatedName<TModel, TRelationName>
          | keyof ForeignKeyFieldNameByRelationOrRelatedName<TIncludedModel, TRelationName>
        >,
        Omit<
          GetDataFromModel<TIncludedModel, 'create'>,
          | keyof ForeignKeyFieldNameByRelationOrRelatedName<TModel, TRelationName>
          | keyof ForeignKeyFieldNameByRelationOrRelatedName<TIncludedModel, TRelationName>
        >,
        Partial<GetDataFromModel<TIncludedModel, 'read', true>>,
        GetDataFromModel<TIncludedModel>,
        THasSearch,
        THasData,
        THasRemove,
        true,
        never
      >
    ) =>
      | ReturnTypeOfBaseQuerySetMethods<
          TType,
          TIncludedModel extends abstract new (...args: any) => any ? InstanceType<TIncludedModel> : TIncludedModel,
          GetDataFromModel<TIncludedModel>,
          Omit<
            Partial<GetDataFromModel<TIncludedModel, 'update'>>,
            | keyof ForeignKeyFieldNameByRelationOrRelatedName<TModel, TRelationName>
            | keyof ForeignKeyFieldNameByRelationOrRelatedName<TIncludedModel, TRelationName>
          >,
          Omit<
            GetDataFromModel<TIncludedModel, 'create'>,
            | keyof ForeignKeyFieldNameByRelationOrRelatedName<TModel, TRelationName>
            | keyof ForeignKeyFieldNameByRelationOrRelatedName<TIncludedModel, TRelationName>
          >,
          Partial<GetDataFromModel<TIncludedModel, 'read', true>>,
          GetDataFromModel<TIncludedModel>,
          boolean,
          boolean,
          boolean,
          boolean,
          never
        >
      | QuerySet<
          TType,
          TIncludedModel extends abstract new (...args: any) => any ? InstanceType<TIncludedModel> : TIncludedModel,
          GetDataFromModel<TIncludedModel>,
          Omit<
            Partial<GetDataFromModel<TIncludedModel, 'update'>>,
            TAllRelationNames[TRelationName extends keyof TAllRelationNames ? TRelationName : never]['originalKey']
          >,
          Omit<
            GetDataFromModel<TIncludedModel, 'create'>,
            TAllRelationNames[TRelationName extends keyof TAllRelationNames ? TRelationName : never]['originalKey']
          >,
          Partial<GetDataFromModel<TIncludedModel, 'read', true>>,
          GetDataFromModel<TIncludedModel>,
          boolean,
          boolean,
          boolean,
          boolean,
          never
        > = (
      querySet: ReturnTypeOfBaseQuerySetMethods<
        TType,
        TIncludedModel extends abstract new (...args: any) => any ? InstanceType<TIncludedModel> : TIncludedModel,
        GetDataFromModel<TIncludedModel>,
        Omit<
          Partial<GetDataFromModel<TIncludedModel, 'update'>>,
          TAllRelationNames[TRelationName extends keyof TAllRelationNames ? TRelationName : never]['originalKey']
        >,
        Omit<
          GetDataFromModel<TIncludedModel, 'create'>,
          TAllRelationNames[TRelationName extends keyof TAllRelationNames ? TRelationName : never]['originalKey']
        >,
        Partial<GetDataFromModel<TIncludedModel, 'read', true>>,
        GetDataFromModel<TIncludedModel>,
        THasSearch,
        THasData,
        THasRemove,
        true,
        never
      >
    ) =>
      | ReturnTypeOfBaseQuerySetMethods<
          TType,
          TIncludedModel extends abstract new (...args: any) => any ? InstanceType<TIncludedModel> : TIncludedModel,
          GetDataFromModel<TIncludedModel>,
          Omit<
            Partial<GetDataFromModel<TIncludedModel, 'update'>>,
            TAllRelationNames[TRelationName extends keyof TAllRelationNames ? TRelationName : never]['originalKey']
          >,
          Omit<
            GetDataFromModel<TIncludedModel, 'create'>,
            TAllRelationNames[TRelationName extends keyof TAllRelationNames ? TRelationName : never]['originalKey']
          >,
          Partial<GetDataFromModel<TIncludedModel, 'read', true>>,
          GetDataFromModel<TIncludedModel>,
          THasSearch,
          THasData,
          THasRemove,
          true,
          never
        >
      | QuerySet<
          TType,
          TIncludedModel extends abstract new (...args: any) => any ? InstanceType<TIncludedModel> : TIncludedModel,
          GetDataFromModel<TIncludedModel>,
          Omit<
            Partial<GetDataFromModel<TIncludedModel, 'update'>>,
            TAllRelationNames[TRelationName extends keyof TAllRelationNames ? TRelationName : never]['originalKey']
          >,
          Omit<
            GetDataFromModel<TIncludedModel, 'create'>,
            TAllRelationNames[TRelationName extends keyof TAllRelationNames ? TRelationName : never]['originalKey']
          >,
          Partial<GetDataFromModel<TIncludedModel, 'read', true>>,
          GetDataFromModel<TIncludedModel>,
          THasSearch,
          THasData,
          THasRemove,
          true,
          never
        >,
    TToJoin extends {
      originalKey: string;
      returnType: 'array' | 'object' | 'optionalArray' | 'optionalObject';
    } = TAllRelationNames[TRelationName extends keyof TAllRelationNames ? TRelationName : never],
    TReturnFromNestedQuerySet = ReturnType<TNestedQuerySet> extends
      | QuerySet<any, any, infer TResult, any, any, any, any, any, any, any, any, any>
      | CommonQuerySet<any, any, infer TResult, any, any, any, any, any, any, any, any, any>
      ? TResult
      : never
  >(
    model: TIncludedModel,
    relationName: TRelationName,
    queryCallback?: TNestedQuerySet
  ): ReturnTypeOfBaseQuerySetMethods<
    TType,
    TModel,
    TResult & {
      [TKey in TRelationName]: TToJoin['returnType'] extends 'optionalObject'
        ? TReturnFromNestedQuerySet | undefined
        : TToJoin['returnType'] extends 'array' | 'optionalArray'
          ? TReturnFromNestedQuerySet[]
          : TToJoin['returnType'] extends 'object'
            ? TReturnFromNestedQuerySet
            : TReturnFromNestedQuerySet[];
    },
    Omit<
      TUpdate,
      TAllRelationNames[TRelationName extends keyof TAllRelationNames ? TRelationName : never]['originalKey']
    >,
    Omit<
      TCreate,
      TAllRelationNames[TRelationName extends keyof TAllRelationNames ? TRelationName : never]['originalKey']
    >,
    TSearch,
    TOrder,
    // If it's a nested search, this means we are still doing a search, so in case of a set, we are
    // updating the data. And in case of a get, we are getting the data with a search.
    ReturnType<TNestedQuerySet> extends
      | CommonQuerySet<any, any, any, any, any, any, any, infer THasNestedSearch, any, any, any, any>
      | QuerySet<any, any, any, any, any, any, any, infer THasNestedSearch, any, any, any, any>
      ? THasNestedSearch
      : false,
    ReturnType<TNestedQuerySet> extends
      | CommonQuerySet<any, any, any, any, any, any, any, any, infer THasNestedData, any, any, any>
      | QuerySet<any, any, any, any, any, any, any, any, infer THasNestedData, any, any, any>
      ? THasNestedData
      : false,
    ReturnType<TNestedQuerySet> extends
      | CommonQuerySet<any, any, any, any, any, any, any, any, any, infer THasNestedRemove, any, any>
      | QuerySet<any, any, any, any, any, any, any, any, any, infer THasNestedRemove, any, any>
      ? THasNestedRemove
      : false,
    TIsJoin,
    TAlreadyDefinedRelations | TRelationName
  > {
    const getNewQuerySet = () => {
      if (this.__type === 'set') return new SetQuerySet(model, this.__type);
      if (this.__type === 'remove') return new RemoveQuerySet(model, this.__type);
      else return new GetQuerySet(model, this.__type);
    };

    const newParentQuerySet = getNewQuerySet();
    const newChildQuerySet = getNewQuerySet() as any;
    newChildQuerySet['__isJoin'] = true as any;

    const queryCallbackResult = queryCallback ? queryCallback(newChildQuerySet) : newChildQuerySet;

    if (queryCallbackResult['__hasSearch']) newParentQuerySet['__hasSearch'] = true as any;
    if (this['__isJoin']) newParentQuerySet['__isJoin'] = true as any;

    for (const field of Object.keys(this.__query)) {
      if (field === 'joins') continue;
      (newParentQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }

    const existingJoins = this.__query.joins ? this.__query.joins() : {};
    newParentQuerySet['__query'].joins = () => ({
      ...existingJoins,
      [relationName]: {
        model,
        querySet: queryCallbackResult
      }
    });

    return newParentQuerySet as any;
  }

  /**
   * Used for filtering the data on the database. It will guarantee only a subset of the data is returned.
   * You can chain as many `.where()` methods as you want. This will append the new data to the previous `.where()`
   * clause.
   *
   * @example
   * ```ts
   * const users = await User.objects.get((qs) => qs.where({ age: 20 }).where({ name: 'John' }));
   * ```
   *
   * This will return all users that have the age of '20' and the name of 'John'.
   *
   * You can also use some special operators like `in`, `greaterThan`, `lessThan`,
   * `greaterThanEqual`, etc depending on the data type of the field.
   *
   * @example
   * ```ts
   * const users = await User.objects.get((qs) => qs.where({ age: { greaterThan: 20 } }));
   * ```
   *
   * When used in a join, it will do a InnerJoin-like query in memory. For example
   *
   * @example
   * ```ts
   * const users = await User.objects.get((qs) =>
   *   qs.join(Profile, 'profile', (qs) => qs.where({ type: 'admin' }))
   * );
   * ```
   * This will return all Users that have the Profile type of 'admin'.
   *
   * @param search - The search object to filter the data.
   *
   * @returns - A new QuerySet with the search appended.
   */
  where(
    search: TSearch
  ): ReturnTypeOfBaseQuerySetMethods<
    TType,
    TModel,
    TResult,
    TUpdate,
    TCreate,
    TSearch,
    TOrder,
    true,
    THasData,
    THasRemove,
    TIsJoin,
    TAlreadyDefinedRelations
  > {
    const getNewQuerySet = () => {
      if (this.__type === 'set')
        return new SetQuerySet<
          'set',
          TModel,
          TResult,
          TUpdate,
          TCreate,
          TSearch,
          TOrder,
          true,
          THasData,
          THasRemove,
          TIsJoin,
          TAlreadyDefinedRelations
        >(this.__model, this.__type);
      if (this.__type === 'remove')
        return new RemoveQuerySet<
          'remove',
          TModel,
          TResult,
          TUpdate,
          TCreate,
          TSearch,
          TOrder,
          true,
          THasData,
          THasRemove,
          TIsJoin,
          TAlreadyDefinedRelations
        >(this.__model, this.__type);
      else if (this.__isJoin)
        return new GetQuerySetIfSearchOnJoin<
          'get',
          TModel,
          TResult,
          TUpdate,
          TCreate,
          TSearch,
          TOrder,
          true,
          THasData,
          THasRemove,
          TIsJoin,
          TAlreadyDefinedRelations
        >(this.__model, this.__type);
      else
        return new GetQuerySet<
          'get',
          TModel,
          TResult,
          TUpdate,
          TCreate,
          TSearch,
          TOrder,
          true,
          THasData,
          THasRemove,
          TIsJoin,
          TAlreadyDefinedRelations
        >(this.__model, this.__type);
    };
    const newQuerySet = getNewQuerySet();

    for (const field of Object.keys(this.__query)) {
      if (field === 'where') continue;
      (newQuerySet as any)['__query'][field] = (this.__query as any)[field];
    }

    if (this.__query.where)
      newQuerySet['__query'].where = () => ({
        ...this.__query.where!(),
        ...search
      });
    else newQuerySet['__query'].where = () => search as any;

    newQuerySet['__hasSearch'] = true;
    return newQuerySet as any;
  }
}

export class GetQuerySetIfSearchOnJoin<
  TType extends 'get' | 'set' | 'remove',
  TModel,
  TResult = GetDataFromModel<TModel, 'read'>,
  TUpdate = Partial<GetDataFromModel<TModel, 'update'>>,
  TCreate = GetDataFromModel<TModel, 'create'>,
  TSearch = Partial<GetDataFromModel<TModel, 'read', true>>,
  TOrder = GetDataFromModel<TModel>,
  THasSearch extends boolean = false,
  THasData extends boolean = false,
  THasRemove extends boolean = false,
  TIsJoin extends boolean = false,
  TAlreadyDefinedRelations = never
> extends CommonQuerySet<
  TType,
  TModel,
  TResult,
  TUpdate,
  TCreate,
  TSearch,
  TOrder,
  THasSearch,
  THasData,
  THasRemove,
  TIsJoin,
  TAlreadyDefinedRelations
> {
  /**
   * Selects only the fields you want to retrieve from the database. This will probably improve the performance
   * of your query. This can be chained with other `select` clauses.
   *
   * @example
   * ```ts
   * const users = await User.objects.get((qs) => qs.select('id', 'name'));
   *
   * const users = await User.objects.get((qs) => qs.select('id').select('name'));
   *
   * // Both of the above examples are the same thing
   * ```
   *
   * @param fields - The fields you want to retrieve from the database.
   *
   * @returns - A new QuerySet with the fields selected.
   */
  select<const TFields extends (keyof GetDataFromModel<TModel>)[]>(
    ...fields: TFields
  ): ReturnTypeOfBaseQuerySetMethods<
    TType,
    TModel,
    Pick<
      TResult,
      TFields[number] | TAlreadyDefinedRelations extends keyof TResult
        ? TFields[number] | TAlreadyDefinedRelations
        : never
    >,
    TUpdate,
    TCreate,
    TSearch,
    Pick<TOrder, TFields[number] extends keyof TOrder ? TFields[number] : never>,
    THasSearch,
    THasData,
    THasRemove,
    TIsJoin,
    TAlreadyDefinedRelations
  > {
    const newQuerySet = new GetQuerySet<
      TType,
      TModel,
      Pick<
        TResult,
        TFields[number] | TAlreadyDefinedRelations extends keyof TResult
          ? TFields[number] | TAlreadyDefinedRelations
          : never
      >,
      TUpdate,
      TCreate,
      TSearch,
      Pick<TOrder, TFields[number] extends keyof TOrder ? TFields[number] : never>,
      THasSearch,
      THasData,
      THasRemove,
      TIsJoin,
      TAlreadyDefinedRelations
    >(this.__model, this.__type);

    for (const field of Object.keys(this.__query)) {
      if (field === 'fields') continue;
      (newQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }
    if (this.__query.fields) {
      const existingFields = this.__query.fields();

      newQuerySet['__query'].fields = () => ({
        toIncludeAfterQuery: [...existingFields['toIncludeAfterQuery'], ...(fields as string[])],
        toLazyRemoveAfterQuery: existingFields['toLazyRemoveAfterQuery']
      });
    } else
      newQuerySet['__query'].fields = () => ({
        toIncludeAfterQuery: fields as string[],
        toLazyRemoveAfterQuery: []
      });

    newQuerySet['__hasSearch'] = this['__hasSearch'];
    newQuerySet['__isJoin'] = this['__isJoin'];

    return newQuerySet as any;
  }

  /**
   * Allows you to order the data you are retrieving from the database. This can be chained
   * with other `orderBy` clauses.
   *
   * A clause with a `-` in front of the field name means it will order in descending order.
   * Otherwise it will order in ascending order.
   *
   * @example
   * ```ts
   * const users = await User.objects.get((qs) => qs.orderBy('-name', 'age'));
   * ```
   *
   * @param ordering - The fields you want to order by.
   *
   * @returns - A new QuerySet with the ordering appended.
   */
  orderBy(
    ...ordering: OrderingOfFields<keyof TOrder extends string ? keyof TOrder : never>
  ): GetQuerySet<
    TType,
    TModel,
    TResult,
    TUpdate,
    TCreate,
    TSearch,
    TOrder,
    THasSearch,
    THasData,
    THasRemove,
    TIsJoin,
    TAlreadyDefinedRelations
  > {
    const newQuerySet = new GetQuerySet<
      TType,
      TModel,
      TResult,
      TUpdate,
      TCreate,
      TSearch,
      TOrder,
      THasSearch,
      THasData,
      THasRemove,
      TIsJoin,
      TAlreadyDefinedRelations
    >(this.__model, this.__type);

    for (const field of Object.keys(this.__query)) {
      if (field === 'where') continue;
      (newQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }

    if (this.__query.orderBy) newQuerySet['__query'].orderBy = () => [...this.__query.orderBy!(), ...ordering];
    else newQuerySet['__query'].orderBy = () => ordering as unknown as string[];
    newQuerySet['__hasSearch'] = this['__hasSearch'];
    newQuerySet['__isJoin'] = this['__isJoin'];

    return newQuerySet as any;
  }
}

export class GetQuerySet<
  TType extends 'get' | 'set' | 'remove',
  TModel,
  TResult = GetDataFromModel<TModel, 'read'>,
  TUpdate = Partial<GetDataFromModel<TModel, 'update'>>,
  TCreate = GetDataFromModel<TModel, 'create'>,
  TSearch = Partial<GetDataFromModel<TModel, 'read', true>>,
  TOrder = GetDataFromModel<TModel>,
  THasSearch extends boolean = false,
  THasData extends boolean = false,
  THasRemove extends boolean = false,
  TIsJoin extends boolean = false,
  TAlreadyDefinedRelations = never
> extends GetQuerySetIfSearchOnJoin<
  TType,
  TModel,
  TResult,
  TUpdate,
  TCreate,
  TSearch,
  TOrder,
  THasSearch,
  THasData,
  THasRemove,
  TIsJoin,
  TAlreadyDefinedRelations
> {
  limit(
    limit: number
  ): GetQuerySet<
    TType,
    TModel,
    TResult,
    TUpdate,
    TCreate,
    TSearch,
    TOrder,
    THasSearch,
    THasData,
    THasRemove,
    TIsJoin,
    TAlreadyDefinedRelations
  > {
    const newQuerySet = new GetQuerySet<
      TType,
      TModel,
      TResult,
      TUpdate,
      TCreate,
      TSearch,
      TOrder,
      THasSearch,
      THasData,
      THasRemove,
      TIsJoin,
      TAlreadyDefinedRelations
    >(this.__model, this.__type);

    for (const field of Object.keys(this.__query)) {
      (newQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }

    newQuerySet['__query'].limit = () => limit;
    newQuerySet['__hasSearch'] = this['__hasSearch'];
    newQuerySet['__isJoin'] = this['__isJoin'];

    return newQuerySet as any;
  }

  offset(
    offset: number
  ): GetQuerySet<
    TType,
    TModel,
    TResult,
    TUpdate,
    TCreate,
    TSearch,
    TOrder,
    THasSearch,
    THasData,
    THasRemove,
    TIsJoin,
    TAlreadyDefinedRelations
  > {
    const newQuerySet = new GetQuerySet<
      TType,
      TModel,
      TResult,
      TUpdate,
      TCreate,
      TSearch,
      TOrder,
      THasSearch,
      THasData,
      THasRemove,
      TIsJoin,
      TAlreadyDefinedRelations
    >(this.__model, this.__type);

    for (const field of Object.keys(this.__query)) {
      (newQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }

    newQuerySet['__query'].offset = () => offset;
    newQuerySet['__hasSearch'] = this['__hasSearch'];
    newQuerySet['__isJoin'] = this['__isJoin'];

    return newQuerySet as any;
  }
}

export class SetQuerySet<
  TType extends 'get' | 'set' | 'remove',
  TModel,
  TResult = GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'read'>,
  TUpdate = Partial<
    GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'update'>
  >,
  TCreate = GetDataFromModel<
    TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel,
    'create'
  >,
  TSearch = Partial<
    GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel, 'read', true>
  >,
  TOrder = GetDataFromModel<TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel>,
  THasSearch extends boolean = false,
  THasData extends boolean = false,
  THasRemove extends boolean = false,
  TIsJoin extends boolean = false,
  TAlreadyDefinedRelations = never
> extends CommonQuerySet<
  TType,
  TModel,
  TResult,
  TUpdate,
  TCreate,
  TSearch,
  TOrder,
  THasSearch,
  THasData,
  THasRemove,
  TIsJoin,
  TAlreadyDefinedRelations
> {
  /**
   * This method is used to set the data to be created or updated. As you've probably seen, we doesn't
   * offer you too many options, you have `.set`, `remove` and `get` on the Managers. This covers the
   * `.set` part. A `set` operation creates or updates the data on the database.
   *
   * Now you might be asking: How do we know how to differentiate? Easy, by the presence of a `.where()`
   * clause anywhere on your query (even nested ones).
   *
   * If you have a `.where()` clause, it will update the data. If you don't, it will create the data.
   *
   * Other differences between the two operations are:
   * ### Create
   * - You can set as many data as you want.
   * - You can set the same data multiple times, it will create multiple entries.
   * - Obligatory data is required.
   *
   * ### Update
   * - Just one data can be set.
   * - All fields are optional.
   *
   * Here is simple examples:
   *
   * @example
   * ```typescript
   * // CREATING A USER
   * const user = await User.objects.set((qs) => qs.data({ name: 'John Doe', email: 'johndoe@example.com' }));
   *
   * // CREATING MULTIPLE USERS
   * const user = await User.objects.set((qs) => qs.data(
   *   { name: 'John Doe', email: 'johndoe@example.com' },
   *   { name: 'Victor Baptista', email: 'victor@example.com' }
   * ));
   *
   * // UPDATING A USER
   * const user = await User.objects.set((qs) => qs.where({ id: 1 }).data({ name: 'John Doe' }));
   * ```
   *
   * Great, now comes the cool part: Relations!
   * Relations are for querying purposes, most of the time, but you can also set data through them. Palmares
   * takes care of the rest for you. Let's see an example:
   *
   * @example
   * ```typescript
   *
   * // CREATING A PROFILE TYPE WITH TWO ASSOCIATED USERS AND ASSIGNING BOTH USERS TO ONE COMPANY
   * const company = await Company.default.set((qs) =>
   *   qs
   *     .join(User, 'usersOfCompany', (qs) =>
   *       qs
   *         .join(ProfileType, 'profileType', (qs) =>
   *           qs.data({
   *             name: 'admin2'
   *           })
   *         )
   *         .data({
   *           age: 10,
   *           name: 'test1',
   *           uuid: 'a417f723-ddb7-4f8c-a42c-0b5975e4cf5f',
   *           userType: 'admin'
   *         }, {
   *           age: 11,
   *           name: 'test2',
   *           uuid: '77ac0c15-09c7-425e-9d77-97c0f973e8e6',
   *           userType: 'user'
   *         })
   *     )
   *     .data({
   *       address: 'test',
   *       name: 'test5'
   *     })
   * );
   *
   * // UPDATING A COMPANY, AND ONLY THE COMPANY BY QUERYING BY THE PROFILE TYPE
   * const company = await Company.default.set((qs) =>
   *   qs
   *     .join(User, 'usersOfCompany', (qs) =>
   *       qs
   *         .join(ProfileType, 'profileType', (qs) =>
   *           qs.where({ id: 5 })
   *         )
   *     )
   *     .data({
   *       name: 'hello'
   *     })
   * );
   * ```
   *
   * @param data - The data to be set on the database.
   *
   * @returns - Returns a new QuerySet. You cannot set any more chaining method after this one.
   */
  data(
    ...data: THasSearch extends true ? [TUpdate] : TCreate[]
  ): QuerySet<
    'set',
    TModel,
    TResult,
    TUpdate,
    TCreate,
    TSearch,
    TOrder,
    THasSearch,
    TIsJoin,
    true,
    THasRemove,
    TAlreadyDefinedRelations
  > {
    const newQuerySet = new QuerySet<
      'set',
      TModel,
      TResult,
      TUpdate,
      TCreate,
      TSearch,
      TOrder,
      THasSearch,
      true,
      THasRemove,
      TIsJoin,
      TAlreadyDefinedRelations
    >(this.__model, 'set');

    for (const field of Object.keys(this.__query)) {
      if (field === 'data') continue;
      (newQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }

    if (this.__query.data) {
      const [setOfAllFieldNames, existingData] = this.__query.data();
      newQuerySet['__query'].data = () => {
        const newData = [];
        for (const existingDataToAddOrUpdate of existingData) {
          for (const dataToAddOrUpdate of data) {
            for (const field of Object.keys(dataToAddOrUpdate as object)) setOfAllFieldNames.add(field);
            newData.push({
              ...dataToAddOrUpdate,
              ...existingDataToAddOrUpdate
            });
          }
        }
        return [setOfAllFieldNames, newData];
      };
    } else
      newQuerySet['__query'].data = () => {
        const fieldNamesOfData = new Set<string>();
        for (const dataToAddOrUpdate of data) {
          for (const field of Object.keys(dataToAddOrUpdate as object)) fieldNamesOfData.add(field);
        }
        return [fieldNamesOfData, data as Record<string, any>[]];
      };

    newQuerySet['__hasSearch'] = this['__hasSearch'];
    newQuerySet['__isJoin'] = this['__isJoin'];
    newQuerySet['__markToCreateOrUpdate'] = true;

    return newQuerySet as any;
  }
}

/**
 * Responsible for holding and managing the 'remove' query. This is not necessarily when removing an item from the
 * database using the `.remove()` operation on the manager. The `remove()` makes it explicit that you are removing an
 * item from the database and you can force the removal if you want by passing `true` as the first argument.
 *
 * By default it will prevent you from removing an item without a `.where()` clause.
 */
export class RemoveQuerySet<
  TType extends 'get' | 'set' | 'remove',
  TModel,
  TResult = GetDataFromModel<TModel, 'read'>,
  TUpdate = Partial<GetDataFromModel<TModel, 'update'>>,
  TCreate = GetDataFromModel<TModel, 'create'>,
  TSearch = Partial<GetDataFromModel<TModel, 'read', true>>,
  TOrder = GetDataFromModel<TModel>,
  THasSearch extends boolean = false,
  THasData extends boolean = false,
  THasRemove extends boolean = false,
  TIsJoin extends boolean = false,
  TAlreadyDefinedRelations = never
> extends CommonQuerySet<
  TType,
  TModel,
  TResult,
  TUpdate,
  TCreate,
  TSearch,
  TOrder,
  THasSearch,
  THasData,
  THasRemove,
  TIsJoin,
  TAlreadyDefinedRelations
> {
  /**
   * This methods sets the data to be removed from the database. You must always use
   * this, otherwise it will not remove the data. We know it's kinda redundant sometimes
   * but this makes it explicit that you are removing the data from the database. Sometimes
   * something being a little more verbose is actually a nice thing!
   *
   * A simple example:
   *
   * @example
   * ```typescript
   * const user = await User.objects.remove((qs) => qs.where({ id: 1 }).remove());
   * ```
   *
   * This will remove all users with the id of 1. Now let's go to a more complex example:
   *
   * @example
   * ```typescript
   * const companies = await Company.default.remove((qs) =>
   *  qs
   *    .join(User, 'usersOfCompany', (qs) =>
   *      qs
   *        .join(ProfileType, 'profileType', (qs) =>
   *          qs.where({
   *            id: 5
   *          })
   *        )
   *        .remove()
   *    )
   *    .remove()
   * );
   * ```
   *
   * This will remove all companies that have a user with a profile type of 5. And all
   * the companies related with that user.
   *
   * "Will ProfileType be removed?" No, it will not. Because you haven't set .remove() on it's
   * queryset. So ProfileType is just there for querying purposes but will not be removed,
   * how cool is that?
   *
   * Usually you will want to use this method just on the root queryset, not on its children.
   *
   * @returns - Returns a new QuerySet. You cannot set any more chaining method after this one.
   */
  remove(): QuerySet<
    'remove',
    TModel,
    TResult,
    TUpdate,
    TCreate,
    TSearch,
    TOrder,
    THasSearch,
    THasData,
    true,
    TIsJoin,
    TAlreadyDefinedRelations
  > {
    const newQuerySet = new QuerySet<
      'remove',
      TModel,
      TResult,
      TUpdate,
      TCreate,
      TSearch,
      TOrder,
      THasSearch,
      THasData,
      true,
      TIsJoin,
      TAlreadyDefinedRelations
    >(this.__model, 'remove');

    for (const field of Object.keys(this.__query)) {
      (newQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }

    newQuerySet['__hasSearch'] = this['__hasSearch'];
    newQuerySet['__isJoin'] = this['__isJoin'];
    newQuerySet['__markToRemove'] = true;
    return newQuerySet as any;
  }
}
