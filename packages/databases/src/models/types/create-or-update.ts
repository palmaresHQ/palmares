import { ModelFieldsType } from '.';
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

type OptionalFields<M extends Model> = {
  [F in keyof HasDefaultValueFieldsOrIsAuto<M['fields']>]?: AddNull<
    M['fields'][F extends string ? F : never]
  >;
};

type DoNotHaveDefaultValueFieldsOrIsNotAuto<M extends ModelFieldsType> = {
  [F in keyof M as M[F]['hasDefaultValue'] extends false
    ? M[F]['isAuto'] extends false
      ? F
      : never
    : never]: M[F];
};

type RequiredFields<M extends Model> = {
  [F in keyof DoNotHaveDefaultValueFieldsOrIsNotAuto<M['fields']>]: AddNull<
    M['fields'][F extends string ? F : never]
  >;
};

type AddNull<F extends Field<any, boolean>> = F['allowNull'] extends true
  ? F['type'] | null
  : F['type'];

type AbstractsAsFields2<U> = (
  U extends Model ? (k: U) => void : never
) extends (k: infer I) => void
  ? I extends Model
    ? OptionalFields<I> & RequiredFields<I>
    : never
  : never;
type AbstractsAsFields1<U> = (
  U extends Model ? (k: U) => void : never
) extends (k: infer I) => void
  ? I extends Model
    ? OptionalFields<I> &
        RequiredFields<I> &
        AbstractsAsFields2<I['abstracts'][number]>
    : never
  : never;
type AbstractsAsFields<U> = (U extends Model ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I extends Model
    ? OptionalFields<I> &
        RequiredFields<I> &
        AbstractsAsFields1<I['abstracts'][number]>
    : never
  : never;

export type CreateOrUpdateModelFields<M extends Model> = OptionalFields<M> &
  RequiredFields<M> &
  AbstractsAsFields<M['abstracts'][number]>;

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
          CreateOrUpdateModelFields<RMIFF>,
          RMIFF,
          I
        >
      : never
    : never;
};

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
      ? RNN
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
    infer RNN
  >
    ? RMIFF extends InstanceType<ReturnType<typeof model>>
      ? I extends readonly [{ model: infer FI }, ...infer RI]
        ? RM extends RMIFF
          ? RI extends Includes
            ? IncludesRelatedModelsForCreateOrUpdate<
                CreateOrUpdateModelFields<RMIFF>,
                RMIFF,
                I
              >
            : string
          : boolean
        : CreateOrUpdateModelFields<RMIFF>
      : unknown
    : undefined;
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
    : never]: I extends readonly [
    (
      | { model: ReturnType<typeof model> }
      | { model: ReturnType<typeof model>; includes: infer FMI }
    ),
    ...infer RI
  ]
    ? FMI extends Includes
      ? IncludesRelatedModelsForCreateOrUpdate<
          CreateOrUpdateModelFields<RM>,
          RM,
          I
        >
      : never
    : CreateOrUpdateModelFields<RM>;
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
