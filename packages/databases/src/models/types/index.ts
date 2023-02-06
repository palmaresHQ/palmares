import { Field } from '../fields';
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

export type ModelIndexType<TFields = string> = {
  unique: boolean;
  fields: TFields[];
};

type OrderingOfModelOptions<TFields> =
  | keyof { [F in TFields as F extends string ? `-${F}` : never]: F }
  | keyof { [F in TFields as F extends string ? `${F}` : never]: F };

type ExtractFieldNames<TFieldsAndAbstracts, TModelAbstracts> =
  TFieldsAndAbstracts extends { fields: infer TFields }
    ?
        | keyof TFields
        | (TModelAbstracts extends readonly [
            infer TAbstract,
            ...infer TRestAbstracts
          ]
            ? TAbstract extends
                | { fields: any }
                | { fields: any; abstracts: infer TAbstractsOfAbstract }
              ?
                  | ExtractFieldNames<TAbstract, TAbstractsOfAbstract>
                  | ExtractFieldNames<
                      TFieldsAndAbstracts,
                      TRestAbstracts extends
                        | { fields: any }
                        | { fields: any; abstracts: readonly any[] }
                        ? TRestAbstracts
                        : never[]
                    >
              : never
            : never)
    : never;

export type ModelOptionsType<M = any> = {
  indexes?: ModelIndexType<
    ExtractFieldNames<
      M,
      M extends { abstracts: infer TAbstracts } ? TAbstracts : never[]
    >
  >[];
  ordering?:
    | OrderingOfModelOptions<
        ExtractFieldNames<
          M,
          M extends { abstracts: infer TAbstracts } ? TAbstracts : never[]
        >
      >[]
    | string[];
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

type DoNotHaveDefaultValueFields<M extends ModelFieldsType> = {
  [F in keyof M as M[F]['hasDefaultValue'] extends false ? F : never]: M[F];
};

type RequiredFields<M extends Model> = {
  [F in keyof DoNotHaveDefaultValueFields<M['fields']>]: AddNull<
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

export type ModelFields<M extends Model> = OptionalFields<M> &
  RequiredFields<M> &
  AbstractsAsFields<M['abstracts'][number]>;

export type IncludesInstances<TModel = any> = {
  model: TModel;
  includes?: IncludesInstances<TModel>[];
};

export * from './queries';
