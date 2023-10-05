import { ModelFieldsType } from '.';
import { Field, ForeignKeyField } from '../fields';
import model, { Model } from '../model';
import { Includes, ExtractModelFromIncludesType } from './queries';

type HasDefaultValueFieldsOrIsAuto<M extends ModelFieldsType> = {
  [F in keyof M as M[F]['hasDefaultValue'] extends true ? F : M[F]['isAuto'] extends true ? F : never]: M[F];
};

type OptionalFields<M extends Model, TRelationsToIgnore extends Model[] | undefined = undefined> = {
  [F in keyof HasDefaultValueFieldsOrIsAuto<M['fields']> as TRelationsToIgnore extends readonly InstanceType<
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
        infer TRelatedModelInForeignKeyField,
        any,
        any,
        any
      >
      ? TRelatedModelInForeignKeyField extends TRelationsToIgnore[number]
        ? never
        : F
      : F
    : F]?: AddNull<M['fields'][F extends string ? F : never]>;
};

type DoNotHaveDefaultValueFieldsOrIsNotAuto<M extends ModelFieldsType> = {
  [F in keyof M as M[F]['hasDefaultValue'] extends false ? (M[F]['isAuto'] extends false ? F : never) : never]: M[F];
};

type RequiredFields<M extends Model, TRelationsToIgnore extends Model[] | undefined = undefined> = {
  [F in keyof DoNotHaveDefaultValueFieldsOrIsNotAuto<M['fields']> as TRelationsToIgnore extends readonly InstanceType<
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
        infer TRelatedModelInForeignKeyField,
        any,
        any,
        any
      >
      ? TRelatedModelInForeignKeyField extends TRelationsToIgnore[number]
        ? never
        : F
      : F
    : F]: AddNull<M['fields'][F extends string ? F : never]>;
};

type AddNull<F extends Field<any, boolean>> = F['allowNull'] extends true ? F['_type'] | null : F['_type'];

type AbstractsAsFields<
  TAbstracts extends readonly Model[],
  TRelationsToIgnore extends Model[] | undefined = undefined
> = TAbstracts extends readonly [infer TAbstract, ...infer TRestAbstracts]
  ? TAbstract extends Model
    ? OptionalFields<TAbstract, TRelationsToIgnore> &
        RequiredFields<TAbstract, TRelationsToIgnore> &
        AbstractsAsFields<TAbstract['abstracts'], TRelationsToIgnore> &
        (TRestAbstracts extends readonly Model[] ? AbstractsAsFields<TRestAbstracts, TRelationsToIgnore> : unknown)
    : unknown
  : unknown;

export type CreateOrUpdateModelFields<
  M extends Model,
  TRelationsToIgnore extends Model[] | undefined = undefined
> = OptionalFields<M, TRelationsToIgnore> &
  RequiredFields<M, TRelationsToIgnore> &
  AbstractsAsFields<M['abstracts'], TRelationsToIgnore>;

type RelatedFieldOfModelOnCreateOrUpdateOptional<M extends Model, I extends Includes> = {
  [K in keyof M['fields'] as M['fields'][K] extends ForeignKeyField<
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
    infer RNN
  >
    ? M['fields'][K]['hasDefaultValue'] extends true
      ? RNN
      : never
    : never]?: M['fields'][K] extends ForeignKeyField<
    any,
    any,
    any,
    any,
    any,
    any,
    undefined,
    infer RMIFF,
    any,
    any,
    any
  >
    ? RMIFF extends InstanceType<ReturnType<typeof model>>
      ? IncludesRelatedModelsForCreateOrUpdate<
          CreateOrUpdateModelFields<RMIFF, ExtractModelFromIncludesType<I, []>>,
          RMIFF,
          I
        >
      : never
    : never;
};

type RelatedFieldOfModelOnCreateOrUpdateRequired<M extends Model, TRelatedModel extends Model, I extends Includes> = {
  [K in keyof M['fields'] as M['fields'][K] extends ForeignKeyField<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer TRelatedModelInForeignKeyField,
    any,
    any,
    infer RNN
  >
    ? M['fields'][K]['hasDefaultValue'] extends false
      ? TRelatedModelInForeignKeyField extends TRelatedModel
        ? RNN
        : never
      : never
    : never]: M['fields'][K] extends ForeignKeyField<
    any,
    any,
    any,
    any,
    any,
    any,
    undefined,
    infer TRelatedModelInForeignKeyField,
    any,
    any,
    any
  >
    ? TRelatedModelInForeignKeyField extends InstanceType<ReturnType<typeof model>>
      ? IncludesRelatedModelsForCreateOrUpdate<
          CreateOrUpdateModelFields<TRelatedModelInForeignKeyField, ExtractModelFromIncludesType<I, []>>,
          TRelatedModelInForeignKeyField,
          I
        >
      : never
    : never;
};

type RelatedFieldToModelOnCreateOrUpdate<M extends Model, RM extends Model, I extends Includes> = {
  [K in keyof RM['fields'] as RM['fields'][K] extends ForeignKeyField<
    any,
    any,
    any,
    any,
    any,
    any,
    undefined,
    infer RMIFKF, // Related model in foreign key field
    any,
    infer RN,
    any
  >
    ? RMIFKF extends M
      ? RN
      : never
    : never]: RM['fields'][K]['unique'] extends true
    ? IncludesRelatedModelsForCreateOrUpdate<
        CreateOrUpdateModelFields<RM, ExtractModelFromIncludesType<I, [M]>>, // This will ignore the current model on the next
        RM,
        I
      >
    : IncludesRelatedModelsForCreateOrUpdate<
        CreateOrUpdateModelFields<RM, ExtractModelFromIncludesType<I, [M]>>, // This will ignore the current model on the next
        RM,
        I
      >[];
};

export type RelatedFieldsTypeWithoutModelRelation<
  T,
  M extends Model,
  I extends ReturnType<typeof model>,
  ToInclude extends Includes
> = I extends ReturnType<typeof model>
  ? T &
      RelatedFieldOfModelOnCreateOrUpdateOptional<M, ToInclude> &
      RelatedFieldOfModelOnCreateOrUpdateRequired<M, InstanceType<I>, ToInclude> &
      RelatedFieldToModelOnCreateOrUpdate<M, InstanceType<I>, ToInclude>
  : T;

export type IncludesRelatedModelsForCreateOrUpdate<T, M extends Model, I extends Includes> = I extends
  | readonly [{ model: infer FI; includes: infer FMI }, ...infer RI]
  | readonly [{ model: infer FI }, ...infer RI]
  | readonly [{ model: infer FI }]
  ? FI extends ReturnType<typeof model>
    ? RI extends Includes
      ? FMI extends Includes
        ? T & RelatedFieldsTypeWithoutModelRelation<T, M, FI, FMI> & IncludesRelatedModelsForCreateOrUpdate<T, M, RI>
        : T & RelatedFieldsTypeWithoutModelRelation<T, M, FI, []> & IncludesRelatedModelsForCreateOrUpdate<T, M, RI>
      : never
    : never
  : T;
