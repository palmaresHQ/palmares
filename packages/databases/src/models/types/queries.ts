import model, { Model } from '../model';
import type { ForeignKeyField, Field } from '../fields';

export type FieldsOfModelOptionsType<TModel extends Model> =
  keyof (TModel['fields'] & AbstractsAsFields<TModel['abstracts']>);

export type FieldsOFModelType<TModel extends Model> =
  readonly (keyof (TModel['fields'] &
    AbstractsAsFields<TModel['abstracts']>))[];

export type OrderingOfModelsType<TFields extends string> = readonly (
  | TFields
  | TFields extends string
  ? TFields | `-${TFields}`
  : never)[];

export type ExtractRelationsNames<
  TParentModel extends InstanceType<ReturnType<typeof model>>,
  TChildModel extends InstanceType<ReturnType<typeof model>>
> = readonly ValueOf<
  {
    [TKey in keyof TParentModel['fields'] as TParentModel['fields'][TKey] extends ForeignKeyField<
      any,
      any,
      any,
      boolean,
      boolean,
      boolean,
      any,
      undefined,
      any,
      any,
      any,
      any
    >
      ? TParentModel['fields'][TKey]['modelRelatedTo'] extends TChildModel
        ? TKey
        : never
      : never]: TParentModel['fields'][TKey] extends ForeignKeyField<
      any,
      any,
      any,
      boolean,
      boolean,
      boolean,
      any,
      undefined,
      any,
      any,
      any,
      infer TRelationName
    >
      ? TRelationName
      : unknown;
  } & {
    [TKey in keyof TChildModel['fields'] as TChildModel['fields'][TKey] extends ForeignKeyField<
      any,
      any,
      any,
      boolean,
      boolean,
      boolean,
      any,
      undefined,
      any,
      any,
      any,
      any
    >
      ? TChildModel['fields'][TKey]['modelRelatedTo'] extends TParentModel
        ? TKey
        : never
      : never]: TChildModel['fields'][TKey] extends ForeignKeyField<
      any,
      any,
      any,
      boolean,
      boolean,
      boolean,
      any,
      undefined,
      any,
      any,
      infer TRelatedName,
      any
    > // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? TRelatedName
      : unknown;
  }
>[];

// --------- INCLUDES ----------- //
export type Include<TCustomData extends object = object> = {
  model: ReturnType<typeof model>;
  includes?: Includes<TCustomData>;
  engineName?: string;
  relationNames?: readonly string[];
} & TCustomData;

export type Includes<TCustomData extends object = object> =
  | readonly Include<TCustomData>[]
  | undefined;

type ValueOf<T> = T[keyof T];

export type IncludesValidated<
  TParentModel extends InstanceType<ReturnType<typeof model>>,
  T extends Includes,
  TIsCreateOrUpdateData extends boolean = false,
  TCustomData extends object = object
> = T extends readonly [
  {
    readonly model: infer TInferedModel;
    includes?: infer TInferedIncludesOfModel;
  },
  ...infer TInferedRestIncludes
]
  ? TInferedModel extends ReturnType<typeof model>
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
                  relationNames?: readonly ExtractRelationsNames<
                    TParentModel,
                    InstanceType<TInferedModel>
                  >[];
                } & TCustomData
              : {
                  model: ValidateModelsOfIncludes<TParentModel, TInferedModel>;
                  fields?: FieldsOFModelType<InstanceType<TInferedModel>>;
                  engineName?: string;
                  relationNames?: readonly ExtractRelationsNames<
                    TParentModel,
                    InstanceType<TInferedModel>
                  >[];
                  ordering?: OrderingOfModelsType<
                    FieldsOfModelOptionsType<
                      InstanceType<TInferedModel>
                    > extends string
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
                relationNames?: readonly ExtractRelationsNames<
                  TParentModel,
                  InstanceType<TInferedModel>
                >[];
              } & TCustomData
            : {
                model: ValidateModelsOfIncludes<TParentModel, TInferedModel>;
                fields?: FieldsOFModelType<InstanceType<TInferedModel>>;
                engineName?: string;
                relationNames?: ExtractRelationsNames<
                  TParentModel,
                  InstanceType<TInferedModel>
                >;
                ordering?: OrderingOfModelsType<
                  FieldsOfModelOptionsType<
                    InstanceType<TInferedModel>
                  > extends string
                    ? FieldsOfModelOptionsType<InstanceType<TInferedModel>>
                    : string
                >;
                shouldRemove?: boolean;
                limit?: number;
                offset?: number | string;
              } & TCustomData,
          ...(TInferedRestIncludes extends Includes
            ? IncludesValidated<
                TParentModel,
                TInferedRestIncludes,
                TIsCreateOrUpdateData,
                TCustomData
              >
            : readonly [])
        ]
    : readonly []
  : T;

