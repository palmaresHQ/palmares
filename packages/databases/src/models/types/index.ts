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
  [fieldName: string | symbol]: Field<any, any, any, any, any, any>;
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

export type ExtractFieldNames<TFieldsAndAbstracts, TModelAbstracts> =
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

type ExtractFieldTypes<
  TFieldsAndAbstracts,
  TModelAbstracts,
  TIsAllOptional extends boolean = false
> = TFieldsAndAbstracts extends { fields: infer TFields }
  ? (TIsAllOptional extends true
      ? {
          [TFieldName in keyof TFields]?: 'type' extends keyof TFields[TFieldName]
            ? 'allowNull' extends keyof TFields[TFieldName]
              ? TFields[TFieldName]['allowNull'] extends true
                ? TFields[TFieldName]['type'] | null
                : TFields[TFieldName]['type']
              : never
            : never;
        }
      : {
          [TFieldName in keyof TFields]: 'type' extends keyof TFields[TFieldName]
            ? 'allowNull' extends keyof TFields[TFieldName]
              ? TFields[TFieldName]['allowNull'] extends true
                ? TFields[TFieldName]['type'] | null
                : TFields[TFieldName]['type']
              : never
            : never;
        }) &
      (TModelAbstracts extends readonly [
        infer TAbstract,
        ...infer TRestAbstracts
      ]
        ? TAbstract extends
            | { fields: any }
            | { fields: any; abstracts: infer TAbstractsOfAbstract }
          ?
              | ExtractFieldTypes<TAbstract, TAbstractsOfAbstract>
              | ExtractFieldTypes<
                  TFieldsAndAbstracts,
                  TRestAbstracts extends
                    | { fields: any }
                    | { fields: any; abstracts: readonly any[] }
                    ? TRestAbstracts
                    : never[]
                >
          : unknown
        : unknown)
  : unknown;

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
  onGet?: (args: {
    search: ExtractFieldTypes<
      M,
      M extends { abstracts: infer TAbstracts } ? TAbstracts : never[],
      true
    >;
    fields: readonly ExtractFieldNames<
      M,
      M extends { abstracts: infer TAbstracts } ? TAbstracts : never[]
    >[];
    ordering?: OrderingOfModelOptions<
      ExtractFieldNames<
        M,
        M extends { abstracts: infer TAbstracts } ? TAbstracts : never[]
      >
    >[];
    limit?: number;
    offset?: number | string;
  }) => Promise<any[]>;
  onSet?: (args: {
    data: ExtractFieldTypes<
      M,
      M extends { abstracts: infer TAbstracts } ? TAbstracts : never[],
      false
    >;
    search: ExtractFieldTypes<
      M,
      M extends { abstracts: infer TAbstracts } ? TAbstracts : never[],
      true
    >;
  }) => Promise<any[]>;
  onRemove?: (args: {
    /** Sometimes we just want to return the data but we don't want to remove it. Most of the time you should remove it. */
    shouldRemove?: boolean;
    /** Should you return the data that you are removing? By default yes, you should, in case this is false you should not. */
    shouldReturnData?: boolean;
    search: ExtractFieldTypes<
      M,
      M extends { abstracts: infer TAbstracts } ? TAbstracts : never[],
      true
    >;
  }) => Promise<any[]>;
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
