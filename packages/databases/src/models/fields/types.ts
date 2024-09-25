import type { AutoField } from './auto';
import type { BigAutoField } from './big-auto';
import type { BigIntegerField } from './big-integer';
import type { BooleanField } from './boolean';
import type { CharField } from './char';
import type { DateField } from './date';
import type { EnumField } from './enum';
import type { Field } from './field';
import type { ForeignKeyField } from './foreign-key';
import type { IntegerField } from './integer';
import type { TextField } from './text';
import type { UuidField } from './uuid';
import type { DatabaseAdapter } from '../../engine';
import type { AdapterFields } from '../../engine/fields';
import type { Model } from '../model';
import type { Narrow } from '@palmares/core';

export type DefaultFieldType = Field<any, any>;

export type MaybeNull<TType, TIsNull extends boolean> = TIsNull extends true ? TType | null | undefined : TType;

// eslint-disable-next-line no-shadow
export enum ON_DELETE {
  CASCADE = 'cascade',
  SET_NULL = 'set_null',
  SET_DEFAULT = 'set_default',
  DO_NOTHING = 'do_nothing',
  RESTRICT = 'restrict'
}

export type CustomImportsForFieldType = {
  packageName: string;
  value: `{ ${string} }` | `* as ${string}` | `{ default as ${string} }`;
};

export interface TranslatableFieldType {
  translate?: (engine: DatabaseAdapter, engineFields: AdapterFields) => Promise<any>;
  toString: (indentation: number, customParams: string | undefined) => Promise<string>;
}

export type ExtractFieldNameOptionsOfModel<TProbablyAModel> = TProbablyAModel extends {
  new (...args: any): { fields: infer TFields };
}
  ? keyof TFields
  : string;

export type ExtractTypeFromFieldOfAModel<
  TProbablyAModel,
  TToFieldName extends string,
  TTypeToExtract extends 'create' | 'update' | 'read' = 'create'
> = TProbablyAModel extends
  | { new (...args: any): { fields: infer TFields } }
  | (() => { new (...args: any): { fields: infer TFields } })
  ? TFields extends Record<
      any,
      | Field<any, any>
      | AutoField<any, any>
      | BigAutoField<any, any>
      | BigIntegerField<any, any>
      | IntegerField<any, any>
      | BooleanField<any, any>
      | EnumField<any, any>
      | CharField<any, any>
      | DateField<any, any>
      | TextField<any, any>
      | UuidField<any, any>
      | ForeignKeyField<any, any>
    >
    ? TFields[TToFieldName] extends
        | Field<infer TType, any>
        | AutoField<infer TType, any>
        | BigAutoField<infer TType, any>
        | BigIntegerField<infer TType, any>
        | IntegerField<infer TType, any>
        | BooleanField<infer TType, any>
        | EnumField<infer TType, any>
        | CharField<infer TType, any>
        | DateField<infer TType, any>
        | TextField<infer TType, any>
        | UuidField<infer TType, any>
        | ForeignKeyField<infer TType, any>
      ? TType[TTypeToExtract]
      : any
    : any
  : TProbablyAModel extends (args: infer TType) => { new (...args: any): any }
    ? TTypeToExtract extends keyof TType
      ? TType[TTypeToExtract]
      : any
    : any;
