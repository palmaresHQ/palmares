import { MissingWhereClauseException } from './exceptions';
import { parseSearch } from '../queries/search';

import type {
  AutoField,
  BigAutoField,
  BooleanField,
  CharField,
  DateField,
  DecimalField,
  EnumField,
  Field,
  ForeignKeyField,
  IntegerField,
  TextField,
  UuidField
} from './fields';
import type { BaseModel, Model, ModelType } from './model';
import type { ModelFields } from './types';
import type { DatabaseAdapter } from '../engine';

type ModelsFields<TModel> = TModel extends ModelType<{ fields: infer TFields }, any> | { fields: infer TFields }
  ? TFields
  : never;

type ForeignKeyFieldNameByRelationOrRelatedName<TModel, TRelationOrRelatedName> = {
  [TKey in keyof ModelsFields<TModel> as ModelsFields<TModel>[TKey] extends ForeignKeyField<
    any,
    {
      unique: any;
      auto: any;
      hasDefaultValue: any;
      allowNull: any;
      dbIndex: any;
      isPrimaryKey: any;
      defaultValue: any;
      underscored: any;
      typeName: any;
      databaseName: any;
      engineInstance: any;
      customAttributes: any;
      relatedTo: any;
      onDelete: any;
      relatedName: infer TRelatedName extends string;
      relationName: infer TRelationName extends string;
      toField: any;
    }
  >
    ? TRelatedName extends TRelationOrRelatedName
      ? TKey
      : TRelationName extends TRelationOrRelatedName
        ? TKey
        : never
    : never]: any;
};

export type ForeignKeyModelsRelationName<TModel, TIncludedModel> = {
  [TKey in keyof ModelsFields<TModel> as ModelsFields<TModel>[TKey] extends ForeignKeyField<
    any,
    {
      unique: any;
      auto: any;
      hasDefaultValue: any;
      allowNull: any;
      dbIndex: any;
      isPrimaryKey: any;
      defaultValue: any;
      underscored: any;
      typeName: any;
      databaseName: any;
      engineInstance: any;
      customAttributes: any;
      relatedTo: ((_: any) => infer TRelatedToModel) | (() => infer TRelatedToModel) | infer TRelatedToModel;
      onDelete: any;
      relatedName: any;
      relationName: infer TRelationName extends string;
      toField: any;
    }
  >
    ? TIncludedModel extends abstract new (...args: any) => any
      ? InstanceType<
          TRelatedToModel extends abstract new (...args: any) => any ? TRelatedToModel : never
        > extends InstanceType<TIncludedModel>
        ? TRelationName
        : never
      : InstanceType<
            TRelatedToModel extends abstract new (...args: any) => any ? TRelatedToModel : never
          > extends TIncludedModel
        ? TRelationName
        : never
    : never]: ModelsFields<TModel>[TKey] extends ForeignKeyField<
    any,
    {
      unique: any;
      auto: any;
      hasDefaultValue: any;
      allowNull: infer TAllowNull extends boolean;
      dbIndex: any;
      isPrimaryKey: any;
      defaultValue: any;
      underscored: any;
      typeName: any;
      databaseName: any;
      engineInstance: any;
      customAttributes: any;
      relatedTo: any;
      onDelete: any;
      relatedName: any;
      relationName: any;
      toField: any;
    }
  >
    ? TAllowNull extends true
      ? undefined
      : unknown
    : unknown;
};

