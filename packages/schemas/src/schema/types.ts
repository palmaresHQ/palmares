import SchemaAdapter from '../adapter';
import FieldAdapter from '../adapter/fields';
import Validator from '../validators/utils';
import Schema from './schema';

import type { ValidatorTypes } from '../validators/types';

export type OnlyFieldAdaptersFromSchemaAdapter = keyof {
  [key in keyof SchemaAdapter as SchemaAdapter[key] extends FieldAdapter ? key : never]: SchemaAdapter[key];
};

export type DefinitionsOfSchemaType = {
  schemaAdapter: SchemaAdapter;
};

export type ValidationFallbackCallbackType = Validator['fallbacks'][number];
export type ValidationFallbackCallbackReturnType = Awaited<ReturnType<Validator['fallbacks'][number]>>;
export type ValidationFallbackReturnType = {
  type: ValidatorTypes;
  callback: ValidationFallbackCallbackType;
  adapters?: SchemaAdapter[];
};

type TypesOfSchema = Schema extends Schema<infer TType, any> ? TType : never;
export type ExtractTypeFromObjectOfSchemas<
  TData extends Record<string, Schema>,
  TypeToExtract extends keyof TypesOfSchema = 'input',
> = {
  [key in keyof TData]: TData[key] extends Schema<
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
};

export type ExtractUnionTypesFromSchemas<TSchemas extends readonly Schema<any, any>[]> = TSchemas[number]['__types'];
