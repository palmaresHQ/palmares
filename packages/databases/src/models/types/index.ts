import { Field, ForeignKeyField } from '../fields';
import model, { Model } from '../model';
import Manager from '../manager';
import { DatabaseSettingsType } from '../../types';
import Engine from '../../engine';

export type ManagerInstancesType = {
  [engineName: string]: any;
};

export type ManagerEngineInstancesType = {
  [engineName: string]: Engine;
};

export type ModelFieldsType = {
  [key: string | symbol]: Field<any, any, any, any, any, any>;
};

export type ManagersOfInstanceType = {
  [key: string]: Manager;
};

export type ModelIndexType = {
  unique: true;
  fields: string[];
};

type OrderingOfModelOptions<M extends Model = Model> =
  | keyof M['type']
  | keyof { [F in keyof M['type'] as F extends string ? `-${F}` : never]: 1 }
  | string;

export type ModelOptionsType<M extends Model = Model> = {
  indexes?: ModelIndexType[];
  ordering?: OrderingOfModelOptions<M>[];
  abstract?: boolean;
  underscored?: boolean;
  tableName?: string;
  managed?: boolean;
  databases?: string[];
  customOptions?: any;
};

export interface ModelType {
  fields: ModelFieldsType;
  options: ModelOptionsType;
  name: string;
  abstracts: typeof Model[];
  instances?: Map<keyof DatabaseSettingsType['DATABASES'], any>;
}

export type TModel = InstanceType<ReturnType<typeof model>>;

type HasDefaultValueFields<M extends ModelFieldsType> = {
  [F in keyof M as M[F]['hasDefaultValue'] extends false ? never : F]: M[F];
};

type OptionalFields<M extends Model> = {
  [F in keyof HasDefaultValueFields<M['fields']>]?: AddNull<
    M['fields'][F extends string ? F : never]
  >;
};

type AllOptionalFields<M extends Model> = {
  [F in keyof M['fields']]?: AddNull<M['fields'][F extends string ? F : never]>;
};

type DoNotHaveDefaultValueFields<M extends ModelFieldsType> = {
  [F in keyof M as M[F]['hasDefaultValue'] extends false ? F : never]: M[F];
};

type RequiredFields<M extends Model> = {
  [F in keyof DoNotHaveDefaultValueFields<M['fields']>]: AddNull<
    M['fields'][F extends string ? F : never]
  >;
};

type AllRequiredFields<M extends Model> = {
  [F in keyof M['fields']]: AddNull<M['fields'][F extends string ? F : never]>;
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

export type ModelFields<M extends Model> = OptionalFields<M> &
  RequiredFields<M> &
  AbstractsAsFields<M['abstracts'][number]>;

export type AllRequiredModelFields<M extends Model> = AllRequiredFields<M>;

type RelatedFieldOfModel<
  M extends Model,
  I extends readonly ReturnType<typeof model>[]
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
    ? RNN
    : never]: M['fields'][K] extends ForeignKeyField<
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
      ? IncludesRelatedModels<AllRequiredModelFields<RMIFF>, RMIFF, I>
      : RMIFF
    : unknown;
};

type RelatedFieldToModel<
  M extends Model,
  RM extends Model,
  I extends readonly ReturnType<typeof model>[]
> = {
  [K in keyof RM['fields'] as RM['fields'][K] extends ForeignKeyField<
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
    ? IncludesRelatedModels<AllRequiredModelFields<RM>, RM, I>
    : IncludesRelatedModels<AllRequiredModelFields<RM>, RM, I>[];
};

type RelatedFieldsType<
  T,
  M extends Model,
  I extends ReturnType<typeof model>,
  Includes extends readonly ReturnType<typeof model>[]
> = I extends ReturnType<typeof model>
  ? T &
      RelatedFieldToModel<M, InstanceType<I>, Includes> &
      RelatedFieldOfModel<M, Includes>
  : T;

export type IncludesRelatedModels<
  T,
  M extends Model,
  I extends readonly ReturnType<typeof model>[] | undefined
> = I extends readonly [infer FI, ...infer RI]
  ? FI extends ReturnType<typeof model>
    ? RI extends ReturnType<typeof model>[]
      ? RelatedFieldsType<T, M, FI, I> & IncludesRelatedModels<T, M, RI>
      : RelatedFieldsType<T, M, FI, I>
    : T
  : T;

export type RequiredFieldsIgnoringRelations<M extends Model> = {
  [F in keyof M['fields'] as M['fields'][F] extends ForeignKeyField<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >
    ? never
    : F]: AddNull<M['fields'][F extends string ? F : never]>;
};
export type AllRequiredFieldsIgnoringRelations<M extends Model> =
  RequiredFieldsIgnoringRelations<M>;

type RelatedFieldOfModelOnCreateOrUpdate<
  M extends Model,
  RM extends Model,
  I extends readonly ReturnType<typeof model>[]
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
    ? RNN
    : never]: M['fields'][K] extends ForeignKeyField<
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
    ? RMIFF extends RM
      ? IncludesRelatedModelsForCreateOrUpdate<
          AllRequiredFieldsIgnoringRelations<RMIFF>,
          RMIFF,
          I
        >
      : never
    : never;
};

type RelatedFieldToModelOnCreateOrUpdate<
  M extends Model,
  RM extends Model,
  I extends readonly ReturnType<typeof model>[]
> = {
  [K in keyof RM['fields'] as RM['fields'][K] extends ForeignKeyField<
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
        AllRequiredFieldsIgnoringRelations<RM>,
        RM,
        I
      >
    : IncludesRelatedModelsForCreateOrUpdate<
        AllRequiredFieldsIgnoringRelations<RM>,
        RM,
        I
      >[];
};

type ExcludesNeverFromFields<F> = {
  [K in keyof F as F[K] extends never ? never : K]: F[K];
};

export type RelatedFieldsTypeWithoutModelRelation<
  T,
  M extends Model,
  I extends ReturnType<typeof model>,
  Includes extends readonly ReturnType<typeof model>[]
> = I extends ReturnType<typeof model>
  ? T &
      ExcludesNeverFromFields<
        RelatedFieldToModelOnCreateOrUpdate<M, InstanceType<I>, Includes>
      > &
      ExcludesNeverFromFields<
        RelatedFieldOfModelOnCreateOrUpdate<M, InstanceType<I>, Includes>
      >
  : T;

export type IncludesRelatedModelsForCreateOrUpdate<
  T,
  M extends Model,
  I extends readonly ReturnType<typeof model>[] | undefined
> = I extends readonly [infer FI, ...infer RI]
  ? FI extends ReturnType<typeof model>
    ? RI extends ReturnType<typeof model>[]
      ? RelatedFieldsTypeWithoutModelRelation<T, M, FI, RI> &
          IncludesRelatedModelsForCreateOrUpdate<T, M, RI>
      : RelatedFieldsTypeWithoutModelRelation<T, M, FI, I>
    : T
  : T;

export type AllOptionalModelFields<M extends Model> = AllOptionalFields<M>;
