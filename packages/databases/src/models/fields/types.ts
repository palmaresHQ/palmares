import Model from "../model";

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

export interface FieldDefaultParamsType {
  primaryKey?: boolean;
  defaultValue?: string | number | boolean | null | undefined | Date;
  allowNull?: boolean;
  unique?: boolean;
  dbIndex?: boolean;
  underscored?: boolean;
  databaseName?: string | null;
  customAttributes?: any | undefined | object | null;
};

export type DecimalFieldParamsType = {
  maxDigits?: number | null;
  decimalPlaces?: number | null;
};

export interface TextFieldParamsType extends FieldDefaultParamsType {
  allowBlank?: boolean;
};

export interface CharFieldParamsType extends FieldDefaultParamsType, TextFieldParamsType {
  maxLength: number;
};

export interface UUIDFieldParamsType extends CharFieldParamsType {
  autoGenerate?: boolean;
}

export interface DateFieldParamsType extends FieldDefaultParamsType {
  autoNow?: boolean;
  autoNowAdd?: boolean;
}

export interface ForeignKeyFieldParamsType extends FieldDefaultParamsType {
  relatedTo: Model | string;
  onDelete: ON_DELETE;
  customName?: string;
  relatedName?: string;
  toField?: string;
}
