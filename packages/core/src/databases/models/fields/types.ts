import Model from "../model";

export enum ON_DELETE {
  CASCADE = 'cascade',
  SET_NULL = 'set_null',
  SET_DEFAULT = 'set_default',
  DO_NOTHING = 'do_nothing',
  RESTRICT = 'restrict'
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

export interface TextFieldParamsType {
  allowBlank?: boolean;
};

export interface CharFieldParamsType {
  maxLength?: number;
};

export interface DateFieldParamsType {
  autoNow?: boolean;
  autoNowAdd?: boolean;
}

export interface ForeignKeyFieldParamsType {
  relatedTo: Model | string | null;
  onDelete: ON_DELETE | null;
  customName?: string;
  relatedName?: boolean;
  toField?: string;
}
