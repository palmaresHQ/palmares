import { ModelFieldsType, TModel } from '.';
import { Field, ForeignKeyField } from '../fields';
import model, { Model } from '../model';
import { Includes } from './queries';

type HasDefaultValueFieldsOrIsAuto<M extends ModelFieldsType> = {
  [F in keyof M as M[F]['hasDefaultValue'] extends true
    ? F
    : M[F]['isAuto'] extends true
    ? F
    : never]: M[F];
};

type OptionalFields<
  M extends Model,
  TIgnoreRelations extends boolean = false
> = {
  [F in keyof HasDefaultValueFieldsOrIsAuto<
    M['fields']
  > as TIgnoreRelations extends true
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
      ? never
      : F
    : F]?: AddNull<M['fields'][F extends string ? F : never]>;
};

type DoNotHaveDefaultValueFieldsOrIsNotAuto<M extends ModelFieldsType> = {
  [F in keyof M as M[F]['hasDefaultValue'] extends false
    ? M[F]['isAuto'] extends false
      ? F
      : never
    : never]: M[F];
};

type RequiredFields<
  M extends Model,
  TIgnoreRelations extends boolean = false
> = {
  [F in keyof DoNotHaveDefaultValueFieldsOrIsNotAuto<
    M['fields']
  > as TIgnoreRelations extends true
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
      ? never
      : F
    : F]: AddNull<M['fields'][F extends string ? F : never]>;
};

type AddNull<F extends Field<any, boolean>> = F['allowNull'] extends true
  ? F['type'] | null
  : F['type'];

type AbstractsAsFields<
  TAbstracts extends readonly Model[],
  TIgnoreRelations extends boolean = false
> = TAbstracts extends readonly [infer TAbstract, ...infer TRestAbstracts]
  ? TAbstract extends Model
    ? OptionalFields<TAbstract, TIgnoreRelations> &
        RequiredFields<TAbstract, TIgnoreRelations> &
        AbstractsAsFields<TAbstract['abstracts'], TIgnoreRelations> &
        (TRestAbstracts extends readonly Model[]
          ? AbstractsAsFields<TRestAbstracts, TIgnoreRelations>
          : unknown)
    : unknown
  : unknown;

export type CreateOrUpdateModelFields<
  M extends Model,
  TIgnoreRelations extends boolean = false
> = OptionalFields<M, TIgnoreRelations> &
  RequiredFields<M, TIgnoreRelations> &
  AbstractsAsFields<M['abstracts']>;

type RelatedFieldOfModelOnCreateOrUpdateOptional<
  M extends Model,
  I extends Includes
> = {
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
          CreateOrUpdateModelFields<
            RMIFF,
            I extends any[] ? (I['length'] extends 0 ? false : true) : false
          >,
          RMIFF,
          I
        >
      : never
    : never;
};

type ExtractModelFromIncludesType<
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

type RelatedFieldOfModelOnCreateOrUpdateRequired<
  M extends Model,
  RM extends Model,
  I extends Includes
> = {
  [K in keyof M['fields'] as M['fields'][K] extends ForeignKeyField<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer RMIFF,
    any,
    any,
    infer RNN
  >
    ? M['fields'][K]['hasDefaultValue'] extends false
      ? RMIFF extends RM
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

type RelatedFieldToModelOnCreateOrUpdate<
  M extends Model,
  RM extends Model,
  I extends Includes
> = {
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
    : never]: IncludesRelatedModelsForCreateOrUpdate<
    CreateOrUpdateModelFields<
      RM,
      I extends readonly any[] ? (I['length'] extends 0 ? false : true) : false
    >,
    RM,
    I
  >;
};

export type RelatedFieldsTypeWithoutModelRelation<
  T,
  M extends Model,
  I extends ReturnType<typeof model>,
  ToInclude extends Includes
> = I extends ReturnType<typeof model>
  ? T &
      RelatedFieldOfModelOnCreateOrUpdateOptional<M, ToInclude> &
      RelatedFieldOfModelOnCreateOrUpdateRequired<
        M,
        InstanceType<I>,
        ToInclude
      > &
      RelatedFieldToModelOnCreateOrUpdate<M, InstanceType<I>, ToInclude>
  : T;

export type IncludesRelatedModelsForCreateOrUpdate<
  T,
  M extends Model,
  I extends Includes
> = I extends
  | readonly [{ model: infer FI; includes: infer FMI }, ...infer RI]
  | readonly [{ model: infer FI }, ...infer RI]
  | readonly [{ model: infer FI }]
  ? FI extends ReturnType<typeof model>
    ? RI extends Includes
      ? FMI extends Includes
        ? T &
            RelatedFieldsTypeWithoutModelRelation<T, M, FI, FMI> &
            IncludesRelatedModelsForCreateOrUpdate<T, M, RI>
        : T &
            RelatedFieldsTypeWithoutModelRelation<T, M, FI, []> &
            IncludesRelatedModelsForCreateOrUpdate<T, M, RI>
      : never
    : never
  : T;
/*? RI extends Includes
    ? FI extends ReturnType<typeof model>
      ? T &
          RelatedFieldsTypeWithoutModelRelation<T, M, FI, RI> &
          IncludesRelatedModelsForCreateOrUpdate<T, M, RI>
      : FI extends Includes
      ? T &
          IncludesRelatedModelsForCreateOrUpdate<T, M, FI> &
          IncludesRelatedModelsForCreateOrUpdate<T, M, RI>
      : T & IncludesRelatedModelsForCreateOrUpdate<T, M, RI>
    : T & IncludesRelatedModelsForCreateOrUpdate<T, M, []>
  : T;*/