type ValidateModelsOfIncludes<
  TParentModel extends InstanceType<ReturnType<typeof model>>,
  TChildModel extends ReturnType<typeof model>
> = ValueOf<
  {
    [F in keyof InstanceType<TChildModel>['fields'] as InstanceType<TChildModel>['fields'][F] extends ForeignKeyField<
      any,
      any,
      any,
      any,
      any,
      any,
      undefined,
      any,
      any,
      any,
      any
    >
      ? InstanceType<TChildModel>['fields'][F]['modelRelatedTo'] extends TParentModel
        ? F
        : never
      : never]: TChildModel;
  } & {
    [F in keyof TParentModel['fields'] as TParentModel['fields'][F] extends ForeignKeyField<
      any,
      any,
      any,
      any,
      any,
      any,
      undefined,
      any,
      any,
      any,
      any
    >
      ? TParentModel['fields'][F]['modelRelatedTo'] extends InstanceType<TChildModel>
        ? F
        : never
      : never]: TChildModel;
  }
>;

// --------- FIELDS ----------- //
export type ExtractModelFromIncludesType<
  I extends Includes,
  TOnlyModels extends readonly Model[]
> = I extends readonly [{ model: infer TModel }, ...infer TRest]
  ? TModel extends ReturnType<typeof model>
    ? ExtractModelFromIncludesType<
        TRest extends Includes ? TRest : undefined,
        readonly [...TOnlyModels, InstanceType<TModel>]
      >
    : TOnlyModels
  : TOnlyModels;

type HasDefaultValueFieldsOrIsAuto<TModel extends Model> = {
  [F in keyof TModel['fields'] as TModel['fields'][F]['hasDefaultValue'] extends true
    ? F
    : TModel['fields'][F]['isAuto'] extends true
    ? F
    : never]: TModel['fields'][F];
};

type DoNotHaveDefaultValueFieldsOrIsNotAuto<TModel extends Model> = {
  [F in keyof TModel['fields'] as TModel['fields'][F]['hasDefaultValue'] extends false
    ? TModel['fields'][F]['isAuto'] extends false
      ? F
      : never
    : never]: TModel['fields'][F];
};

type HasNullFields<TModel extends Model> = {
  [F in keyof TModel['fields'] as TModel['fields'][F]['allowNull'] extends true
    ? F
    : never]: TModel['fields'][F];
};

type DoesNotHaveNullFields<TModel extends Model> = {
  [F in keyof TModel['fields'] as TModel['fields'][F]['allowNull'] extends true
    ? never
    : F]: TModel['fields'][F];
};

type OptionalFields<
  M extends Model,
  TFieldsToConsider extends FieldsOFModelType<M> = FieldsOFModelType<M>,
  TRelationsToIgnore extends Model[] | undefined = undefined,
  TIsCreateOrUpdate extends boolean = false,
  TIsForSearch extends boolean = false
> = {
  [F in TIsCreateOrUpdate extends true
    ? keyof HasDefaultValueFieldsOrIsAuto<M>
    : keyof HasNullFields<M> as F extends TFieldsToConsider[number] | undefined
    ? TRelationsToIgnore extends readonly InstanceType<
        ReturnType<typeof model>
      >[]
      ? M['fields'][F] extends ForeignKeyField<
          any,
          any,
          any,
          any,
          any,
          any,
          undefined,
          any,
          any,
          any,
          any
        >
        ? M['fields'][F]['modelRelatedTo'] extends TRelationsToIgnore[number]
          ? never
          : F
        : F
      : F
    : never]?: AddNull<M['fields'][F extends string ? F : never], TIsForSearch>;
};

type RequiredFields<
  M extends Model,
  TFieldsToConsider extends FieldsOFModelType<M> = FieldsOFModelType<M>,
  TRelationsToIgnore extends Model[] | undefined = undefined,
  TIsCreateOrUpdate extends boolean = false,
  TIsForSearch extends boolean = false
> = {
  [F in TIsCreateOrUpdate extends true
    ? keyof DoNotHaveDefaultValueFieldsOrIsNotAuto<M>
    : keyof DoesNotHaveNullFields<M> as F extends
    | TFieldsToConsider[number]
    | undefined
    ? TRelationsToIgnore extends readonly InstanceType<
        ReturnType<typeof model>
      >[]
      ? M['fields'][F] extends ForeignKeyField<
          any,
          any,
          any,
          any,
          any,
          any,
          undefined,
          any,
          any,
          any,
          any
        >
        ? M['fields'][F]['modelRelatedTo'] extends TRelationsToIgnore[number]
          ? never
          : F
        : F
      : F
    : never]: AddNull<M['fields'][F extends string ? F : never], TIsForSearch>;
};

