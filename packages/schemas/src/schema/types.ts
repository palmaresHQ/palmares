import type { ArraySchema } from './array';
import type { BooleanSchema } from './boolean';
import type { DatetimeSchema } from './datetime';
import type { NumberSchema } from './number';
import type { ObjectSchema } from './object';
import type { Schema } from './schema';
import type { StringSchema } from './string';
import type { UnionSchema } from './union';
import type { SchemaAdapter } from '../adapter';
import type { FieldAdapter } from '../adapter/fields';
import type { ErrorCodes } from '../adapter/types';
import type { ValidatorTypes } from '../validators/types';
import type { Validator } from '../validators/utils';

export type OnlyFieldAdaptersFromSchemaAdapter = keyof {
  [key in keyof SchemaAdapter as SchemaAdapter[key] extends FieldAdapter ? key : never]: SchemaAdapter[key];
};

export type AllSchemaTypes =
  | ArraySchema<any, any, any>
  | BooleanSchema<any, any>
  | ObjectSchema<any, any, any>
  | Schema<any, any>
  | StringSchema<any, any>
  | DatetimeSchema<any, any>
  | UnionSchema<any, any, any>
  | NumberSchema<any, any>;

export type DefinitionsOfSchemaType<TSchemaAdapter extends SchemaAdapter = SchemaAdapter> = {
  schemaType: 'array' | 'object' | 'string' | 'number' | 'boolean' | 'union' | 'datetime' | 'field' | 'datetime';
  schemaAdapter: TSchemaAdapter;
  context: any;
  hasSave: boolean;
};

export type ValidationFallbackCallbackType = Validator['fallbacks'][number];
export type ValidationFallbackCallbackReturnType = {
  parsed: any;
  errors: {
    received: any;
    isValid: boolean;
    code: ErrorCodes;
    message: string;
    path: (string | number)[];
  }[];
  preventChildValidation?: boolean;
};
export type ValidationFallbackReturnType = {
  type: ValidatorTypes;
  name: string;
  callback: ValidationFallbackCallbackType;
};

export type TypesOfSchema<TSchema = Schema> = TSchema extends
  | Schema<infer TType, any>
  | ArraySchema<infer TType, any, any>
  | UnionSchema<infer TType, any, any>
  | NumberSchema<infer TType, any>
  | StringSchema<infer TType, any>
  | ObjectSchema<infer TType, any, any>
  | BooleanSchema<infer TType, any>
  | DatetimeSchema<infer TType, any>
  ? TType
  : never;

export type ExtractTypeFromSchemaByTypeOfSchema<
  TSchema extends AllSchemaTypes,
  TTypeToExtract extends keyof TypesOfSchema = 'input'
> = TSchema extends
  | Schema<
      {
        input: infer TInputType;
        validate: infer TValidateType;
        internal: infer TInternalType;
        output: infer TOutputType;
        representation: infer TRepresentationType;
      },
      any
    >
  | ArraySchema<
      {
        input: infer TInputType;
        validate: infer TValidateType;
        internal: infer TInternalType;
        output: infer TOutputType;
        representation: infer TRepresentationType;
      },
      any,
      any
    >
  | UnionSchema<
      {
        input: infer TInputType;
        validate: infer TValidateType;
        internal: infer TInternalType;
        output: infer TOutputType;
        representation: infer TRepresentationType;
      },
      any,
      any
    >
  | NumberSchema<
      {
        input: infer TInputType;
        validate: infer TValidateType;
        internal: infer TInternalType;
        output: infer TOutputType;
        representation: infer TRepresentationType;
      },
      any
    >
  | StringSchema<
      {
        input: infer TInputType;
        validate: infer TValidateType;
        internal: infer TInternalType;
        output: infer TOutputType;
        representation: infer TRepresentationType;
      },
      any
    >
  | ObjectSchema<
      {
        input: infer TInputType;
        validate: infer TValidateType;
        internal: infer TInternalType;
        output: infer TOutputType;
        representation: infer TRepresentationType;
      },
      any,
      any
    >
  | BooleanSchema<
      {
        input: infer TInputType;
        validate: infer TValidateType;
        internal: infer TInternalType;
        output: infer TOutputType;
        representation: infer TRepresentationType;
      },
      any
    >
  | DatetimeSchema<
      {
        input: infer TInputType;
        validate: infer TValidateType;
        internal: infer TInternalType;
        output: infer TOutputType;
        representation: infer TRepresentationType;
      },
      any
    >
  ? TTypeToExtract extends 'input'
    ? TInputType
    : TTypeToExtract extends 'validate'
      ? TValidateType
      : TTypeToExtract extends 'internal'
        ? TInternalType
        : TTypeToExtract extends 'output'
          ? TOutputType
          : TRepresentationType
  : never;
export type ExtractTypeFromObjectOfSchemas<
  TData extends Record<string, Schema<any, any>>,
  TTypeToExtract extends keyof TypesOfSchema = 'input'
> = {
  [key in keyof TData as undefined extends ExtractTypeFromSchemaByTypeOfSchema<TData[key], TTypeToExtract>
    ? never
    : key]: ExtractTypeFromSchemaByTypeOfSchema<TData[key], TTypeToExtract>;
} & {
  [key in keyof TData as undefined extends ExtractTypeFromSchemaByTypeOfSchema<TData[key], TTypeToExtract>
    ? key
    : never]?: ExtractTypeFromSchemaByTypeOfSchema<TData[key], TTypeToExtract>;
};

export type ExtractTypeFromUnionOfSchemas<
  TSchemas extends readonly AllSchemaTypes[] = [],
  TType extends 'input' | 'output' | 'representation' | 'internal' | 'validate' = 'input'
> = TSchemas extends readonly [infer TFirstSchema, ...infer TRestOfSchemas]
  ? TFirstSchema extends AllSchemaTypes
    ?
        | ExtractTypeFromSchemaByTypeOfSchema<TFirstSchema, TType>
        | ExtractTypeFromUnionOfSchemas<TRestOfSchemas extends readonly Schema[] ? TRestOfSchemas : [], TType>
    : unknown
  : never;

export type ExtractTypeFromArrayOfSchemas<
  TSchemas extends readonly [AllSchemaTypes, ...AllSchemaTypes[]] | [[AllSchemaTypes]],
  TTypeToExtract extends keyof TypesOfSchema = 'input',
  TResult extends any[] = []
> = TSchemas extends readonly [infer TSchema, ...infer TRestSchemas]
  ? TSchema extends AllSchemaTypes
    ? TRestSchemas extends readonly [AllSchemaTypes, ...AllSchemaTypes[]]
      ? ExtractTypeFromArrayOfSchemas<
          TRestSchemas,
          TTypeToExtract,
          [...TResult, ExtractTypeFromSchemaByTypeOfSchema<TSchema, TTypeToExtract>]
        >
      : [...TResult, ExtractTypeFromSchemaByTypeOfSchema<TSchema, TTypeToExtract>]
    : TSchemas extends [[infer TSchema]]
      ? TSchema extends AllSchemaTypes
        ? ExtractTypeFromSchemaByTypeOfSchema<TSchema, TTypeToExtract>[]
        : never
      : never
  : never;

export type ExtractUnionTypesFromSchemas<TSchemas extends readonly AllSchemaTypes[]> = TypesOfSchema<TSchemas[number]>;
