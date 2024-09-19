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
} from '../fields';
import type { BaseModel, Model, ModelType, model } from '../model';

export type PalmaresTransactionsType = {
  isSetOrRemoveOperation: 'set' | 'remove';
  data: any[];
};

export type FieldsOfModelOptionsType<TModel> = keyof AllFieldsOfModel<TModel>;
export type FieldsOFModelType<TModel> = readonly FieldsOfModelOptionsType<TModel>[];

export type OnlyFieldsOfModelType<TModel> = TModel extends {
  fields: infer TFields;
}
  ? TFields
  : unknown;

export type AllFieldsOfModel<TModel> = TModel extends {
  fields: infer TFields;
}
  ? TFields
  : unknown;

/**
 * Lazily retrieves all of the options of a given model.
 */
export type AllOptionsOfModel<TModel> = TModel extends {
  options: infer TOptions;
}
  ? TOptions
  : unknown;

export type OrderingOfModelsType<TFields extends string> = readonly (TFields | TFields extends string
  ? TFields | `-${TFields}`
  : never)[];

/**
 * We check if two models are equal by comparing their fields and options.
 *
 * If both are equal, then we are referring to the same model, otherwise we are not.
 */
export type AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<TModelA, TModelB> =
  keyof AllFieldsOfModel<TModelA> extends keyof AllFieldsOfModel<TModelB>
    ? AllOptionsOfModel<TModelA> extends AllOptionsOfModel<TModelB>
      ? true
      : false
    : false;

export type ExtractRelationsNames<TParentModel, TChildModel> = readonly ValueOf<
  {
    // eslint-disable-next-line max-len
    [TFieldName in keyof AllFieldsOfModel<TParentModel> as AllFieldsOfModel<TParentModel>[TFieldName] extends ForeignKeyField<
      any,
      any
    >
      ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
          InstanceType<
            AllFieldsOfModel<TParentModel>[TFieldName] extends ForeignKeyField<
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
                relationName: any;
                toField: any;
              }
            >
              ? TRelatedToModel extends abstract new (...args: any) => any
                ? TRelatedToModel
                : never
              : never
          >,
          TChildModel
        > extends true
        ? TFieldName
        : never
      : never]: AllFieldsOfModel<TParentModel>[TFieldName] extends ForeignKeyField<
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
        relatedName: any;
        relationName: infer TRelationName extends string;
        toField: any;
      }
    >
      ? TRelationName
      : unknown;
  } & {
    // eslint-disable-next-line max-len
    [TFieldName in keyof AllFieldsOfModel<TChildModel> as AllFieldsOfModel<TChildModel>[TFieldName] extends ForeignKeyField<
      any,
      any
    >
      ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
          InstanceType<
            AllFieldsOfModel<TChildModel>[TFieldName] extends ForeignKeyField<
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
                relationName: any;
                toField: any;
              }
            >
              ? TRelatedToModel extends abstract new (...args: any) => any
                ? TRelatedToModel
                : never
              : never
          >,
          TParentModel
        > extends true
        ? TFieldName
        : never
      : never]: AllFieldsOfModel<TChildModel>[TFieldName] extends ForeignKeyField<
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
        relationName: any;
        toField: any;
      }
    >
      ? TRelatedName
      : unknown;
  }
>[];

// --------- INCLUDES ----------- //
export type Include<TCustomData extends object = object> = {
  model: ModelType<any>;
  includes?: Includes<TCustomData>;
  engineName?: string;
  relationNames?: readonly string[];
} & TCustomData;

export type Includes<TCustomData extends object = object> = readonly Include<TCustomData>[] | undefined;

type ValueOf<T> = T[keyof T];

export type IncludesValidated<
  TParentModel,
  TIncludes extends Includes,
  TIsCreateOrUpdateData extends boolean = false,
  TCustomData extends object = object