export enum OperatorsOfQuery {
  is = 'is',
  or = 'or',
  and = 'and',
  in = 'in',
  greaterThan = 'greaterThan',
  greaterThanOrEqual = 'greaterThanOrEqual',
  lessThan = 'lessThan',
  lessThanOrEqual = 'lessThanOrEqual',
  between = 'between',
  like = 'like',
}

export type FieldWithOperationType<TFieldType> = {
  [OperatorsOfQuery.is]?:
    | {
        not: TFieldType;
      }
    | TFieldType;
  [OperatorsOfQuery.or]?: TFieldType[];
  [OperatorsOfQuery.and]?: TFieldType[];
  [OperatorsOfQuery.in]?:
    | {
        not: TFieldType[];
      }
    | TFieldType[];
  [OperatorsOfQuery.greaterThan]?: NonNullable<TFieldType>;
  [OperatorsOfQuery.greaterThanOrEqual]?: NonNullable<TFieldType>;
  [OperatorsOfQuery.lessThan]?: NonNullable<TFieldType>;
  [OperatorsOfQuery.lessThanOrEqual]?: NonNullable<TFieldType>;
  [OperatorsOfQuery.between]?:
    | {
        not: [NonNullable<TFieldType>, NonNullable<TFieldType>];
      }
    | [NonNullable<TFieldType>, NonNullable<TFieldType>];
  [OperatorsOfQuery.like]?:
    | {
        not: { ignoreCase: NonNullable<TFieldType> } | NonNullable<TFieldType>;
      }
    | { ignoreCase: NonNullable<TFieldType> }
    | NonNullable<TFieldType>;
};

type AddOperation<TFieldType, TIsSearch extends boolean = true> =
  | TFieldType
  | (TIsSearch extends true
      ? Pick<
          FieldWithOperationType<TFieldType>,
          | OperatorsOfQuery.is
          | OperatorsOfQuery.or
          | OperatorsOfQuery.and
          | OperatorsOfQuery.in
        > &
          (TFieldType extends number | Date
            ? Pick<
                FieldWithOperationType<TFieldType>,
                | OperatorsOfQuery.greaterThan
                | OperatorsOfQuery.greaterThanOrEqual
                | OperatorsOfQuery.lessThan
                | OperatorsOfQuery.lessThanOrEqual
                | OperatorsOfQuery.between
              >
            : TFieldType extends string
            ? Pick<FieldWithOperationType<TFieldType>, OperatorsOfQuery.like>
            : unknown)
      : never);

type AddNull<
  F extends Field<any, boolean>,
  TIsSearch extends boolean = true
> = AddOperation<
  F['allowNull'] extends true ? F['type'] | null : F['type'],
  TIsSearch
>;

type AbstractsAsFields<
  TAbstracts extends readonly Model[],
  TFieldsToConsider extends FieldsOFModelType<Model> = FieldsOFModelType<Model>,
  TRelationsToIgnore extends Model[] | undefined = undefined,
  TIsCreateOrUpdate extends boolean = false,
  TIsForSearch extends boolean = false
> = TAbstracts extends readonly [infer TAbstract, ...infer TRestAbstracts]
  ? TAbstract extends Model
    ? OptionalFields<
        TAbstract,
        FieldsOFModelType<TAbstract>,
        TRelationsToIgnore,
        TIsCreateOrUpdate,
        TIsForSearch
      > &
        RequiredFields<
          TAbstract,
          FieldsOFModelType<TAbstract>,
          TRelationsToIgnore,
          TIsCreateOrUpdate,
          TIsForSearch
        > &
        AbstractsAsFields<
          TAbstract['abstracts'],
          TFieldsToConsider,
          TRelationsToIgnore,
          TIsCreateOrUpdate,
          TIsForSearch
        > &
        (TRestAbstracts extends readonly Model[]
          ? AbstractsAsFields<
              TRestAbstracts,
              TFieldsToConsider,
              TRelationsToIgnore,
              TIsCreateOrUpdate,
              TIsForSearch
            >
          : unknown)
    : unknown
  : unknown;

