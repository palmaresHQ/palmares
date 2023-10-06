import Field from './field';
import Engine, { EngineFields } from '../../engine';
import { Model } from '../model';

import type { Narrow } from '@palmares/core';

export type DefaultFieldType = Field<any, any, any, any, any, any, any, any>;

export type MaybeNull<Type, IsNull extends boolean> = IsNull extends true ? Type | null | undefined : Type;

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
  toString(indentation: number, customParams: string | undefined): Promise<string>;
}

export type ClassConstructor<T> = {
  new (...args: unknown[]): T;
};
export interface FieldDefaultParamsType<
  TField extends DefaultFieldType,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
> {
  /**
   * Specifies if this field should be considered the primary key of the model. (default: false)
   */
  primaryKey?: boolean;
  /**
   * If this field should be unique or not. (default: false)
   */
  unique?: TUnique;
  /**
   * On relational database we can create an index. This specifies if we should create an index for this field on the database (default: false). Be aware, this is mostly for relational databases.
   */
  dbIndex?: boolean;
  /**
   * If the field name should be underscored on the database or not. Like `firstName` will be converted to `first_name` on the database. This is ignored if `databaseName` is set. (default: true)
   */
  underscored?: boolean;
  /**
   *  The name of the field on the database. If this is not set, we will use either the field name or the underscored version of the field name.
   */
  databaseName?: TDatabaseName;
  /**
   * The default value for this field. (default: undefined)
   */
  defaultValue?: TDefaultValue;
  /**
   * If this field can be null or not. (default: false)
   */
  allowNull?: TNull;
  /**
   * An auto field is automatically incremented by the database engine. (default: false)
   */
  isAuto?: TAuto;
  /**
   * Custom attributes that will be passed to the field for the engine to use.
   */
  customAttributes?: TCustomAttributes;
}

export type DecimalFieldParamsType<
  TField extends DefaultFieldType,
  TDefaultValue extends TNull extends true
    ? TField['_type'] | undefined | null
    : TField['_type'] | undefined = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
> = {
  /**
   * The maximum number of digits allowed in the numbers.
   */
  maxDigits: number;
  /**
   * The maximum number of decimal places allowed in the numbers.
   */
  decimalPlaces: number;
} & FieldDefaultParamsType<TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;

export type EnumFieldParamsType<
  TField extends DefaultFieldType,
  TDefaultValue extends TNull extends true
    ? TField['_type'] | undefined | null
    : TField['_type'] | undefined = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
  TEnumChoices extends string[] = string[],
> = {
  /**
   * The choices that this field can have.
   */
  choices: Narrow<TEnumChoices>;
} & FieldDefaultParamsType<TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;

export type TextFieldParamsType<
  TField extends DefaultFieldType,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
> = {
  /**
   * If this field can be blank: '' (empty string) or not. (default: false)
   */
  allowBlank?: boolean;
} & FieldDefaultParamsType<TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;

export type CharFieldParamsType<
  TField extends DefaultFieldType,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
  TMaxLength extends number = 255,
> = {
  /**
   * The maximum length of the string. (default: 255)
   */
  maxLength?: TMaxLength;
} & TextFieldParamsType<TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;

export type UUIDFieldParamsType<
  TField extends DefaultFieldType,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
  TAutoGenerate extends boolean = TAuto,
> = {
  /**
   * If this field should be automatically generated by the engine or not. (default: false)
   */
  autoGenerate?: TAutoGenerate;
  /**
   * The maximum length of the uuid string. (default: 32)
   */
  maxLength?: number;
} & TextFieldParamsType<
  TField,
  TDefaultValue,
  TUnique,
  TNull,
  TAutoGenerate extends true ? true : TAuto,
  TDatabaseName,
  TCustomAttributes
>;

export type DateFieldParamsType<
  TField extends Field,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
  TAutoNow extends boolean = false,
  TAutoNowAdd extends boolean = false,
> = {
  /**
   *  If this is set to true, the field will be automatically set to the current date and time every time the model is saved. It's useful for `updatedAt` fields (default: false)
   */
  autoNow?: TAutoNow;
  /**
   * If this is set to true, the field will be automatically set to the current date and time when the model is first created. It's useful for `createdAt` fields (default: false)
   */
  autoNowAdd?: TAutoNowAdd;
} & FieldDefaultParamsType<TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;

export type ForeignKeyFieldParamsType<
  F extends Field,
  TLazyDefaultValue = undefined,
  D extends N extends true
    ?
        | (TLazyDefaultValue extends undefined
            ? T extends undefined
              ? M extends Model<any>
                ? M['fields'][RF]['_type']
                : T
              : T
            : TLazyDefaultValue)
        | undefined
        | null
    :
        | (TLazyDefaultValue extends undefined
            ? T extends undefined
              ? M extends Model<any>
                ? M['fields'][RF]['_type']
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
  RNN extends string = any,
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
