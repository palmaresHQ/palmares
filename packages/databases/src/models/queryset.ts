import { MissingWhereClauseException } from './exceptions';

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
import type { DatabaseAdapter } from '../engine';
import { parseSearch } from '../queries/search';

type ModelsFields<TModel> = TModel extends ModelType<{ fields: infer TFields }, any> | { fields: infer TFields }
  ? TFields
  : never;

type ForeignKeyModelsRelationName<TModel, TIncludedModel> = {
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
      relatedTo: infer TRelatedToModel | ((...args: any[]) => infer TRelatedToModel);
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

type ForeignKeyModelsRelatedName<TModel, TIncludedModel> = {
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
      relatedTo: infer TRelatedToModel | ((...args: any[]) => infer TRelatedToModel);
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

type GetDataFromModel<TModel, TType extends 'create' | 'update' | 'read' = 'read', TIsSearch = false> = {
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

type OrderingOfFields<TFields extends string> = readonly (TFields extends string ? TFields | `-${TFields}` : never)[];

type QuerySetQueryData = {
  fields?: () => string[];
  orderBy?: () => string[];
  limit?: () => number;
  offset?: () => number;
  data?: () => [Record<string, any>, boolean];
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
  TResult = GetDataFromModel<TModel, 'read'>,
  TUpdate = Partial<GetDataFromModel<TModel, 'update'>>,
  TCreate = GetDataFromModel<TModel, 'create'>,
  TSearch = Partial<GetDataFromModel<TModel, 'read', true>>,
  TOrder = GetDataFromModel<TModel>,
  THasSearch extends boolean = false,
  TIsJoin extends boolean = false,
  TAlreadyDefinedRelations = never
> = TType extends 'set'
  ? SetQuerySet<TType, TModel, TResult, TUpdate, TCreate, TSearch, TOrder, THasSearch, TIsJoin, TAlreadyDefinedRelations>
  : TType extends 'remove'
    ? RemoveQuerySet<TType, TModel, TResult, TUpdate, TCreate, TSearch, TOrder, THasSearch, TIsJoin, TAlreadyDefinedRelations>
    : TIsJoin extends true
    ? THasSearch extends true
      ? GetQuerySetIfSearchOnJoin<TType, TModel, TResult, TUpdate, TCreate, TSearch, TOrder, THasSearch, TIsJoin, TAlreadyDefinedRelations>
    : GetQuerySet<TType, TModel, TResult, TUpdate, TCreate, TSearch, TOrder, THasSearch, TIsJoin, TAlreadyDefinedRelations>
    : GetQuerySet<TType, TModel, TResult, TUpdate, TCreate, TSearch, TOrder, THasSearch, TIsJoin, TAlreadyDefinedRelations>;


export class QuerySet<
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
> {
  protected __isJoin!: TIsJoin;
  protected __hasSearch!: THasSearch;
  protected __type: TType;
  protected __query: QuerySetQueryData;

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
    TRelationName extends Exclude<
      | keyof ForeignKeyModelsRelationName<TModel, TIncludedModel>
      | keyof ForeignKeyModelsRelatedName<TIncludedModel, TModel>,
      TAlreadyDefinedRelations
    >,
    TNestedQuerySet extends (
      querySet: ReturnTypeOfBaseQuerySetMethods<
        TType,
        TIncludedModel,
        GetDataFromModel<TIncludedModel>,
        Partial<GetDataFromModel<TIncludedModel, 'update'>>,
        GetDataFromModel<TIncludedModel, 'create'>,
        Partial<GetDataFromModel<TIncludedModel, 'read', true>>,
        GetDataFromModel<TIncludedModel>,
        THasSearch,
        true,
        never
      >
    ) => ReturnTypeOfBaseQuerySetMethods<
      TType,
      TIncludedModel,
      GetDataFromModel<TIncludedModel>,
      Partial<GetDataFromModel<TIncludedModel, 'update'>>,
      GetDataFromModel<TIncludedModel, 'create'>,
      Partial<GetDataFromModel<TIncludedModel, 'read', true>>,
      GetDataFromModel<TIncludedModel>,
      boolean,
      boolean,
      never
    > = (
      querySet: ReturnTypeOfBaseQuerySetMethods<
        TType,
        TIncludedModel,
        GetDataFromModel<TIncludedModel>,
        Partial<GetDataFromModel<TIncludedModel, 'update'>>,
        GetDataFromModel<TIncludedModel, 'create'>,
        Partial<GetDataFromModel<TIncludedModel, 'read', true>>,
        GetDataFromModel<TIncludedModel>,
        THasSearch,
        true,
        never
      >
    ) => ReturnTypeOfBaseQuerySetMethods<
      TType,
      TIncludedModel,
      GetDataFromModel<TIncludedModel>,
      Partial<GetDataFromModel<TIncludedModel, 'update'>>,
      GetDataFromModel<TIncludedModel, 'create'>,
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
        ?
            | (ReturnType<TNestedQuerySet> extends QuerySet<any, any, infer TResult, any, any, any, any, any, any>
                ? TResult
                : never)[]
            | undefined
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
    TUpdate & {
      [TKey in TRelationName]?: Partial<
        ReturnType<TNestedQuerySet> extends QuerySet<any, any, infer TResult, any, any, any, any, any, any>
          ? TResult
          : never
      >[];
    },
    TCreate &
      (
        | ForeignKeyModelsRelatedName<TIncludedModel, TModel>[TRelationName]
        | ForeignKeyModelsRelatedName<TIncludedModel, TModel>[TRelationName]
        | ForeignKeyModelsRelationName<TModel, TIncludedModel>[TRelationName] extends undefined[] | undefined
        ? {
            [TKey in TRelationName]?: (ReturnType<TNestedQuerySet> extends QuerySet<
              any,
              any,
              infer TResult,
              any,
              any,
              any,
              any,
              any,
              any
            >
              ? TResult
              : never)[];
          }
        : {
            [TKey in TRelationName]: (ReturnType<TNestedQuerySet> extends QuerySet<
              any,
              any,
              infer TResult,
              any,
              any,
              any,
              any,
              any,
              any
            >
              ? TResult
              : never)[];
          }),
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
    const newQuerySet = getNewQuerySet();
    newQuerySet['__isJoin'] = true as any;
    const queryCallbackResult = queryCallback ? queryCallback(getNewQuerySet() as any) : getNewQuerySet();

    for (const field of Object.keys(this.__query)) {
      if (field === 'joins') continue;
      (newQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }

    newQuerySet['__query'].joins = () => ({
      [relationName]: {
        model,
        querySet: queryCallbackResult as any
      }
    });

    return newQuerySet as any;
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

  protected async __queryTheData(
    model: {
      new (...args: any[]): any;
    },
    engine: DatabaseAdapter
  ) {
    const baseModelAsModel = model as typeof BaseModel & typeof Model & ModelType<any, any>;
    baseModelAsModel['_fields']();
    const toQueryAfterBase = [];
    const toQueryBeforeBase = [];
    const indirectlyRelatedToRun = [];
    const directlyRelatedToRun = [];
    const joins = this.__query.joins?.();
    const joinsEntries = joins ? Object.entries(joins) : [];
    for (const joinsData of joinsEntries) {
      const [relationOrRelatedName, { model, querySet }] = joinsData;
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

      const fieldNameOnRelationToFilter = isDirectlyRelated
        ? baseModelAsModel['__associations'][joinedModelName].byRelationName.get(relationOrRelatedName)?.['__toField']
        : baseModelAsModel['__associations'][joinedModelName].byRelatedName.get(relationOrRelatedName)?.['__fieldName'];
      const fromCurrentModelsFieldData = isDirectlyRelated
      ? baseModelAsModel['__associations'][joinedModelName].byRelationName.get(relationOrRelatedName)?.['__fieldName']
      : baseModelAsModel['__associations'][joinedModelName].byRelatedName.get(relationOrRelatedName)?.['__toField'];

      const hasSearch = typeof querySet['__query'].where === 'function';
      if (hasSearch)
        toQueryBeforeBase.push({
          relationOrRelatedName,
          fieldNameOnRelationToFilter,
          fromCurrentModelsFieldData,
          joinedModel,
          querySet
        });
      else
        toQueryAfterBase.push({
          relationOrRelatedName,
          fieldNameOnRelationToFilter,
          fromCurrentModelsFieldData,
          joinedModel,
          querySet
        });
    }

    const query: any = {};

    if (toQueryBeforeBase.length > 0) {
      const {
        relationOrRelatedName,
        fieldNameOnRelationToFilter,
        fromCurrentModelsFieldData,
        joinedModel,
        querySet
      } = toQueryBeforeBase[0];
      const nestedQueryData = await querySet.__queryTheData(joinedModel, engine);
    }
    if (this.__query.fields) query['fields'] = this.__query.fields();
    if (this.__query.orderBy) query['ordering'] = this.__query.orderBy();
    if (this.__query.limit) query['limit'] = this.__query.limit();
    if (this.__query.offset) query['offset'] = this.__query.offset();
    if (this.__query.where) {
      query['search'] = await parseSearch(
        engine,
        new baseModelAsModel() as any,
        await baseModelAsModel.default.getInstance(engine.connectionName),
        this.__query.where(),
      );
    }


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
> extends QuerySet<TType, TModel, TResult, TUpdate, TCreate, TSearch, TOrder, THasSearch, TIsJoin, TAlreadyDefinedRelations> {

  select<const TFields extends (keyof GetDataFromModel<TModel>)[]>(
    fields: TFields
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
    if (this.__query.fields) newQuerySet['__query'].fields = () => [...this.__query.fields!(), ...(fields as string[])];
    else newQuerySet['__query'].fields = () => fields as string[];

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
  TAlreadyDefinedRelations> {
  orderBy(
    ordering: OrderingOfFields<keyof TOrder extends string ? keyof TOrder : never>
  ): GetQuerySet<TType, TModel, TResult, TUpdate, TCreate, TSearch, TOrder, THasSearch, TIsJoin, TAlreadyDefinedRelations> {
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

    return newQuerySet as any;
  }

  limit(
    limit: number
  ): GetQuerySet<TType, TModel, TResult, TUpdate, TCreate, TSearch, TOrder, THasSearch, TIsJoin, TAlreadyDefinedRelations> {
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
    return newQuerySet as any;
  }

  offset(
    offset: number
  ): GetQuerySet<TType, TModel, TResult, TUpdate, TCreate, TSearch, TOrder, THasSearch, TIsJoin, TAlreadyDefinedRelations> {
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
    return newQuerySet as any;
  }
}

export class SetQuerySet<
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
> extends QuerySet<TType, TModel, TResult, TUpdate, TCreate, TSearch, TOrder, THasSearch, TIsJoin, TAlreadyDefinedRelations> {
  data(
    data: THasSearch extends true ? TUpdate : TCreate,
    force?: boolean
  ): SetQuerySet<'set', TModel, TResult, TUpdate, TCreate, TSearch, TOrder, THasSearch, TIsJoin, TAlreadyDefinedRelations> {
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

    const forceUpdate = force || false;
    for (const field of Object.keys(this.__query)) {
      if (field === 'data') continue;
      (newQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }

    if (this.__query.data)
      newQuerySet['__query'].data = () =>
        [
          {
            ...this.__query.data!()[0],
            ...data
          },
          forceUpdate
        ] as const;
    else newQuerySet['__query'].data = () => [data as any, forceUpdate] as const;

    const keysToFreeze = Object.keys(newQuerySet);
    for (const key of keysToFreeze) {
      if (key.startsWith('__') || key === 'data') continue;
      Object.defineProperty(newQuerySet, key, {
        configurable: false,
        writable: false,
        enumerable: false,
        value: undefined
      });
    }
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
> extends QuerySet<TType, TModel, TResult, TUpdate, TCreate, TSearch, TOrder, THasSearch, TIsJoin, TAlreadyDefinedRelations> {
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