type BaseModelFieldsInQueries<
  TModel extends Model,
  TFieldsToConsider extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TRelationsToIgnore extends Model[] | undefined = undefined,
  TIsCreateOrUpdate extends boolean = false,
  TIsForSearch extends boolean = false
> = OptionalFields<
  TModel,
  TFieldsToConsider,
  TRelationsToIgnore,
  TIsCreateOrUpdate,
  TIsForSearch
> &
  RequiredFields<
    TModel,
    TFieldsToConsider,
    TRelationsToIgnore,
    TIsCreateOrUpdate,
    TIsForSearch
  > &
  AbstractsAsFields<
    TModel['abstracts'],
    TFieldsToConsider,
    TRelationsToIgnore,
    TIsCreateOrUpdate,
    TIsForSearch
  >;

export type ModelFieldsInQueries<
  TModel extends Model,
  TFieldsToConsider extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TRelationsToIgnore extends Model[] | undefined = undefined,
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false
> = TIsAllRequired extends true
  ? Required<
      BaseModelFieldsInQueries<
        TModel,
        TFieldsToConsider,
        TRelationsToIgnore,
        TIsCreateOrUpdate,
        TIsForSearch
      >
    >
  : TIsAllOptional extends true
  ? Partial<
      BaseModelFieldsInQueries<
        TModel,
        TFieldsToConsider,
        TRelationsToIgnore,
        TIsCreateOrUpdate,
        TIsForSearch
      >
    >
  : BaseModelFieldsInQueries<
      TModel,
      TFieldsToConsider,
      TRelationsToIgnore,
      TIsCreateOrUpdate,
      TIsForSearch
    >;

// -------------- From this line below it is related to the relation fields ------------------

type RelatedFieldOfModelOptional<
  TModel extends Model,
  TRelatedModel extends Model,
  TIncludes extends Includes,
  TFieldsOfRelatedModel extends FieldsOFModelType<TRelatedModel> = FieldsOFModelType<TRelatedModel>,
  TRelationNamesOfModel extends readonly string[] = readonly string[],
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false
> = {
  [K in keyof TModel['fields'] as TModel['fields'][K] extends ForeignKeyField<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer TRelationName
  >
    ? TModel['fields'][K]['hasDefaultValue'] extends true
      ? TModel['fields'][K]['modelRelatedTo'] extends TRelatedModel
        ? TRelationName extends TRelationNamesOfModel[number]
          ? TRelationName
          : never
        : never
      : never
    : never]?: TModel['fields'][K] extends ForeignKeyField<
    any,
    any,
    any,
    any,
    any,
    any,
    undefined,
    any,
    any,
    any,
    any
  >
    ? TModel['fields'][K]['modelRelatedTo'] extends InstanceType<
        ReturnType<typeof model>
      >
      ? IncludesRelatedModels<
          ModelFieldsInQueries<
            TModel['fields'][K]['modelRelatedTo'],
            TFieldsOfRelatedModel,
            ExtractModelFromIncludesType<TIncludes, []>,
            TIsCreateOrUpdate,
            TIsAllRequired,
            TIsAllOptional,
            TIsForSearch
          >,
          TModel['fields'][K]['modelRelatedTo'],
          TIncludes,
          TFieldsOfRelatedModel,
          TIsCreateOrUpdate,
          TIsAllRequired,
          TIsAllOptional,
          TIsForSearch
        >
      : never
    : never;
};

type RelatedFieldOfModelRequired<
  TModel extends Model,
  TRelatedModel extends Model,
  TIncludes extends Includes,
  TFieldsOfRelatedModel extends FieldsOFModelType<TRelatedModel>,
  TRelationNamesOfModel extends readonly string[] = readonly string[],
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false
> = {
  [K in keyof TModel['fields'] as TModel['fields'][K] extends ForeignKeyField<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer TRelationName
  >
    ? TModel['fields'][K]['hasDefaultValue'] extends false
      ? TModel['fields'][K]['modelRelatedTo'] extends TRelatedModel
        ? TRelationName extends TRelationNamesOfModel[number]
          ? TRelationName
          : never
        : never
      : never
    : never]: TModel['fields'][K] extends ForeignKeyField<
    any,
    any,
    any,
    any,
    any,
    any,
    undefined,
    any,
    any,
    any,
    any
  >
    ? TModel['fields'][K]['modelRelatedTo'] extends InstanceType<
        ReturnType<typeof model>
      >
      ? IncludesRelatedModels<
          ModelFieldsInQueries<
            TModel['fields'][K]['modelRelatedTo'],
            TFieldsOfRelatedModel,
            ExtractModelFromIncludesType<TIncludes, []>,
            TIsCreateOrUpdate,
            TIsAllRequired,
            TIsAllOptional,
            TIsForSearch
          >,
          TModel['fields'][K]['modelRelatedTo'],
          TIncludes,
          TFieldsOfRelatedModel,
          TIsCreateOrUpdate,
          TIsAllRequired,
          TIsAllOptional,
          TIsForSearch
        >
      : never
    : never;
};