> = TIncludes extends readonly [
  {
    readonly model: infer TInferedModel;
    includes?: infer TInferedIncludesOfModel;
  },
  ...infer TInferedRestIncludes
]
  ? TInferedModel extends ModelType<any>
    ? ValidateModelsOfIncludes<TParentModel, TInferedModel> extends never
      ? readonly []
      : readonly [
          TInferedIncludesOfModel extends Includes
            ? TIsCreateOrUpdateData extends true
              ? {
                  model: ValidateModelsOfIncludes<TParentModel, TInferedModel>;
                  includes?: IncludesValidated<
                    InstanceType<TInferedModel>,
                    TInferedIncludesOfModel,
                    TIsCreateOrUpdateData,
                    TCustomData
                  >;
                  engineName?: string;
                  relationNames?: readonly ExtractRelationsNames<TParentModel, InstanceType<TInferedModel>>[];
                } & TCustomData
              : {
                  model: ValidateModelsOfIncludes<TParentModel, TInferedModel>;
                  fields?: FieldsOFModelType<InstanceType<TInferedModel>>;
                  engineName?: string;
                  relationNames?: readonly ExtractRelationsNames<TParentModel, InstanceType<TInferedModel>>[];
                  ordering?: OrderingOfModelsType<
                    FieldsOfModelOptionsType<InstanceType<TInferedModel>> extends string
                      ? FieldsOfModelOptionsType<InstanceType<TInferedModel>>
                      : string
                  >;
                  shouldRemove?: boolean;
                  limit?: number;
                  offset?: number | string;
                  includes?: IncludesValidated<
                    InstanceType<TInferedModel>,
                    TInferedIncludesOfModel,
                    TIsCreateOrUpdateData,
                    TCustomData
                  >;
                } & TCustomData
            : TIsCreateOrUpdateData extends true
              ? {
                  model: ValidateModelsOfIncludes<TParentModel, TInferedModel>;
                  engineName?: string;
                  relationNames?: readonly ExtractRelationsNames<TParentModel, InstanceType<TInferedModel>>[];
                } & TCustomData
              : {
                  model: ValidateModelsOfIncludes<TParentModel, TInferedModel>;
                  fields?: FieldsOFModelType<InstanceType<TInferedModel>>;
                  engineName?: string;
                  relationNames?: ExtractRelationsNames<TParentModel, InstanceType<TInferedModel>>;
                  ordering?: OrderingOfModelsType<
                    FieldsOfModelOptionsType<InstanceType<TInferedModel>> extends string
                      ? FieldsOfModelOptionsType<InstanceType<TInferedModel>>
                      : string
                  >;
                  shouldRemove?: boolean;
                  limit?: number;
                  offset?: number | string;
                } & TCustomData,
          ...(TInferedRestIncludes extends Includes
            ? IncludesValidated<TParentModel, TInferedRestIncludes, TIsCreateOrUpdateData, TCustomData>
            : readonly [])
        ]
    : readonly []
  : TIncludes;

export type ValidateModelsOfIncludes<TParentModel, TChildModel extends new (...args: any) => any> = ValueOf<
  {
    [TFieldName in keyof AllFieldsOfModel<InstanceType<TChildModel>> as AllFieldsOfModel<
      InstanceType<TChildModel>
    >[TFieldName] extends ForeignKeyField<any, any>
      ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
          InstanceType<
            AllFieldsOfModel<TChildModel>[TFieldName] extends ForeignKeyField<
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
                relationName: any;
                toField: any;
              }
            >
              ? TRelatedToModel extends abstract new (...args: any) => any
                ? TRelatedToModel
                : never
              : never
          >,
          //InstanceType<AllFieldsOfModel<InstanceType<TChildModel>>[TFieldName]['modelRelatedTo']>,
          TParentModel
        > extends true
        ? TFieldName
        : never
      : never]: TChildModel;
  } & {
    // eslint-disable-next-line max-len
    [TFieldName in keyof AllFieldsOfModel<TParentModel> as AllFieldsOfModel<TParentModel>[TFieldName] extends ForeignKeyField<
      any,
      any
    >
      ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
          InstanceType<
            AllFieldsOfModel<TParentModel>[TFieldName] extends ForeignKeyField<
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
                relationName: any;
                toField: any;
              }
            >
              ? TRelatedToModel extends abstract new (...args: any) => any
                ? TRelatedToModel
                : never
              : never
          >,
          //InstanceType<AllFieldsOfModel<TParentModel>[TFieldName]['modelRelatedTo']>,
          InstanceType<TChildModel>
        > extends true
        ? TFieldName
        : never
      : never]: TChildModel;
  }
>;
// --------- FIELDS ----------- //
export type ExtractModelFromIncludesType<
  TIncludes extends Includes,
  TOnlyModels extends readonly any[]
