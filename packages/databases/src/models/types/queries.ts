import model from '../model';
import type { ForeignKeyField, Field } from '../fields';

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
export type AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<TModel1, TModel2> =
  keyof AllFieldsOfModel<TModel1> extends keyof AllFieldsOfModel<TModel2>
    ? AllOptionsOfModel<TModel1> extends AllOptionsOfModel<TModel2>
      ? true
      : false
    : false;

export type ExtractRelationsNames<TParentModel, TChildModel> = readonly ValueOf<
  {
    [TFieldName in keyof AllFieldsOfModel<TParentModel> as AllFieldsOfModel<TParentModel>[TFieldName] extends ForeignKeyField<
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
      any,
      any
    >
      ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
          InstanceType<AllFieldsOfModel<TParentModel>[TFieldName]['modelRelatedTo']>,
          TChildModel
        > extends true
        ? TFieldName
        : never
      : never]: AllFieldsOfModel<TParentModel>[TFieldName] extends ForeignKeyField<
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
      any,
      infer TRelationName
    >
      ? TRelationName
      : unknown;
  } & {
    [TFieldName in keyof AllFieldsOfModel<TChildModel> as AllFieldsOfModel<TChildModel>[TFieldName] extends ForeignKeyField<
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
      any,
      any
    >
      ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
          InstanceType<AllFieldsOfModel<TChildModel>[TFieldName]['modelRelatedTo']>,
          TParentModel
        > extends true
        ? TFieldName
        : never
      : never]: AllFieldsOfModel<TChildModel>[TFieldName] extends ForeignKeyField<
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

export type Includes<TCustomData extends object = object> = readonly Include<TCustomData>[] | undefined;

type ValueOf<T> = T[keyof T];

export type IncludesValidated<
  TParentModel,
  TIncludes extends Includes,
  TIsCreateOrUpdateData extends boolean = false,
  TCustomData extends object = object,
> = TIncludes extends readonly [
  {
    readonly model: infer TInferedModel;
    includes?: infer TInferedIncludesOfModel;
  },
  ...infer TInferedRestIncludes,
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
            : readonly []),
        ]
    : readonly []
  : TIncludes;

