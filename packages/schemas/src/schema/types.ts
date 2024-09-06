import type { BooleanSchema } from './boolean';
import type { ObjectSchema } from './object';
import type { Schema } from './schema';
import type { StringSchema } from './string';
import type { SchemaAdapter } from '../adapter';
import type { FieldAdapter } from '../adapter/fields';
import type { ErrorCodes } from '../adapter/types';
import type { ValidatorTypes } from '../validators/types';
import type { Validator } from '../validators/utils';

export type OnlyFieldAdaptersFromSchemaAdapter = keyof {
  [key in keyof SchemaAdapter as SchemaAdapter[key] extends FieldAdapter ? key : never]: SchemaAdapter[key];
};

export type DefinitionsOfSchemaType = {
  schemaType: 'array' | 'object' | 'string' | 'number' | 'boolean' | 'union' | 'datetime' | 'field' | 'datetime';
  schemaAdapter: SchemaAdapter;
  hasSave?: boolean;
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

type TypesOfSchema = Schema extends Schema<infer TType, any> ? TType : never;
type ExtractTypeFromSchemaByTypeOfSchema<
  TSchema extends Schema,
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
  TData extends Record<string, Schema>,
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
  TSchemas extends readonly Schema[] = [],
  TType extends 'input' | 'output' | 'representation' | 'internal' | 'validate' = 'input'
> = TSchemas extends readonly [infer TFirstSchema, ...infer TRestOfSchemas]
  ? TFirstSchema extends Schema<{
      input: infer TInput;
      internal: infer TInternal;
      output: infer TOutput;
      representation: infer TRepresentation;
      validate: infer TValidate;
    }>
    ?
        | (TType extends 'output'
            ? TOutput
            : TType extends 'representation'
              ? TRepresentation
              : TType extends 'internal'
                ? TInternal
                : TType extends 'validate'
                  ? TValidate
                  : TInput)
        | ExtractTypeFromUnionOfSchemas<TRestOfSchemas extends readonly Schema[] ? TRestOfSchemas : [], TType>
    : unknown
  : never;

export type ExtractTypeFromArrayOfSchemas<
  TSchemas extends readonly [Schema, ...Schema[]] | [[Schema]],
  TTypeToExtract extends keyof TypesOfSchema = 'input',
  TResult extends any[] = []
> = TSchemas extends readonly [infer TSchema, ...infer TRestSchemas]
  ? TSchema extends Schema
    ? TRestSchemas extends readonly [Schema, ...Schema[]]
      ? ExtractTypeFromArrayOfSchemas<
          TRestSchemas,
          TTypeToExtract,
          [...TResult, ExtractTypeFromSchemaByTypeOfSchema<TSchema, TTypeToExtract>]
        >
      : [...TResult, ExtractTypeFromSchemaByTypeOfSchema<TSchema, TTypeToExtract>]
    : TSchemas extends [[infer TSchema]]
      ? TSchema extends Schema
        ? ExtractTypeFromSchemaByTypeOfSchema<TSchema, TTypeToExtract>[]
        : never
      : never
  : never;

export type ExtractUnionTypesFromSchemas<TSchemas extends readonly Schema<any, any>[]> =
  TSchemas[number] extends Schema<infer TType, any> ? TType : never;