export type ForeignKeyModelsRelatedName<TModel, TIncludedModel> = {
  [TKey in keyof ModelsFields<TModel> as ModelsFields<TModel>[TKey] extends ForeignKeyField<
    any,
    {
      unique: any;
      auto: any;
      hasDefaultValue: any;
      allowNull: any;
      dbIndex: any;
      isPrimaryKey: any;
      defaultValue: any;
      underscored: any;
      typeName: any;
      databaseName: any;
      engineInstance: any;
      customAttributes: any;
      relatedTo: ((_: any) => infer TRelatedToModel) | (() => infer TRelatedToModel) | infer TRelatedToModel;
      onDelete: any;
      relatedName: infer TRelatedName extends string;
      relationName: any;
      toField: any;
    }
  >
    ? TIncludedModel extends abstract new (...args: any) => any
      ? InstanceType<
          TRelatedToModel extends abstract new (...args: any) => any ? TRelatedToModel : never
        > extends InstanceType<TIncludedModel>
        ? TRelatedName
        : never
      : InstanceType<
            TRelatedToModel extends abstract new (...args: any) => any ? TRelatedToModel : never
          > extends TIncludedModel
        ? TRelatedName
        : never
    : never]: ModelsFields<TModel>[TKey] extends ForeignKeyField<
    any,
    {
      unique: infer TUnique extends boolean;
      auto: any;
      hasDefaultValue: any;
      allowNull: infer TAllowNull extends boolean;
      dbIndex: any;
      isPrimaryKey: any;
      defaultValue: any;
      underscored: any;
      typeName: any;
      databaseName: any;
      engineInstance: any;
      customAttributes: any;
      relatedTo: any;
      onDelete: any;
      relatedName: any;
      relationName: any;
      toField: any;
    }
  >
    ? TAllowNull extends true
      ? TUnique extends true
        ? undefined
        : undefined[]
      : TUnique extends true
        ? undefined
        : undefined[]
    : unknown[];
};

export type FieldWithOperationType<TFieldType> = {
  ['eq']?: TFieldType;
  ['is']?:
    | {
        not: TFieldType;
      }
    | TFieldType;
  ['or']?: TFieldType[];
  ['and']?: TFieldType[];
  ['in']?:
    | {
        not: TFieldType[];
      }
    | TFieldType[];
  ['greaterThan']?: NonNullable<TFieldType>;
  ['greaterThanOrEqual']?: NonNullable<TFieldType>;
  ['lessThan']?: NonNullable<TFieldType>;
  ['lessThanOrEqual']?: NonNullable<TFieldType>;
  ['between']?:
    | {
        not: [NonNullable<TFieldType>, NonNullable<TFieldType>];
      }
    | [NonNullable<TFieldType>, NonNullable<TFieldType>];
  ['like']?:
    | {
        not: { ignoreCase: NonNullable<TFieldType> } | NonNullable<TFieldType>;
      }
    | { ignoreCase: NonNullable<TFieldType> }
    | NonNullable<TFieldType>;
};

type AddOperation<TFieldType> = Pick<
  FieldWithOperationType<TFieldType>,
  | 'is'
  | 'or'
  | 'and'
  | 'in'
  | (TFieldType extends number | Date
      ? 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual' | 'between'
      : TFieldType extends string
        ? 'like'
        : never)
>;
type _GetDataFromModel<TModel, TType extends 'create' | 'update' | 'read' = 'read', TIsSearch = false> = {
  [TKey in keyof ModelsFields<TModel>]: ModelsFields<TModel>[TKey] extends
    | Field<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | AutoField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | BigAutoField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | TextField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | CharField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | UuidField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | IntegerField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | DecimalField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | DateField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | EnumField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | BooleanField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    | ForeignKeyField<{ create: infer TCreate; update: infer TUpdate; read: infer TRead }, any>
    ? TType extends 'create'
      ? TCreate
      : TType extends 'update'
        ? TUpdate
        : TIsSearch extends true
          ? AddOperation<TRead> | TRead
          : TRead
    : never;
};

type GetDataFromModel<TModel, TType extends 'create' | 'update' | 'read' = 'read', TIsSearch = false> = Omit<
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
  data?: () => Record<string, any>[];
  remove?: () => [boolean, boolean];
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
          TIsJoin,
          TAlreadyDefinedRelations
        >;

export class QuerySet<
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
  TIsJoin extends boolean = false,
  TAlreadyDefinedRelations = never