// Those are related to indirect relations. For example, the relation Post -> User: So Post will contain a userId field and it'll be related to User.
// ON this relation, the User model will contain a userPosts field which will be all of the posts related to the user.
type BaseRelatedFieldToModel<
  TModel extends Model,
  TRelatedModel extends Model,
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

// Those are related to indirect relations. For example, the relation Post -> User: So Post will contain a userId field and it'll be related to User.
// ON this relation, the User model will contain a userPosts field which will be all of the posts related to the user.
type RelatedFieldToModel<
  TModel extends Model,
  TRelatedModel extends Model,
  TIncludes extends Includes,
  TFieldsOfModel extends FieldsOFModelType<TModel>,
  TRelationNamesOfModel extends readonly string[],
  TIsCreateOrUpdate extends boolean,
  TIsAllRequired extends boolean,
  TIsAllOptional extends boolean,
  TIsForSearch extends boolean
> = {
  [K in keyof TRelatedModel['fields'] as TRelatedModel['fields'][K] extends ForeignKeyField<
    any,
    any,
    any,
    any,
    any,
    any,
    undefined,
    any, // Related model in foreign key field
    any,
    any,
    infer TRelatedName,
    any
  >
    ? TRelatedModel['fields'][K]['modelRelatedTo'] extends TModel
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
    : TRelatedModel['fields'][K]['unique'] extends true
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
      >[];
};

type BaseFieldsWithRelationsFromIncludesType<
  Type,
  TModel extends Model,
  TIncludedModel extends ReturnType<typeof model>,
  TToInclude extends Includes,
  TFieldsOfModel extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TRelationNamesOfModel extends readonly string[] = readonly string[],
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false
> = Type &
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
  Type,
  TModel extends Model,
  TIncludedModel extends ReturnType<typeof model>,
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
        Type,
        TModel,
        TIncludedModel,
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
        Type,
        TModel,
        TIncludedModel,
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
      Type,
      TModel,
      TIncludedModel,
      TToInclude,
      TFieldsOfModel,
      TRelationNamesOfModel,
      TIsCreateOrUpdate,
      TIsAllRequired,
      TIsAllOptional,
      TIsForSearch
    >;

export type IncludesRelatedModels<
  Type,
  TModel extends Model,
  TIncludes extends Includes,
  TFieldsOfModel extends FieldsOFModelType<Model>,
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
  ? TFirstIncludes extends ReturnType<typeof model>
    ? TRestIncludes extends Includes
      ? TFirstModelIncludes extends Includes
        ? Type &
            FieldsWithRelationsFromIncludesType<
              Type,
              TModel,
              TFirstIncludes,
              TFirstModelIncludes,
              TFirstFieldsOfModel extends FieldsOFModelType<
                InstanceType<TFirstIncludes>
              >
                ? TFirstFieldsOfModel
                : FieldsOFModelType<InstanceType<TFirstIncludes>>,
              TFirstRelationNames extends readonly string[]
                ? TFirstRelationNames
                : readonly string[],
              TIsCreateOrUpdate,
              TIsAllRequired,
              TIsAllOptional,
              TIsForSearch
            > &
            IncludesRelatedModels<
              Type,
              TModel,
              TRestIncludes,
              TFieldsOfModel,
              TIsCreateOrUpdate,
              TIsAllRequired,
              TIsAllOptional,
              TIsForSearch
            >
        : Type &
            FieldsWithRelationsFromIncludesType<
              Type,
              TModel,
              TFirstIncludes,
              [],
              TFirstFieldsOfModel extends FieldsOFModelType<
                InstanceType<TFirstIncludes>
              >
                ? TFirstFieldsOfModel
                : FieldsOFModelType<InstanceType<TFirstIncludes>>,
              TFirstRelationNames extends readonly string[]
                ? TFirstRelationNames
                : readonly string[],
              TIsCreateOrUpdate,
              TIsAllRequired,
              TIsAllOptional,
              TIsForSearch
            > &
            IncludesRelatedModels<
              Type,
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
  : Type;

export type ModelFieldsWithIncludes<
  TModel extends Model,
  TIncludes extends Includes,
  TFieldsOfModel extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false
> = IncludesRelatedModels<
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
>;
