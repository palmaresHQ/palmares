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
  > ? TAllowNull extends true ? undefined : unknown : unknown
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
    > ? TAllowNull extends true
      ? TUnique extends true
        ? undefined
        : undefined[]
      : TUnique extends true
        ? undefined
        : undefined[]
    : unknown[]
};

type GetDataFromModel<TModel, TType extends 'create' | 'update' | 'read' = 'read'> = {
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
        : TRead
    : never;
};

export default class GetQueryBuilder<TModel, TResult = GetDataFromModel<TModel>, TAlreadyDefinedRelations = never> {
  includes<
    TIncludedModel,
    TRelationName extends Exclude<
      | keyof ForeignKeyModelsRelationName<TModel, TIncludedModel>
      | keyof ForeignKeyModelsRelatedName<TIncludedModel, TModel>,
      TAlreadyDefinedRelations
    >,
    TNestedQueryBuilder extends (
      queryBuilder: GetQueryBuilder<TIncludedModel, GetDataFromModel<TIncludedModel>>
    ) => GetQueryBuilder<TIncludedModel, any> = (
      queryBuilder: GetQueryBuilder<TIncludedModel, GetDataFromModel<TIncludedModel>>
    ) => GetQueryBuilder<TIncludedModel, GetDataFromModel<TIncludedModel>>
  >(
    model: TIncludedModel,
    relationName: TRelationName,
    queryCallback?: TNestedQueryBuilder
  ): GetQueryBuilder<
    TModel,
    TResult & {
      [TKey in TRelationName]: ForeignKeyModelsRelatedName<TIncludedModel, TModel>[TRelationName] extends undefined[]
        ? (ReturnType<TNestedQueryBuilder> extends GetQueryBuilder<any, infer TResult> ? TResult | undefined : never)[]
        : ForeignKeyModelsRelatedName<TIncludedModel, TModel>[TRelationName] extends unknown[]
        ? (ReturnType<TNestedQueryBuilder> extends GetQueryBuilder<any, infer TResult> ? TResult : never)[]
        : ForeignKeyModelsRelatedName<TIncludedModel, TModel>[TRelationName] extends undefined
        ? ReturnType<TNestedQueryBuilder> extends GetQueryBuilder<any, infer TResult> ? TResult  | undefined : never
        : ForeignKeyModelsRelationName<TModel, TIncludedModel>[TRelationName] extends undefined
        ? ReturnType<TNestedQueryBuilder> extends GetQueryBuilder<any, infer TResult> ? TResult  | undefined : never
        : ReturnType<TNestedQueryBuilder> extends GetQueryBuilder<any, infer TResult> ? TResult : never
    },
    TAlreadyDefinedRelations | TRelationName
  > {
    return {} as any;
  }

  fields<const TFields extends (keyof TResult)[]>(
    fields: TFields
  ): GetQueryBuilder<TModel, Pick<TResult, TFields[number]>, TAlreadyDefinedRelations> {
    return {} as any;
  }

  result(): TResult {
    return {} as any;
  }
}