> {
  protected __isJoin!: TIsJoin;
  protected __hasSearch!: THasSearch;
  protected __type: TType;
  protected __query: QuerySetQueryData;
  protected __cachedData: any;

  constructor(type: TType) {
    this.__type = type;
    this.__query = {};
  }

  /**
   * Join a model with another model, you can also pass a callback to make nested queries.
   * In other words, this is how you make relations on Palmares.
   * You can also pass a callback to make nested queries.
   *
   * @param model - The model you want to join with.
   * @param relationName - The name of the relation you want to join. Let's say the model
   * you are joining with is called `Profile` on the `User` model, and there are two foreignKeyFields on
   * the `User` model that points to the `Profile` model, one called `profileId` and the other called `profileId2`.
   * The relationName would be `profileId` or `profileId2`.
   * @param queryCallback - A callback to make nested queries.
   */
  join<
    TIncludedModel,
    TRelationName extends
      | keyof ForeignKeyModelsRelationName<
          TModel extends abstract new (...args: any) => any ? InstanceType<TModel> : TModel,
          TIncludedModel extends abstract new (...args: any) => any ? InstanceType<TIncludedModel> : TIncludedModel
        >
      | keyof ForeignKeyModelsRelatedName<
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
        true,
        never
      >
    ) => ReturnTypeOfBaseQuerySetMethods<
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
      never
    > = (
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
        true,
        never
      >
    ) => ReturnTypeOfBaseQuerySetMethods<
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
      true,
      never
    >
  >(
    model: TIncludedModel,
    relationName: TRelationName,
    queryCallback?: TNestedQuerySet
  ): ReturnTypeOfBaseQuerySetMethods<
    TType,
    TModel,
    TResult & {
      [TKey in TRelationName]: ForeignKeyModelsRelatedName<TIncludedModel, TModel>[TRelationName] extends undefined[]
        ? (ReturnType<TNestedQuerySet> extends QuerySet<any, any, infer TResult, any, any, any, any, any, any>
            ? TResult
            : never)[]
        : ForeignKeyModelsRelatedName<TIncludedModel, TModel>[TRelationName] extends unknown[]
          ? (ReturnType<TNestedQuerySet> extends QuerySet<any, any, infer TResult, any, any, any, any, any, any>
              ? TResult
              : never)[]
          :
                | ForeignKeyModelsRelatedName<TIncludedModel, TModel>[TRelationName]
                | ForeignKeyModelsRelationName<TModel, TIncludedModel>[TRelationName] extends undefined
            ? ReturnType<TNestedQuerySet> extends QuerySet<any, any, infer TResult, any, any, any, any, any, any>
              ? TResult | undefined
              : never
            : ReturnType<TNestedQuerySet> extends QuerySet<any, any, infer TResult, any, any, any, any, any, any>
              ? TResult
              : never;
    },
    Omit<
      TUpdate,
      | keyof ForeignKeyFieldNameByRelationOrRelatedName<TModel, TRelationName>
      | keyof ForeignKeyFieldNameByRelationOrRelatedName<TIncludedModel, TRelationName>
    >,
    Omit<
      TCreate,
      | keyof ForeignKeyFieldNameByRelationOrRelatedName<TModel, TRelationName>
      | keyof ForeignKeyFieldNameByRelationOrRelatedName<TIncludedModel, TRelationName>
    >,
    TSearch,
    TOrder,
    // If it's a nested search, this means we are still doing a search, so in case of a set, we are
    // updating the data. And in case of a get, we are getting the data with a search.
    ReturnType<TNestedQuerySet> extends QuerySet<any, any, any, any, any, any, any, infer THasNestedSearch, any>
      ? THasNestedSearch
      : false,
    TIsJoin,
    TAlreadyDefinedRelations | TRelationName
  > {
    const getNewQuerySet = () => {
      if (this.__type === 'set') return new SetQuerySet(this.__type);
      if (this.__type === 'remove') return new RemoveQuerySet(this.__type);
      else return new GetQuerySet(this.__type);
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
   * You can combine as many where clauses as you want. This way you can reuse the same query.
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
          TIsJoin,
          TAlreadyDefinedRelations
        >(this.__type);
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
          TIsJoin,
          TAlreadyDefinedRelations
        >(this.__type);
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
          TIsJoin,
          TAlreadyDefinedRelations
        >(this.__type);
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
          TIsJoin,
          TAlreadyDefinedRelations
        >(this.__type);
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

  static new<TModel, TType extends 'set' | 'remove' | 'get' = 'get'>(
    type?: TType
  ): TType extends 'remove'
    ? RemoveQuerySet<'remove', TModel>
    : TType extends 'set'
      ? SetQuerySet<'set', TModel>
      : GetQuerySet<'get', TModel> {
    if (type === 'set') return new SetQuerySet('set') as any;
    if (type === 'remove') return new RemoveQuerySet('remove') as any;
    return new GetQuerySet('get') as any;
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
    queryset: QuerySet<any, any, any, any, any, any, any, any, any, any>,
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

  protected __duringQueryAppendInsertedOrUpdatedDataToQuery(
    queryset: QuerySet<any, any, any, any, any, any, any, any, any, any>,
    dataInsertedOnParent: any[],
    fieldNameOnRelationToFilter: string
  ) {
    const hasSearch = queryset['__hasSearch'];
    const existingDataClauseOnChild = queryset['__query'].data?.();

    if (existingDataClauseOnChild && existingDataClauseOnChild.length > 0) {
      queryset['__query'].data = () => {
        // Update clause,
        if (hasSearch) {
          return existingDataClauseOnChild;
        }

        // Create clause
        const dataToInsert = [];
        for (const valueToAddOnRelationField of dataInsertedOnParent) {
          for (const dataToAddOrUpdate of existingDataClauseOnChild) {
            dataToAddOrUpdate[fieldNameOnRelationToFilter] = valueToAddOnRelationField;
            dataToInsert.push({ ...dataToAddOrUpdate });
          }
        }
        return dataToInsert as Record<string, any>[];
      };
    }
  }

  protected async __duringQueryActuallyQueryTheDatabase(
    model: typeof BaseModel & typeof Model & ModelType<any, any>,
    engine: DatabaseAdapter,
    queryset: QuerySet<any, any, any, any, any, any, any, any, any, any>,
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
    if (queryset['__query'].data) query['data'] = queryset['__query'].data();
    if (queryset['__query'].orderBy) query['ordering'] = queryset['__query'].orderBy();
    if (queryset['__query'].limit) query['limit'] = queryset['__query'].limit();
    if (queryset['__query'].offset) query['offset'] = queryset['__query'].offset();
    if (queryset['__query'].where) {
      query['search'] = await parseSearch(engine, new model() as any, translatedModel, queryset['__query'].where());
    }

    const queryPerOperation = async () => {
      if (this.__type === 'get') {
        return engine.query.get.queryData(engine, {
          modelOfEngineInstance: translatedModel,
          search: query['search'],
          fields: query['fields'],
          ordering: query['ordering'],
          limit: query['limit'],
          offset: query['offset']
        });
      }
      if (this.__type === 'set') {
        const allDataAddedOrUpdated = await engine.query.set.queryData(engine, {
          search: query['search'],
          modelOfEngineInstance: translatedModel,
          data: Array.isArray(query['data'][0]) ? query['data'][0] : [query['data'][0]]
        });
        return allDataAddedOrUpdated.map((data: any) => data[1]);
      }
    };

    this.__cachedData = args.cachedData ? args.cachedData : queryPerOperation();

    const shouldLoopThroughData =
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

    if (shouldLoopThroughData) {
      for (const dataItem of awaitedCachedData) {
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
              probablyAForeignKeyField['$$type'] === '$PForeignKeyField' &&
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

      const hasSearch = querySet['__hasSearch'] as boolean;
      const shouldBeQueriedBeforeBase =
        hasSearch || (querySet['__query'].data !== undefined && isDirectlyRelated === true);

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
          ...(args?.relations || {}),
          relationsFromJoinsWithWhereClause: {
            mapTo: relations,
            newMap: args?.relations?.relationsFromJoinsWithWhereClause.newMap
          } as any
        } as any
      });
    }

    return this.__cachedData;
  }

  protected __getQueryFormatted() {
    const query: any = {};
    const joins = this.__query.joins?.();

    if (this.__query.fields) query['fields'] = this.__query.fields();
    if (this.__query.orderBy) query['ordering'] = this.__query.orderBy();
    if (this.__query.limit) query['limit'] = this.__query.limit();
    if (this.__query.offset) query['offset'] = this.__query.offset();
    if (this.__query.where) query['search'] = this.__query.where();
    if (this.__query.data) query['data'] = this.__query.data();
    if (this.__query.remove) query['remove'] = this.__query.remove();

    const joinsEntries = joins ? Object.entries(joins) : [];
    const formattedJoins = joinsEntries.map(([key, value]) => {
      return [
        key,
        value,
        {
          appendData: (key: string, data: any, force: boolean) => {
            if (query.data) query.data[key] = { data, force };
            else query.data = { [key]: { data, force } };
          },
          appendToSearchQuery: (key: string, value: any) => {
            if (query.search) query.search[key] = value;
            else query.search = { [key]: value };
          },
          appendIncludes: (
            key: string,
            model: any,
            nestedIncludes?: any,
            orderBy?: string[],
            fields?: string[],
            offset?: number,
            limit?: number
          ) => {
            if (query.includes)
              query.includes.push({
                model,
                relationNames: [key],
                fields,
                ordering: orderBy,
                offset,
                limit,
                includes: nestedIncludes
              });
            else
              query.includes = [
                { model, relationNames: [key], fields, ordering: orderBy, offset, limit, includes: nestedIncludes }
              ];
          }
        }
      ] as const;
    });

    for (const joinsData of formattedJoins) {
      const [key, { model, querySet }, { appendToSearchQuery, appendIncludes, appendData }] = joinsData;

      const nestedQueryData = querySet.__getQueryFormatted();
      if (nestedQueryData.search) appendToSearchQuery(key, nestedQueryData.search);
      if (nestedQueryData.data) appendData(key, nestedQueryData.update.data, nestedQueryData.update.force);

      appendIncludes(key, model, nestedQueryData.includes, nestedQueryData.fields);
    }

    if (query.remove) {
      if (!query.search && !query.remove[1]) throw new MissingWhereClauseException('remove');
    }
    return query;
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
  TIsJoin,
  TAlreadyDefinedRelations
> {
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
      TIsJoin,
      TAlreadyDefinedRelations
    >(this.__type);

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
  TIsJoin,
  TAlreadyDefinedRelations
> {
  orderBy(
    ordering: OrderingOfFields<keyof TOrder extends string ? keyof TOrder : never>
  ): GetQuerySet<
    TType,
    TModel,
    TResult,
    TUpdate,
    TCreate,
    TSearch,
    TOrder,
    THasSearch,
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
      TIsJoin,
      TAlreadyDefinedRelations
    >(this.__type);

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
      TIsJoin,
      TAlreadyDefinedRelations
    >(this.__type);

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
      TIsJoin,
      TAlreadyDefinedRelations
    >(this.__type);

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
  TIsJoin,
  TAlreadyDefinedRelations
> {
  data(
    ...data: THasSearch extends true ? [TUpdate] : TCreate[]
  ): SetQuerySet<
    'set',
    TModel,
    TResult,
    TUpdate,
    TCreate,
    TSearch,
    TOrder,
    THasSearch,
    TIsJoin,
    TAlreadyDefinedRelations
  > {
    const newQuerySet = new SetQuerySet<
      TType,
      TModel,
      TResult,
      TUpdate,
      TCreate,
      TSearch,
      TOrder,
      THasSearch,
      TIsJoin,
      TAlreadyDefinedRelations
    >(this.__type);

    for (const field of Object.keys(this.__query)) {
      if (field === 'data') continue;
      (newQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }

    if (this.__query.data) {
      const existingData = this.__query.data();
      newQuerySet['__query'].data = () => {
        const newData = [];
        for (const existingDataToAddOrUpdate of existingData) {
          for (const dataToAddOrUpdate of data) {
            newData.push({
              ...dataToAddOrUpdate,
              ...existingDataToAddOrUpdate
            });
          }
        }
        return newData;
      };
    } else newQuerySet['__query'].data = () => data as Record<string, any>[];

    newQuerySet['__hasSearch'] = this['__hasSearch'];
    newQuerySet['__isJoin'] = this['__isJoin'];

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
  TIsJoin,
  TAlreadyDefinedRelations
> {
  remove(
    force?: boolean
  ): RemoveQuerySet<
    'remove',
    TModel,
    TResult,
    TUpdate,
    TCreate,
    TSearch,
    TOrder,
    THasSearch,
    TIsJoin,
    TAlreadyDefinedRelations
  > {
    const newQuerySet = new RemoveQuerySet<
      TType,
      TModel,
      TResult,
      TUpdate,
      TCreate,
      TSearch,
      TOrder,
      THasSearch,
      TIsJoin,
      TAlreadyDefinedRelations
    >(this.__type);

    for (const field of Object.keys(this.__query)) {
      (newQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }

    const forceRemove = force || false;
    newQuerySet['__query']['remove'] = () => [true, forceRemove];

    return newQuerySet as any;
  }
}
