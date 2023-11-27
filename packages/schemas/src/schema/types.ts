import SchemaAdapter from '../adapter';
import FieldAdapter from '../adapter/fields';
import Schema from './schema';

export type OnlyFieldAdaptersFromSchemaAdapter = keyof {
  [key in keyof SchemaAdapter as SchemaAdapter[key] extends FieldAdapter ? key : never]: SchemaAdapter[key];
};

export type DefinitionsOfSchemaType = {
  schemaAdapter: SchemaAdapter;
};

export type ValidationHighPriorityFallbackType = Awaited<ReturnType<Schema['__highPriorityFallbacks'][number]>>;
export type ValidationFallbackType = Awaited<ReturnType<Schema['__fallbacks'][number]>>;

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