> = TIncludes extends readonly [{ model: infer TModel }, ...infer TRest]
  ? TModel extends abstract new (...args: any) => any
    ? ExtractModelFromIncludesType<
        TRest extends Includes ? TRest : undefined,
        readonly [...TOnlyModels, InstanceType<TModel>]
      >
    : TOnlyModels
  : TOnlyModels;

type HasDefaultValueFieldsOrIsAuto<TModel> = {
  [TFieldName in keyof AllFieldsOfModel<TModel> as AllFieldsOfModel<TModel>[TFieldName] extends
    | AutoField<
        any,
        {
          unique: any;
          auto: infer TIsAuto extends boolean;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: infer THasDefaultValue extends boolean;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    | TextField<
        any,
        {
          unique: any;
          auto: infer TIsAuto extends boolean;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: infer THasDefaultValue extends boolean;
          allowBlank: any;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    | CharField<
        any,
        {
          unique: any;
          auto: infer TIsAuto extends boolean;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: infer THasDefaultValue extends boolean;
          maxLength: any;
          allowBlank: any;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    | Field<
        any,
        {
          unique: any;
          auto: infer TIsAuto extends boolean;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: infer THasDefaultValue extends boolean;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    ? TAllowNull extends true
      ? TFieldName
      : TIsAuto extends true
        ? TFieldName
        : THasDefaultValue extends true
          ? TFieldName
          : never
    : never]: AllFieldsOfModel<TModel>[TFieldName];
};

type DoNotHaveDefaultValueFieldsOrIsNotAuto<TModel> = {
  [TFieldName in keyof AllFieldsOfModel<TModel> as AllFieldsOfModel<TModel>[TFieldName] extends
    | AutoField<
        any,
        {
          unique: any;
          auto: infer TIsAuto extends boolean;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: infer THasDefaultValue extends boolean;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    | TextField<
        any,
        {
          unique: any;
          auto: infer TIsAuto extends boolean;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: infer THasDefaultValue extends boolean;
          allowBlank: any;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    | CharField<
        any,
        {
          unique: any;
          auto: infer TIsAuto extends boolean;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: infer THasDefaultValue extends boolean;
          maxLength: any;
          allowBlank: any;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    | Field<
        any,
        {
          unique: any;
          auto: infer TIsAuto extends boolean;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: infer THasDefaultValue extends boolean;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    ? TAllowNull extends false
      ? THasDefaultValue extends false
        ? TIsAuto extends false
          ? TFieldName
          : never
        : never
      : never
    : never]: AllFieldsOfModel<TModel>[TFieldName];
};

type HasNullFields<TModel> = {
  [TFieldName in keyof AllFieldsOfModel<TModel> as AllFieldsOfModel<TModel>[TFieldName] extends
    | AutoField<
        any,
        {
          unique: any;
          auto: any;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: any;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    | TextField<
        any,
        {
          unique: any;
          auto: any;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: any;
          allowBlank: any;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    | CharField<
        any,
        {
          unique: any;
          auto: any;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: any;
          maxLength: any;
          allowBlank: any;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    | Field<
        any,
        {
          unique: any;
          auto: any;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: any;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    ? TAllowNull extends true
      ? TFieldName
      : never
    : never]: AllFieldsOfModel<TModel>[TFieldName];
};

type DoesNotHaveNullFields<TModel> = {
  [TFieldName in keyof AllFieldsOfModel<TModel> as AllFieldsOfModel<TModel>[TFieldName] extends
    | AutoField<
        any,
        {
          unique: any;
          auto: any;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: any;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    | TextField<
        any,
        {
          unique: any;
          auto: any;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: any;
          allowBlank: any;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    | CharField<
        any,
        {
          unique: any;
          auto: any;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: any;
          maxLength: any;
          allowBlank: any;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    | Field<
        any,
        {
          unique: any;
          auto: any;
          allowNull: infer TAllowNull extends boolean;
          dbIndex: any;
          isPrimaryKey: any;
          hasDefaultValue: any;
          defaultValue: any;
          underscored: any;
          typeName: any;
          databaseName: any;
          engineInstance: any;
          customAttributes: any;
        }
      >
    ? TAllowNull extends true
      ? never
      : TFieldName
    : never]: AllFieldsOfModel<TModel>[TFieldName];
};

type OptionalFields<
  TModel,
  TFieldsToConsider extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TRelationsToIgnore extends any[] | undefined = undefined,
  TIsCreateOrUpdate extends boolean = false,
  TIsForSearch extends boolean = false
> = {
  [TFieldName in TIsCreateOrUpdate extends true
    ? keyof HasDefaultValueFieldsOrIsAuto<TModel>
    : never as TFieldName extends TFieldsToConsider[number] | undefined
    ? TRelationsToIgnore extends readonly any[]
      ? AllFieldsOfModel<TModel>[TFieldName] extends ForeignKeyField<
          any,
          {
            hasDefaultValue: any;
            unique: any;
            auto: any;
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
            relationName: any;
            toField: any;
          }
        >
        ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
            InstanceType<TRelatedToModel extends abstract new (...args: any) => any ? TRelatedToModel : never>,
            TRelationsToIgnore[number]
          > extends true
          ? never
          : TFieldName
        : TFieldName
      : TFieldName
    : never]?: GetField<
    AllFieldsOfModel<TModel>[TFieldName] extends Field<any, any> ? AllFieldsOfModel<TModel>[TFieldName] : never,
    TIsForSearch,
    TIsCreateOrUpdate
  >;
};

type RequiredFields<
  TModel,
  TFieldsToConsider extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TRelationsToIgnore extends readonly any[] | undefined = undefined,
  TIsCreateOrUpdate extends boolean = false,
  TIsForSearch extends boolean = false
> = {
  [TFieldName in TIsCreateOrUpdate extends true
    ? keyof DoNotHaveDefaultValueFieldsOrIsNotAuto<TModel>
    : keyof AllFieldsOfModel<TModel> as TFieldName extends TFieldsToConsider[number] | undefined
    ? TRelationsToIgnore extends readonly any[]
      ? AllFieldsOfModel<TModel>[TFieldName] extends ForeignKeyField<
          any,
          {
            hasDefaultValue: any;
            unique: any;
            auto: any;
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
            relationName: any;
            toField: any;
          }
        >
        ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
            InstanceType<TRelatedToModel extends abstract new (...args: any) => any ? TRelatedToModel : never>,
            TRelationsToIgnore[number]
          > extends true
          ? never
          : TFieldName
        : TFieldName
      : TFieldName
    : never]: GetField<
    AllFieldsOfModel<TModel>[TFieldName] extends Field<any, any> ? AllFieldsOfModel<TModel>[TFieldName] : never,
    TIsForSearch,
    TIsCreateOrUpdate
  >;
};

export type OperatorsOfQuery =
  | 'eq'
  | 'is'
  | 'or'
  | 'and'
  | 'in'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'between'
  | 'like';

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

type GetField<
  TField extends Field<any, any>,
  TIsSearch extends boolean = true,
  TIsCreateOrUpdate extends boolean = false
> = TField extends
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
  ? TIsSearch extends true
    ? AddOperation<TRead> | TRead
    : TIsCreateOrUpdate extends true
      ? TCreate | TUpdate
      : TRead
  : never;

type BaseModelFieldsInQueries<
  TModel,
  TFieldsToConsider extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TRelationsToIgnore extends any[] | undefined = undefined,
  TIsCreateOrUpdate extends boolean = false,
  TIsForSearch extends boolean = false
> = OptionalFields<TModel, TFieldsToConsider, TRelationsToIgnore, TIsCreateOrUpdate, TIsForSearch> &
  RequiredFields<TModel, TFieldsToConsider, TRelationsToIgnore, TIsCreateOrUpdate, TIsForSearch>;

export type ModelFieldsInQueries<
  TModel,
  TFieldsToConsider extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TRelationsToIgnore extends any[] | undefined = undefined,
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false
> = TIsAllRequired extends true
  ? Required<BaseModelFieldsInQueries<TModel, TFieldsToConsider, TRelationsToIgnore, TIsCreateOrUpdate, TIsForSearch>>
  : TIsAllOptional extends true
    ? Partial<BaseModelFieldsInQueries<TModel, TFieldsToConsider, TRelationsToIgnore, TIsCreateOrUpdate, TIsForSearch>>
    : BaseModelFieldsInQueries<TModel, TFieldsToConsider, TRelationsToIgnore, TIsCreateOrUpdate, TIsForSearch>;

// -------------- From this line below it is related to the relation fields ------------------
type RelatedFieldOfModelOptional<
  TModel,
  TRelatedModel,
  TIncludes extends Includes,
  TFieldsOfRelatedModel extends FieldsOFModelType<TRelatedModel> = FieldsOFModelType<TRelatedModel>,
  TRelationNamesOfModel extends readonly string[] = readonly string[],
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false
> = {
  [TFieldName in keyof AllFieldsOfModel<TModel> as AllFieldsOfModel<TModel>[TFieldName] extends ForeignKeyField<
    any,
    {
      hasDefaultValue: infer THasDefaultValue extends boolean;
      unique: any;
      auto: any;
      allowNull: infer TAllowNull extends boolean;
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
    ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
        InstanceType<TRelatedToModel extends abstract new (...args: any) => any ? TRelatedToModel : never>,
        TRelatedModel
      > extends true
      ? TRelationName extends TRelationNamesOfModel[number]
        ? TAllowNull extends true
          ? TRelationName
          : never
        : never
      : never
    : never]?: AllFieldsOfModel<TModel>[TFieldName] extends ForeignKeyField<any, any>
    ? IncludesRelatedModels<
        ModelFieldsInQueries<
          TRelatedModel,
          TFieldsOfRelatedModel,
          ExtractModelFromIncludesType<TIncludes, []>,
          TIsCreateOrUpdate,
          TIsAllRequired,
          TIsAllOptional,
          TIsForSearch
        >,
        TRelatedModel,
        TIncludes,
        TFieldsOfRelatedModel,
        TIsCreateOrUpdate,
        TIsAllRequired,
        TIsAllOptional,
        TIsForSearch
      >
    : never;
};

type RelatedFieldOfModelRequired<
  TModel,
  TRelatedModel,
  TIncludes extends Includes,
  TFieldsOfRelatedModel extends FieldsOFModelType<TRelatedModel>,
  TRelationNamesOfModel extends readonly string[] = readonly string[],
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false
> = {
  [TFieldName in keyof AllFieldsOfModel<TModel> as AllFieldsOfModel<TModel>[TFieldName] extends ForeignKeyField<
    any,
    {
      hasDefaultValue: infer THasDefaultValue extends boolean;
      unique: any;
      auto: any;
      allowNull: infer TAllowNull extends boolean;
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
    ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
        InstanceType<TRelatedToModel extends abstract new (...args: any) => any ? TRelatedToModel : never>,
        TRelatedModel
      > extends true
      ? THasDefaultValue extends false
        ? TRelationName extends TRelationNamesOfModel[number] | undefined
          ? TAllowNull extends true
            ? never
            : TRelationName
          : never
        : never
      : never
    : never]: AllFieldsOfModel<TModel>[TFieldName] extends ForeignKeyField<any, any>
    ? IncludesRelatedModels<
        ModelFieldsInQueries<
          TRelatedModel,
          TFieldsOfRelatedModel,
          ExtractModelFromIncludesType<TIncludes, []>,
          TIsCreateOrUpdate,
          TIsAllRequired,
          TIsAllOptional,
          TIsForSearch
        >,
        TRelatedModel,
        TIncludes,
        TFieldsOfRelatedModel,
        TIsCreateOrUpdate,
        TIsAllRequired,
        TIsAllOptional,
        TIsForSearch
      >
    : never;
};
// Those are related to indirect relations. For example, the relation Post -> User: So Post will contain a userId field
// and it'll be related to User.
// ON this relation, the User model will contain a userPosts field which will be all of the posts related to the user.
type BaseRelatedFieldToModel<
  TModel,
  TRelatedModel,
  TIncludes extends Includes,
  TFieldsOfRelatedModel extends FieldsOFModelType<TRelatedModel>,
  TIsCreateOrUpdate extends boolean,
  TIsAllRequired extends boolean,
  TIsAllOptional extends boolean,
  TIsForSearch extends boolean
> = IncludesRelatedModels<
  ModelFieldsInQueries<
    TRelatedModel,
    TFieldsOfRelatedModel,
    ExtractModelFromIncludesType<TIncludes, [TModel]>,
    TIsCreateOrUpdate,
    TIsAllRequired,
    TIsAllOptional,
    TIsForSearch
  >,
  TRelatedModel,
  TIncludes,
  TFieldsOfRelatedModel,
  TIsCreateOrUpdate,
  TIsAllRequired,
  TIsAllOptional,
  TIsForSearch
>;

// Those are related to indirect relations. For example, the relation Post -> User: So Post will contain a userId field
// and it'll be related to User.
// ON this relation, the User model will contain a userPosts field which will be all of the posts related to the user.
export type RelatedFieldToModel<
  TModel,
  TRelatedModel,
  TIncludes extends Includes,
  TFieldsOfModel extends FieldsOFModelType<TRelatedModel>,
  TRelationNamesOfModel extends readonly string[],
  TIsCreateOrUpdate extends boolean,
  TIsAllRequired extends boolean,
  TIsAllOptional extends boolean,
  TIsForSearch extends boolean
> = {
  // eslint-disable-next-line max-len
  [TFieldName in keyof AllFieldsOfModel<TRelatedModel> as AllFieldsOfModel<TRelatedModel>[TFieldName] extends ForeignKeyField<
    any,
    {
      hasDefaultValue: any;
      unique: any;
      auto: any;
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
    ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
        InstanceType<TRelatedToModel extends abstract new (...args: any) => any ? TRelatedToModel : never>,
        TModel
      > extends true
      ? TRelatedName extends TRelationNamesOfModel[number]
        ? TRelatedName
        : never
      : never
    : never]: TIsForSearch extends true
    ? BaseRelatedFieldToModel<
        TModel,
        TRelatedModel,
        TIncludes,
        TFieldsOfModel,
        TIsCreateOrUpdate,
        TIsAllRequired,
        TIsAllOptional,
        TIsForSearch
      >
    : AllFieldsOfModel<TRelatedModel>[TFieldName] extends Field<
          any,
          {
            hasDefaultValue: any;
            unique: infer TUnique extends boolean;
            auto: any;
            allowNull: any;
            dbIndex: any;
            isPrimaryKey: any;
            defaultValue: any;
            underscored: any;
            typeName: any;
            databaseName: any;
            engineInstance: any;
            customAttributes: any;
          }
        >
      ? TUnique extends true
        ? BaseRelatedFieldToModel<
            TModel,
            TRelatedModel,
            TIncludes,
            TFieldsOfModel,
            TIsCreateOrUpdate,
            TIsAllRequired,
            TIsAllOptional,
            TIsForSearch
          >
        : BaseRelatedFieldToModel<
            TModel,
            TRelatedModel,
            TIncludes,
            TFieldsOfModel,
            TIsCreateOrUpdate,
            TIsAllRequired,
            TIsAllOptional,
            TIsForSearch
          >[]
      : unknown;
};

type BaseFieldsWithRelationsFromIncludesType<
  TType,
  TModel, // The model that is being queried
  // This is a single included model on the query. It is the model class, not it's instance.
  TIncludedModel extends abstract new (...args: any) => any,
  TToInclude extends Includes,
  TFieldsOfModel extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TRelationNamesOfModel extends readonly string[] = readonly string[],
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false
> = TType &
  RelatedFieldOfModelOptional<
    TModel,
    InstanceType<TIncludedModel>,
    TToInclude,
    TFieldsOfModel,
    TRelationNamesOfModel,
    TIsCreateOrUpdate,
    TIsAllRequired,
    TIsAllOptional,
    TIsForSearch
  > &
  RelatedFieldOfModelRequired<
    TModel,
    InstanceType<TIncludedModel>,
    TToInclude,
    TFieldsOfModel,
    TRelationNamesOfModel,
    TIsCreateOrUpdate,
    TIsAllRequired,
    TIsAllOptional,
    TIsForSearch
  > &
  RelatedFieldToModel<
    TModel,
    InstanceType<TIncludedModel>,
    TToInclude,
    TFieldsOfModel,
    TRelationNamesOfModel,
    TIsCreateOrUpdate,
    TIsAllRequired,
    TIsAllOptional,
    TIsForSearch
  >;

export type FieldsWithRelationsFromIncludesType<
  TType,
  TModel,
  TIncludedModel,
  TToInclude extends Includes,
  TFieldsOfModel extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TRelationNamesOfModel extends readonly string[] = readonly string[],
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false
> = TIsAllRequired extends true
  ? Required<
      BaseFieldsWithRelationsFromIncludesType<
        TType,
        TModel,
        TIncludedModel extends abstract new (...args: any) => any ? TIncludedModel : never,
        TToInclude,
        TFieldsOfModel,
        TRelationNamesOfModel,
        TIsCreateOrUpdate,
        TIsAllRequired,
        TIsAllOptional,
        TIsForSearch
      >
    >
  : TIsAllOptional extends true
    ? Partial<
        BaseFieldsWithRelationsFromIncludesType<
          TType,
          TModel,
          TIncludedModel extends abstract new (...args: any) => any ? TIncludedModel : never,
          TToInclude,
          TFieldsOfModel,
          TRelationNamesOfModel,
          TIsCreateOrUpdate,
          TIsAllRequired,
          TIsAllOptional,
          TIsForSearch
        >
      >
    : BaseFieldsWithRelationsFromIncludesType<
        TType,
        TModel,
        TIncludedModel extends abstract new (...args: any) => any ? TIncludedModel : never,
        TToInclude,
        TFieldsOfModel,
        TRelationNamesOfModel,
        TIsCreateOrUpdate,
        TIsAllRequired,
        TIsAllOptional,
        TIsForSearch
      >;

export type CleanNever<TObject> = {
  [TKey in keyof TObject as Required<TObject>[TKey] extends never ? never : TKey]: TObject[TKey];
};
export type IncludesRelatedModels<
  TType,
  TModel,
  TIncludes extends Includes,
  TFieldsOfModel extends FieldsOFModelType<TModel>,
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false
> = TIncludes extends
  | readonly [
      {
        model: infer TFirstIncludes;
        fields: infer TFirstFieldsOfModel;
        includes: infer TFirstModelIncludes;
        relationNames: infer TFirstRelationNames;
      },
      ...infer TRestIncludes
    ]
  | readonly [
      {
        model: infer TFirstIncludes;
        includes: infer TFirstModelIncludes;
        relationNames: infer TFirstRelationNames;
      },
      ...infer TRestIncludes
    ]
  | readonly [{ model: infer TFirstIncludes }, ...infer TRestIncludes]
  | readonly [{ model: infer TFirstIncludes }]
  ? TFirstIncludes extends abstract new (...args: any) => any
    ? TRestIncludes extends Includes
      ? TFirstModelIncludes extends Includes
        ? CleanNever<TType> & // aqui
            FieldsWithRelationsFromIncludesType<
              CleanNever<TType>,
              TModel,
              TFirstIncludes,
              TFirstModelIncludes,
              FieldsOFModelType<InstanceType<TFirstIncludes>>,
              TFirstRelationNames extends readonly string[] ? TFirstRelationNames : readonly string[],
              TIsCreateOrUpdate,
              TIsAllRequired,
              TIsAllOptional,
              TIsForSearch
            > &
            IncludesRelatedModels<
              CleanNever<TType>,
              TModel,
              TRestIncludes,
              TFieldsOfModel,
              TIsCreateOrUpdate,
              TIsAllRequired,
              TIsAllOptional,
              TIsForSearch
            >
        : CleanNever<TType> &
            FieldsWithRelationsFromIncludesType<
              CleanNever<TType>,
              TModel,
              TFirstIncludes,
              [],
              FieldsOFModelType<InstanceType<TFirstIncludes>>,
              TFirstRelationNames extends readonly string[] ? TFirstRelationNames : readonly string[],
              TIsCreateOrUpdate,
              TIsAllRequired,
              TIsAllOptional,
              TIsForSearch
            > &
            IncludesRelatedModels<
              CleanNever<TType>,
              TModel,
              TRestIncludes,
              TFieldsOfModel,
              TIsCreateOrUpdate,
              TIsAllRequired,
              TIsAllOptional,
              TIsForSearch
            >
      : never
    : never
  : CleanNever<TType>;

// This is the type that will be used in the queries. We add the includes to the model fields and with that we can
// infer the type of the query. It's result as well as the
// data that needs to be passed to the query on the creation or update and etc.
export type ModelFieldsWithIncludes<
  TModel,
  TIncludes extends Includes,
  TFieldsOfModel extends FieldsOFModelType<TModel> | FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false
> = CleanNever<
  IncludesRelatedModels<
    ModelFieldsInQueries<
      TModel,
      TFieldsOfModel,
      undefined,
      TIsCreateOrUpdate,
      TIsAllRequired,
      TIsAllOptional,
      TIsForSearch
    >,
    TModel,
    TIncludes,
    TFieldsOfModel,
    TIsCreateOrUpdate,
    TIsAllRequired,
    TIsAllOptional,
    TIsForSearch
  >
>;
