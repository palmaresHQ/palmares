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
import type { ModelType } from './model';

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
      relatedTo: infer TRelatedToModel | (() => infer TRelatedToModel);
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
      relatedTo: infer TRelatedToModel | (() => infer TRelatedToModel);
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
  where?: () => Record<string, any | OrderingOfFields<any>>;
  joins?: () => Record<
    string,
    {
      model: any;
      querySet: QuerySet<any, any, any, any, any, any, any>;
    }
  >;
};

export class QuerySet<
  TType extends 'get' | 'set' | 'remove',
  TModel,
  TResult = GetDataFromModel<TModel>,
  TUpdate = Partial<GetDataFromModel<TModel, 'update'>>,
  TCreate = GetDataFromModel<TModel, 'create'>,
  TSearch = Partial<GetDataFromModel<TModel, 'read', true>>,
  TOrder = GetDataFromModel<TModel>,
  TAlreadyDefinedRelations = never
> {
  protected __type: TType;
  protected __query: QuerySetQueryData;

  constructor(type: TType) {
    this.__type = type;
    this.__query = {};
  }

  join<
    TIncludedModel,
    TRelationName extends Exclude<
      | keyof ForeignKeyModelsRelationName<TModel, TIncludedModel>
      | keyof ForeignKeyModelsRelatedName<TIncludedModel, TModel>,
      TAlreadyDefinedRelations
    >,
    TNestedQuerySet extends (
      querySet: QuerySet<TType, TIncludedModel, GetDataFromModel<TIncludedModel>>
    ) => QuerySet<TType, TIncludedModel, any> = (
      querySet: QuerySet<TType, TIncludedModel, GetDataFromModel<TIncludedModel>>
    ) => QuerySet<TType, TIncludedModel, GetDataFromModel<TIncludedModel>>
  >(
    model: TIncludedModel,
    relationName: TRelationName,
    queryCallback?: TNestedQuerySet
  ): QuerySet<
    TType,
    TModel,
    TResult & {
      [TKey in TRelationName]: ForeignKeyModelsRelatedName<TIncludedModel, TModel>[TRelationName] extends undefined[]
        ?
            | (ReturnType<TNestedQuerySet> extends
                | QuerySet<any, any, infer TResult>
                | Omit<QuerySet<any, any, infer TResult>, any>
                ? TResult
                : never)[]
            | undefined
        : ForeignKeyModelsRelatedName<TIncludedModel, TModel>[TRelationName] extends unknown[]
          ? (ReturnType<TNestedQuerySet> extends
              | QuerySet<any, any, infer TResult>
              | Omit<QuerySet<any, any, infer TResult>, any>
              ? TResult
              : never)[]
          :
                | ForeignKeyModelsRelatedName<TIncludedModel, TModel>[TRelationName]
                | ForeignKeyModelsRelationName<TModel, TIncludedModel>[TRelationName] extends undefined
            ? ReturnType<TNestedQuerySet> extends
                | QuerySet<any, any, infer TResult>
                | Omit<QuerySet<any, any, infer TResult>, any>
              ? TResult | undefined
              : never
            : ReturnType<TNestedQuerySet> extends
                  | QuerySet<any, any, infer TResult>
                  | Omit<QuerySet<any, any, infer TResult>, any>
              ? TResult
              : never;
    },
    TUpdate & {
      [TKey in TRelationName]?: Partial<
        ReturnType<TNestedQuerySet> extends QuerySet<any, any, infer TResult> ? TResult : never
      >[];
    },
    TCreate &
      (
        | ForeignKeyModelsRelatedName<TIncludedModel, TModel>[TRelationName]
        | ForeignKeyModelsRelatedName<TIncludedModel, TModel>[TRelationName]
        | ForeignKeyModelsRelationName<TModel, TIncludedModel>[TRelationName] extends undefined[] | undefined
        ? {
            [TKey in TRelationName]?: (ReturnType<TNestedQuerySet> extends QuerySet<any, any, infer TResult>
              ? TResult
              : never)[];
          }
        : {
            [TKey in TRelationName]: (ReturnType<TNestedQuerySet> extends QuerySet<any, any, infer TResult>
              ? TResult
              : never)[];
          }),
    TSearch,
    TOrder,
    TAlreadyDefinedRelations | TRelationName
  > & {
    remove: never;
  } {
    const newQuerySet = new QuerySet(this.__type);

    const queryCallbackResult = queryCallback
      ? queryCallback(new QuerySet<TType, TIncludedModel, GetDataFromModel<TIncludedModel>>(this.__type))
      : new QuerySet(this.__type);

    for (const field of Object.keys(this.__query)) {
      if (field === 'joins') continue;
      (newQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }

    newQuerySet['__query'].joins = () => ({
      ...(this.__query.joins?.() || {}),
      [relationName]: {
        model,
        querySet: queryCallbackResult
      }
    });

    return newQuerySet as any;
  }

  select<const TFields extends (keyof GetDataFromModel<TModel>)[]>(
    fields: TFields
  ): QuerySet<
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
    TAlreadyDefinedRelations
  > & {
    update: never;
    remove: never;
    create: never;
  } {
    const newQuerySet = new QuerySet<
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
      TAlreadyDefinedRelations
    >(this.__type);

    for (const field of Object.keys(this.__query)) {
      if (field === 'fields') continue;
      (newQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }
    if (this.__query.fields) {
      newQuerySet['__query'].fields = () => [...this.__query.fields!(), ...(fields as string[])];
    } else {
      newQuerySet['__query'].fields = () => fields as string[];
    }
    return newQuerySet as any;
  }

  limit(limit: number): QuerySet<
    TType,
    TModel,
    TResult,
    TUpdate,
    TCreate,
    TSearch,
    TOrder,
    TAlreadyDefinedRelations
  > & {
    update: never;
    remove: never;
    create: never;
  } {
    const newQuerySet = new QuerySet<
      TType,
      TModel,
      TResult,
      TUpdate,
      TCreate,
      TSearch,
      TOrder,
      TAlreadyDefinedRelations
    >(this.__type);

    for (const field of Object.keys(this.__query)) {
      (newQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }

    newQuerySet['__query'].limit = () => limit;
    return newQuerySet as any;
  }

  offset(offset: number): QuerySet<
    TType,
    TModel,
    TResult,
    TUpdate,
    TCreate,
    TSearch,
    TOrder,
    TAlreadyDefinedRelations
  > & {
    update: never;
    remove: never;
    create: never;
  } {
    const newQuerySet = new QuerySet<
      TType,
      TModel,
      TResult,
      TUpdate,
      TCreate,
      TSearch,
      TOrder,
      TAlreadyDefinedRelations
    >(this.__type);

    for (const field of Object.keys(this.__query)) {
      (newQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }

    newQuerySet['__query'].offset = () => offset;
    return newQuerySet as any;
  }

  update(data: TUpdate): QuerySet<
    'set',
    TModel,
    TResult,
    TUpdate,
    TCreate,
    TSearch,
    TOrder,
    TAlreadyDefinedRelations
  > & {
    create: never;
    remove: never;
    select: never;
    search: never;
    orderBy: never;
    limit: never;
    offset: never;
  } {
    return {} as any;
  }

  create(data: TCreate): QuerySet<
    'set',
    TModel,
    TResult,
    TUpdate,
    TCreate,
    TSearch,
    TOrder,
    TAlreadyDefinedRelations
  > & {
    update: never;
    remove: never;
    select: never;
    search: never;
    orderBy: never;
    limit: never;
    offset: never;
  } {
    return {} as any;
  }

  /**
   * You can combine as many where clauses as you want. This way you can reuse the same query.
   */
  where(
    search: TSearch
  ): QuerySet<TType, TModel, TResult, TUpdate, TCreate, TSearch, TOrder, TAlreadyDefinedRelations> & { create: never } {
    const newQuerySet = new QuerySet<
      TType,
      TModel,
      TResult,
      TUpdate,
      TCreate,
      TSearch,
      TOrder,
      TAlreadyDefinedRelations
    >(this.__type);

    for (const field of Object.keys(this.__query)) {
      if (field === 'where') continue;
      (newQuerySet['__query'] as any)[field] = (this.__query as any)[field];
    }

    if (this.__query.where) {
      newQuerySet['__query'].where = () => ({
        ...this.__query.where!(),
        ...search
      });
    } else {
      newQuerySet['__query'].where = () => search as any;
    }

    return newQuerySet as any;
  }

  orderBy(ordering: OrderingOfFields<keyof TOrder extends string ? keyof TOrder : never>): QuerySet<
    TType,
    TModel,
    TResult,
    TUpdate,
    TCreate,
    TSearch,
    TOrder,
    TAlreadyDefinedRelations
  > & {
    update: never;
    remove: never;
    create: never;
  } {
    const newQuerySet = new QuerySet<
      TType,
      TModel,
      TResult,
      TUpdate,
      TCreate,
      TSearch,
      TOrder,
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

  static new<TModel>(): QuerySet<'get', TModel> {
    return new QuerySet('get');
  }

  protected __getQueryFormatted() {
    const query: any = {};
    const rootQuery = {};
    const joins = this.__query.joins?.();

    if (this.__query.fields) query['fields'] = this.__query.fields();
    if (this.__query.orderBy) query['ordering'] = this.__query.orderBy();
    if (this.__query.limit) query['limit'] = this.__query.limit();
    if (this.__query.offset) query['offset'] = this.__query.offset();
    if (this.__query.where) query['search'] = this.__query.where();

    const joinsEntries = joins ? Object.entries(joins) : [];
    while (joinsEntries.length > 0) {
      const [key, { model, querySet }] = joinsEntries.shift();
      if (Array.isArray(query['includes']) === false) query.includes = [];

      console.log(key, model, querySet);
      const nestedQueryData = querySet.__getQueryFormatted();
      console.log(nestedQueryData);
      console.log(key, query);
    }
    return query;
  }
}
