import Engine, { EngineFields } from "../../engine";

export enum ON_DELETE {
  CASCADE = 'cascade',
  SET_NULL = 'set_null',
  SET_DEFAULT = 'set_default',
  DO_NOTHING = 'do_nothing',
  RESTRICT = 'restrict'
}

export enum FieldTypes {
  Field = 'Field',
  AutoField = 'Auto',
  BigAutoField = 'BigAuto',
  IntegerField = 'Integer',
  BigIntegerField = 'BigInteger',
  DecimalField = 'Decimal',
  CharField = 'Char',
  TextField = 'Text',
  ForeignKeyField = 'ForeignKey'
}

export type CustomImportsForFieldType = {
  packageName: string;
  value: `{ ${string} }` | `* as ${string}` | `{ default as ${string} }`;
};

export interface TranslatableFieldType {
  translate?(engine: Engine, engineFields: EngineFields): Promise<any>,
  toString(indentation: number, customParams: string | undefined): Promise<string>;
}

export type ClassConstructor<T> = {
  new (...args: unknown[]): T;
};

export interface FieldDefaultParamsType {
  primaryKey?: boolean;
  unique?: boolean;
  dbIndex?: boolean;
  underscored?: boolean;
  databaseName?: string | null;
  customAttributes?: any;
};

export type DecimalFieldParamsType = {
  maxDigits?: number;
  decimalPlaces?: number;
} & FieldDefaultParamsType;

export interface TextFieldParamsType extends FieldDefaultParamsType {
  allowBlank?: boolean;
};

export interface CharFieldParamsType extends FieldDefaultParamsType, TextFieldParamsType {
  maxLength: number;
};

export interface UUIDFieldParamsType extends FieldDefaultParamsType, TextFieldParamsType {
  autoGenerate?: boolean;
  maxLength?: number;
}

export type DateFieldParamsType= {
  autoNow?: boolean;
  autoNowAdd?: boolean;
} & FieldDefaultParamsType


export type ForeignKeyFieldParamsType = {
  onDelete: ON_DELETE;
  customName?: string;
  relatedName?: string;
} & FieldDefaultParamsType