export type ValidateModelsOfIncludes<TParentModel, TChildModel extends abstract new (...args: any) => any> = ValueOf<
  {
    [TFieldName in keyof AllFieldsOfModel<InstanceType<TChildModel>> as AllFieldsOfModel<
      InstanceType<TChildModel>
    >[TFieldName] extends ForeignKeyField<any, any, any, any, any, any, any, any, any, any, any, any, any>
      ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
          InstanceType<AllFieldsOfModel<InstanceType<TChildModel>>[TFieldName]['modelRelatedTo']>,
          TParentModel
        > extends true
        ? TFieldName
        : never
      : never]: TChildModel;
  } & {
    [TFieldName in keyof AllFieldsOfModel<TParentModel> as AllFieldsOfModel<TParentModel>[TFieldName] extends ForeignKeyField<
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
      any,
      any
    >
      ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
          InstanceType<AllFieldsOfModel<TParentModel>[TFieldName]['modelRelatedTo']>,
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
  TOnlyModels extends readonly any[],
> = TIncludes extends readonly [{ model: infer TModel }, ...infer TRest]
  ? TModel extends abstract new (...args: any) => any
    ? ExtractModelFromIncludesType<
        TRest extends Includes ? TRest : undefined,
        readonly [...TOnlyModels, InstanceType<TModel>]
      >
    : TOnlyModels
  : TOnlyModels;

type HasDefaultValueFieldsOrIsAuto<TModel> = {
  [TFieldName in keyof AllFieldsOfModel<TModel> as AllFieldsOfModel<TModel>[TFieldName] extends Field<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >
    ? AllFieldsOfModel<TModel>[TFieldName]['hasDefaultValue'] extends true
      ? TFieldName
      : AllFieldsOfModel<TModel>[TFieldName]['isAuto'] extends true
      ? TFieldName
      : never
    : never]: AllFieldsOfModel<TModel>[TFieldName];
};

type DoNotHaveDefaultValueFieldsOrIsNotAuto<TModel> = {
  [TFieldName in keyof AllFieldsOfModel<TModel> as AllFieldsOfModel<TModel>[TFieldName] extends Field<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >
    ? AllFieldsOfModel<TModel>[TFieldName]['hasDefaultValue'] extends false
      ? AllFieldsOfModel<TModel>[TFieldName]['isAuto'] extends false
        ? TFieldName
        : never
      : never
    : never]: AllFieldsOfModel<TModel>[TFieldName];
};

type HasNullFields<TModel> = {
  [TFieldName in keyof AllFieldsOfModel<TModel> as AllFieldsOfModel<TModel>[TFieldName] extends Field<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >
    ? AllFieldsOfModel<TModel>[TFieldName]['allowNull'] extends true
      ? TFieldName
      : never
    : never]: AllFieldsOfModel<TModel>[TFieldName];
};

type DoesNotHaveNullFields<TModel> = {
  [TFieldName in keyof AllFieldsOfModel<TModel> as AllFieldsOfModel<TModel>[TFieldName] extends Field<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >
    ? AllFieldsOfModel<TModel>[TFieldName]['allowNull'] extends true
      ? never
      : TFieldName
    : never]: AllFieldsOfModel<TModel>[TFieldName];
};

type OptionalFields<
  TModel,
  TFieldsToConsider extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TRelationsToIgnore extends any[] | undefined = undefined,
  TIsCreateOrUpdate extends boolean = false,
  TIsForSearch extends boolean = false,
> = {
  [TFieldName in TIsCreateOrUpdate extends true
    ? keyof HasDefaultValueFieldsOrIsAuto<TModel>
    : keyof HasNullFields<TModel> as TFieldName extends TFieldsToConsider[number] | undefined
    ? TRelationsToIgnore extends readonly any[]
      ? AllFieldsOfModel<TModel>[TFieldName] extends ForeignKeyField<
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
          any,
          any
        >
        ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
            InstanceType<AllFieldsOfModel<TModel>[TFieldName]['modelRelatedTo']>,
            TRelationsToIgnore[number]
          > extends true
          ? never
          : TFieldName
        : TFieldName
      : TFieldName
    : never]?: AllFieldsOfModel<TModel>[TFieldName] extends Field<any, any, any, any, any, any, any, any>
    ? AddNull<AllFieldsOfModel<TModel>[TFieldName], TIsForSearch, TIsCreateOrUpdate>
    : never;
};

type RequiredFields<
  TModel,
  TFieldsToConsider extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TRelationsToIgnore extends readonly any[] | undefined = undefined,
  TIsCreateOrUpdate extends boolean = false,
  TIsForSearch extends boolean = false,
> = {
  [TFieldName in TIsCreateOrUpdate extends true
    ? keyof DoNotHaveDefaultValueFieldsOrIsNotAuto<TModel>
    : keyof DoesNotHaveNullFields<TModel> as TFieldName extends TFieldsToConsider[number] | undefined
    ? TRelationsToIgnore extends readonly any[]
      ? AllFieldsOfModel<TModel>[TFieldName] extends ForeignKeyField<
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
          any,
          any
        >
        ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
            InstanceType<AllFieldsOfModel<TModel>[TFieldName]['modelRelatedTo']>,
            TRelationsToIgnore[number]
          > extends true
          ? never
          : TFieldName
        : TFieldName
      : TFieldName
    : never]: AllFieldsOfModel<TModel>[TFieldName] extends Field<any, any, any, any, any, any, any, any>
    ? AddNull<AllFieldsOfModel<TModel>[TFieldName], TIsForSearch, TIsCreateOrUpdate>
    : never;
};

export type OperatorsOfQuery =
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

type AddOperation<TFieldType, TIsSearch extends boolean = true> =
  | TFieldType
  | (TIsSearch extends true
      ? Pick<FieldWithOperationType<TFieldType>, 'is' | 'or' | 'and' | 'in'> &
          (TFieldType extends number | Date
            ? Pick<
                FieldWithOperationType<TFieldType>,
                'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual' | 'between'
              >
            : TFieldType extends string
            ? Pick<FieldWithOperationType<TFieldType>, 'like'>
            : unknown)
      : never);

type AddNull<
  TField extends Field<any, any, any, any, any, any, any, any>,
  TIsSearch extends boolean = true,
  TIsCreateOrUpdate extends boolean = false,
> = AddOperation<
  TField['allowNull'] extends true
    ? GetFieldType<TField, TIsCreateOrUpdate> | null
    : GetFieldType<TField, TIsCreateOrUpdate>,
  TIsSearch
>;

/**
 * Retrieves the field type depending if it is for create or update or for search.
 */
type GetFieldType<
  TField extends Field<any, any, any, any, any, any, any, any>,
  TIsCreateOrUpdate extends boolean = false,
  TIsSearch extends boolean = false,
> = TIsCreateOrUpdate extends true
  ? TField['_type']['input']
  : TIsSearch extends true
  ? TField['_type']['input']
  : TField['_type']['output'];

/** This will extract all of the abstract fields from an abstracts array. In other words, this takes the  */
type AbstractsAsFields<
  TAbstracts, // Should be an array of model classes (NOT INSTANCES)
  TFieldsToConsider extends FieldsOFModelType<TAbstracts extends any[] ? TAbstracts[number] : any> = FieldsOFModelType<
    TAbstracts extends any[] ? TAbstracts[number] : any
  >,
  TRelationsToIgnore extends any[] | undefined = undefined,
  TIsCreateOrUpdate extends boolean = false,
  TIsForSearch extends boolean = false,
> = TAbstracts extends readonly [infer TAbstract, ...infer TRestAbstracts]
  ? TAbstract extends abstract new (...args: any) => any
    ? OptionalFields<
        InstanceType<TAbstract>,
        FieldsOFModelType<TAbstract>,
        TRelationsToIgnore,
        TIsCreateOrUpdate,
        TIsForSearch
      > &
        RequiredFields<
          InstanceType<TAbstract>,
          FieldsOFModelType<TAbstract>,
          TRelationsToIgnore,
          TIsCreateOrUpdate,
          TIsForSearch
        >
    : unknown
  : unknown;

type BaseModelFieldsInQueries<
  TModel,
  TFieldsToConsider extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TRelationsToIgnore extends any[] | undefined = undefined,
  TIsCreateOrUpdate extends boolean = false,
  TIsForSearch extends boolean = false,
> = OptionalFields<TModel, TFieldsToConsider, TRelationsToIgnore, TIsCreateOrUpdate, TIsForSearch> &
  RequiredFields<TModel, TFieldsToConsider, TRelationsToIgnore, TIsCreateOrUpdate, TIsForSearch>

export type ModelFieldsInQueries<
  TModel,
  TFieldsToConsider extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TRelationsToIgnore extends any[] | undefined = undefined,
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false,
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
  TIsForSearch extends boolean = false,
> = {
  [TFieldName in keyof AllFieldsOfModel<TModel> as AllFieldsOfModel<TModel>[TFieldName] extends ForeignKeyField<
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
    any,
    infer TRelationName
  >
    ? AllFieldsOfModel<TModel>[TFieldName]['hasDefaultValue'] extends true
      ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
          InstanceType<AllFieldsOfModel<TModel>[TFieldName]['modelRelatedTo']>,
          TRelatedModel
        > extends true
        ? TRelationName extends TRelationNamesOfModel[number]
          ? TRelationName
          : never
        : never
      : never
    : never]?: AllFieldsOfModel<TModel>[TFieldName] extends ForeignKeyField<
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
    any,
    any
  >
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
  TIsForSearch extends boolean = false,
> = {
  [TFieldName in keyof AllFieldsOfModel<TModel> as AllFieldsOfModel<TModel>[TFieldName] extends ForeignKeyField<
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
    any,
    infer TRelationName
  >
    ? AllFieldsOfModel<TModel>[TFieldName]['hasDefaultValue'] extends false
      ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
          InstanceType<AllFieldsOfModel<TModel>[TFieldName]['modelRelatedTo']>,
          TRelatedModel
        > extends true
        ? TRelationName extends TRelationNamesOfModel[number]
          ? TRelationName
          : never
        : never
      : never
    : never]: AllFieldsOfModel<TModel>[TFieldName] extends ForeignKeyField<
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
    any,
    any
  >
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

// Those are related to indirect relations. For example, the relation Post -> User: So Post will contain a userId field and it'll be related to User.
// ON this relation, the User model will contain a userPosts field which will be all of the posts related to the user.
type BaseRelatedFieldToModel<
  TModel,
  TRelatedModel,
  TIncludes extends Includes,
  TFieldsOfRelatedModel extends FieldsOFModelType<TRelatedModel>,
  TIsCreateOrUpdate extends boolean,
  TIsAllRequired extends boolean,
  TIsAllOptional extends boolean,
  TIsForSearch extends boolean,
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
export type RelatedFieldToModel<
  TModel,
  TRelatedModel,
  TIncludes extends Includes,
  TFieldsOfModel extends FieldsOFModelType<TRelatedModel>,
  TRelationNamesOfModel extends readonly string[],
  TIsCreateOrUpdate extends boolean,
  TIsAllRequired extends boolean,
  TIsAllOptional extends boolean,
  TIsForSearch extends boolean,
> = {
  [TFieldName in keyof AllFieldsOfModel<TRelatedModel> as AllFieldsOfModel<TRelatedModel>[TFieldName] extends ForeignKeyField<
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
    infer TRelatedName,
    any
  >
    ? AreTwoModelsThatWeDoNotKnowThatAreModelsEqual<
        InstanceType<AllFieldsOfModel<TRelatedModel>[TFieldName]['modelRelatedTo']>,
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
    : AllFieldsOfModel<TRelatedModel>[TFieldName] extends Field<any, any, any, any, any, any, any, any>
    ? AllFieldsOfModel<TRelatedModel>[TFieldName]['unique'] extends true
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
  Type,
  TModel, // The model that is being queried
  TIncludedModel extends abstract new (...args: any) => any, // This is a single included model on the query. It is the model class, not it's instance.
  TToInclude extends Includes,
  TFieldsOfModel extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TRelationNamesOfModel extends readonly string[] = readonly string[],
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false,
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
  TModel,
  TIncludedModel,
  TToInclude extends Includes,
  TFieldsOfModel extends FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TRelationNamesOfModel extends readonly string[] = readonly string[],
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false,
> = TIsAllRequired extends true
  ? Required<
      BaseFieldsWithRelationsFromIncludesType<
        Type,
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
        Type,
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
      Type,
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

export type IncludesRelatedModels<
  Type,
  TModel,
  TIncludes extends Includes,
  TFieldsOfModel extends FieldsOFModelType<TModel>,
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false,
> = TIncludes extends
  | readonly [
      {
        model: infer TFirstIncludes;
        fields: infer TFirstFieldsOfModel;
        includes: infer TFirstModelIncludes;
        relationNames: infer TFirstRelationNames;
      },
      ...infer TRestIncludes,
    ]
  | readonly [
      {
        model: infer TFirstIncludes;
        includes: infer TFirstModelIncludes;
        relationNames: infer TFirstRelationNames;
      },
      ...infer TRestIncludes,
    ]
  | readonly [{ model: infer TFirstIncludes }, ...infer TRestIncludes]
  | readonly [{ model: infer TFirstIncludes }]
  ? TFirstIncludes extends abstract new (...args: any) => any
    ? TRestIncludes extends Includes
      ? TFirstModelIncludes extends Includes
        ? Type &
            FieldsWithRelationsFromIncludesType<
              Type,
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
              FieldsOFModelType<InstanceType<TFirstIncludes>>,
              TFirstRelationNames extends readonly string[] ? TFirstRelationNames : readonly string[],
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

// This is the type that will be used in the queries. We add the includes to the model fields and with that we can infer the type of the query. It's result as well as the
// data that needs to be passed to the query on the creation or update and etc.
export type ModelFieldsWithIncludes<
  TModel,
  TIncludes extends Includes,
  TFieldsOfModel extends FieldsOFModelType<TModel> | FieldsOFModelType<TModel> = FieldsOFModelType<TModel>,
  TIsCreateOrUpdate extends boolean = false,
  TIsAllRequired extends boolean = false,
  TIsAllOptional extends boolean = false,
  TIsForSearch extends boolean = false,
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
