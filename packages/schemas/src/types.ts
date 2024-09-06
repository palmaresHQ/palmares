import type { SchemaAdapter } from './adapter';
import type { Schema } from './schema/schema';
import type { ValidatorTypes } from './validators/types';

export type MaybePromise<T> = T | Promise<T>;

export type SchemasSettingsType = {
  schemaAdapter: typeof SchemaAdapter;
};

export type FallbackFunctionsType<TArguments> = {
  [TKey in keyof TArguments]?: (args: NonNullable<TArguments[TKey]>) => {
    type: ValidatorTypes;
    callback: NonNullable<Schema['__rootFallbacksValidator']['fallbacks'][number]>;
  };
};

export type SupportedSchemas = 'number' | 'object' | 'union' | 'string' | 'array' | 'boolean' | 'datetime';

/**
 * Retrieve the typescript type of a schema.
 *
 * First generic is `typeof myCustomSchema`.
 *
 * Second generic is:
 * - 'input' - The data passed to `.parse` and `.validate` functions. Defaults to this.
 * - 'output' - (use `'representation'` to get the data format you are
 * passing to the user) The data passed to `.data` function to return to the
 * user.
 * - 'representation' - The data after `toRepresentation`, usually, use this over 'output'
 * - 'internal' - The data after it's transformed for the `toSave` callback.
 * - 'validate' - The data for `toValidate` callback.
 */
export type Infer<
  TSchema extends Schema<any, any>,
  /**
   * - 'input' - The data passed to `.parse` and `.validate` functions.
   * - 'output' - (use `'representation'` to get the data format you are
   * passing to the user) The data passed to `.data` function to return to the
   * user.
   * - 'representation' - The data after `toRepresentation`, usually, use this over 'output'
   * - 'internal' - The data after it's transformed for the `toSave` callback.
   * - 'validate' - The data for `toValidate` callback.
   */
  TType extends 'input' | 'output' | 'representation' | 'internal' | 'validate' = 'input'
> =
  TSchema extends Schema<
    {
      input: infer TInput;
      internal: infer TInternal;
      output: infer TOutput;
      representation: infer TRepresentation;
      validate: infer TValidate;
    },
    any
  >
    ? TType extends 'output'
      ? TOutput
      : TType extends 'representation'
        ? TRepresentation
        : TType extends 'internal'
          ? TInternal
          : TType extends 'validate'
            ? TValidate
            : TInput
    : never;
