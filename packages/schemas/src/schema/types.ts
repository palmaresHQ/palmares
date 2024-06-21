import SchemaAdapter from '../adapter';
import FieldAdapter from '../adapter/fields';
import Validator from '../validators/utils';
import Schema from './schema';

import type { ValidatorTypes } from '../validators/types';
import { ErrorCodes } from '../adapter/types';
import StringSchema from './string';
import ObjectSchema from './object';
import BooleanSchema from './boolean';

export type OnlyFieldAdaptersFromSchemaAdapter = keyof {
  [key in keyof SchemaAdapter as SchemaAdapter[key] extends FieldAdapter ? key : never]: SchemaAdapter[key];
};

export type DefinitionsOfSchemaType = {
  schemaType: 'array' | 'object' | 'string' | 'number' | 'boolean' | 'union' | 'datetime' | 'field' |'datetime';
  schemaAdapter: SchemaAdapter;
  hasSave?: boolean;
};

export type ValidationFallbackCallbackType = Validator['fallbacks'][number];
export type ValidationFallbackCallbackReturnType = {
  parsed: any;
  errors: {
    isValid: boolean;
    code: ErrorCodes;
    message: string;
    path: (string | number)[];
  }[];
  preventChildValidation?: boolean;
};
export type ValidationFallbackReturnType = {
  type: ValidatorTypes;
  callback: ValidationFallbackCallbackType;
};

type TypesOfSchema = Schema extends Schema<infer TType, any> ? TType : never;
type ExtractTypeFromSchemaByTypeOfSchema<
  TSchema extends Schema,
  TypeToExtract extends keyof TypesOfSchema = 'input',
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
  ? TypeToExtract extends 'input'
    ? TInputType
    : TypeToExtract extends 'validate'
    ? TValidateType
    : TypeToExtract extends 'internal'
    ? TInternalType
    : TypeToExtract extends 'output'
    ? TOutputType
    : TRepresentationType
  : never;
export type ExtractTypeFromObjectOfSchemas<
  TData extends Record<string, Schema>,
  TypeToExtract extends keyof TypesOfSchema = 'input',
> = {
  [key in keyof TData as undefined extends ExtractTypeFromSchemaByTypeOfSchema<TData[key], TypeToExtract>
    ? never
    : key]: ExtractTypeFromSchemaByTypeOfSchema<TData[key], TypeToExtract>;
} & {
  [key in keyof TData as undefined extends ExtractTypeFromSchemaByTypeOfSchema<TData[key], TypeToExtract>
    ? key
    : never]?: ExtractTypeFromSchemaByTypeOfSchema<TData[key], TypeToExtract>;
};

export type ExtractTypeFromArrayOfSchemas<
  TSchemas extends readonly [Schema, ...Schema[]] | [Array<Schema>],
  TypeToExtract extends keyof TypesOfSchema = 'input',
  TResult extends any[] = [],
> = TSchemas extends readonly [infer TSchema, ...infer TRestSchemas]
  ? TSchema extends Schema
    ? TRestSchemas extends readonly [Schema, ...Schema[]]
      ? ExtractTypeFromArrayOfSchemas<
          TRestSchemas,
          TypeToExtract,
          [...TResult, ExtractTypeFromSchemaByTypeOfSchema<TSchema, TypeToExtract>]
        >
      : [...TResult, ExtractTypeFromSchemaByTypeOfSchema<TSchema, TypeToExtract>]
    : TSchemas extends [infer TArraySchema]
    ? TArraySchema extends Schema[]
      ? ExtractTypeFromSchemaByTypeOfSchema<TArraySchema[number], TypeToExtract>[]
      : never
    : never
  : never;

export type ExtractUnionTypesFromSchemas<TSchemas extends readonly Schema<any, any>[]> = TSchemas[number] extends Schema<infer TType, any> ? TType : never;
