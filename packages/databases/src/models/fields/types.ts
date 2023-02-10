import Field from './field';
import Engine, { EngineFields } from '../../engine';
import { Model } from '../model';

export enum ON_DELETE {
  CASCADE = 'cascade',
  SET_NULL = 'set_null',
  SET_DEFAULT = 'set_default',
  DO_NOTHING = 'do_nothing',
  RESTRICT = 'restrict',
}

export type CustomImportsForFieldType = {
  packageName: string;
  value: `{ ${string} }` | `* as ${string}` | `{ default as ${string} }`;
};

export interface TranslatableFieldType {
  translate?(engine: Engine, engineFields: EngineFields): Promise<any>;
  toString(
    indentation: number,
    customParams: string | undefined
  ): Promise<string>;
}

export type ClassConstructor<T> = {
  new (...args: unknown[]): T;
};

export interface FieldDefaultParamsType<
  F extends Field<any, any, any, any, any, any>,
  D extends N extends true
    ? F['type'] | undefined | null
    : F['type'] | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any
> {
  primaryKey?: boolean;
  unique?: U;
  dbIndex?: boolean;
  underscored?: boolean;
  databaseName?: string | null;
  defaultValue?: D;
  allowNull?: N;
  isAuto?: A;
  customAttributes?: CA;
}

export type DecimalFieldParamsType<
  F extends Field,
  D extends N extends true
    ? F['type'] | undefined | null
    : F['type'] | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any
> = {
  maxDigits: number;
  decimalPlaces: number;
} & FieldDefaultParamsType<F, D, U, N, A, CA>;

export type TextFieldParamsType<
  F extends Field,
  D extends N extends true
    ? F['type'] | undefined | null
    : F['type'] | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any
> = {
  allowBlank?: boolean;
} & FieldDefaultParamsType<F, D, U, N, A, CA>;

export type CharFieldParamsType<
  F extends Field,
  D extends N extends true
    ? F['type'] | undefined | null
    : F['type'] | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any
> = {
  maxLength?: number;
} & TextFieldParamsType<F, D, U, N, A, CA>;

export type UUIDFieldParamsType<
  F extends Field,
  D extends N extends true
    ? F['type'] | undefined | null
    : F['type'] | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any,
  AG extends boolean = A
> = {
  autoGenerate?: AG;
  maxLength?: number;
} & TextFieldParamsType<F, D, U, N, AG extends true ? true : A, CA>;

export type DateFieldParamsType<
  F extends Field,
  D extends N extends true
    ? F['type'] | undefined | null
    : F['type'] | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any,
  AN extends boolean = false,
  ANA extends boolean = false
> = {
  autoNow?: AN;
  autoNowAdd?: ANA;
} & FieldDefaultParamsType<F, D, U, N, A, CA>;

export type ForeignKeyFieldParamsType<
  F extends Field,
  TLazyDefaultValue = undefined,
  D extends N extends true
    ?
        | (TLazyDefaultValue extends undefined
            ? T extends undefined
              ? M extends Model<infer ThisModel>
                ? ThisModel extends Model
                  ? ThisModel['fields'][RF]['type']
                  : T
                : T
              : T
            : TLazyDefaultValue)
        | undefined
        | null
    :
        | (TLazyDefaultValue extends undefined
            ? T extends undefined
              ? M extends Model<infer ThisModel>
                ? ThisModel extends Model
                  ? ThisModel['fields'][RF]['type']
                  : T
                : T
              : T
            : TLazyDefaultValue)
        | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any,
  T = undefined,
  M = Model,
  RF extends string = any,
  RN extends string = any,
  RNN extends string = any
> = {
  relatedTo: ClassConstructor<M> | string;
  /** To which field of the `relatedTo` model does this field relates to? */
  toField: RF;
  /** Name of the field of the relation in the related model. In other words: "the `relatedTo` model contains `${relatedName}`" */
  relatedName: RN;
  /** Name of the field of the relation in the model you are creating the relation on  */
  relationName: RNN;
  /** What will we do when you delete an instance from the database, this relates to the remove query, and is internal for the database,
   * palmares by itself does not control cascading deletes */
  onDelete: ON_DELETE;
  customName?: string;
  lazyDefaultValueType?: TLazyDefaultValue;
} & FieldDefaultParamsType<F, D, U, N, A, CA>;
