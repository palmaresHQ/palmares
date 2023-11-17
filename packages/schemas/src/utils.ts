import SchemaAdapter from './adapter';
import {
  NonToTranslateArgs,
  NumberAdapterTranslateArgs,
  NumberAdapterTranslateArgsWithoutNonTranslateArgs,
  ObjectAdapterTranslateArgs,
  ObjectAdapterTranslateArgsWithoutNonTranslateArgs,
} from './adapter/types';
import Schema from './schema/schema';
import { FallbackFunctionsType } from './types';

/**
 * The usage of this is that imagine that the library doesn't support a specific feature that we support on our schema definition, it can return an instance
 * of this class and with this instance we are able to fallback to our default implementation of the schema validation.
 */
export default class WithFallback {
  fallbackFor: Set<keyof Omit<NumberAdapterTranslateArgs, 'withFallbackFactory'>>;
  transformedSchema: any;
  adapterType: 'number' | 'object';

  constructor(
    adapterType: 'number' | 'object',
    fallbackFor: (keyof Omit<NumberAdapterTranslateArgs, 'withFallbackFactory'>)[],
    transformedSchema: any
  ) {
    this.adapterType = adapterType;
    this.fallbackFor = new Set<keyof Omit<NumberAdapterTranslateArgs, 'withFallbackFactory'>>(fallbackFor as any);
    this.transformedSchema = transformedSchema;
  }
}

/**
 * Factory function for creating a new instance of WithFallback. We call that function when parsing the schema adapter, and then, inside of the adapter the user will can the inner function
 * to create a new instance of WithFallback.
 *
 * @param adapterType - The type of the adapter that we are using.
 *
 * @returns - A currying function that will create a new instance of WithFallback.
 */
export function withFallbackFactory(adapterType: WithFallback['adapterType']) {
  return (
    fallbackFor: (keyof Omit<NumberAdapterTranslateArgs, 'withFallbackFactory'>)[],
    transformedSchema: WithFallback['transformedSchema']
  ) => new WithFallback(adapterType, fallbackFor, transformedSchema);
}

export function parseErrorsFactory(schemaAdapter: SchemaAdapter) {
  return async (
    errorOrErrors: any | any[],
    metadata?: any
  ): Promise<Awaited<ReturnType<SchemaAdapter['formatError']>>[]> => {
    const errorsIsAnArray = Array.isArray(errorOrErrors);
    if (errorsIsAnArray)
      return Promise.all(errorOrErrors.map((error) => schemaAdapter.formatError.bind(schemaAdapter)(error, metadata)));
    return [await schemaAdapter.formatError.bind(schemaAdapter)(errorOrErrors, metadata)];
  };
}

/**
 * The default transform function that we use for the schema adapters. This function tries to abstract away the complexity of translating the schema to the adapter.
 *
 * So first things first, WHAT IS a fallback? A fallback is a function that we call when the user defines a validation that is not supported by the adapter. For example, imagine that
 * for some reason the adapter doesn't support the `max` validation, we can define a fallback for that validation and then, when the user defines that validation, we call the fallback
 * function. So, even if the adapter doesn't support that validation our schema will still be able to validate that.
 *
 * @param type - The type of the adapter that we are using, can be a number, an object, all of the possible schema adapters.
 * @param schema - The schema that we are translating.
 * @param validationData - The data that we are using to validate the schema. This means for example, the `max` validation, the `min` validation, etc. The message of the validation when
 * it is not valid, etc.
 * @param fallbackFunctions - The fallback functions that we are using to validate the schema. Those are the functions we fallback to when the user defines a validation that is not
 * supported by the adapter.
 *
 * @returns - The translated schema for something that the adapter is able to understand.
 */
export function defaultTransform<TType extends WithFallback['adapterType']>(
  type: TType,
  schema: Schema,
  validationData: TType extends 'number'
    ? NumberAdapterTranslateArgsWithoutNonTranslateArgs
    : ObjectAdapterTranslateArgsWithoutNonTranslateArgs,
  fallbackFunctions: FallbackFunctionsType<typeof validationData>
): Promise<any> {
  const schemaWithPrivateFields = schema as unknown as {
    __adapter: Schema['__adapter'];
    __fallback: Schema['__fallback'];
  };
  if (schemaWithPrivateFields.__adapter[type].__result === undefined) {
    const translatedSchemaOrWithFallback = schemaWithPrivateFields.__adapter.number.translate(
      schemaWithPrivateFields.__adapter.field,
      {
        withFallback: withFallbackFactory(type),
        ...validationData,
      } as any
    );

    if (translatedSchemaOrWithFallback instanceof WithFallback) {
      schemaWithPrivateFields.__adapter[type].__result = translatedSchemaOrWithFallback.transformedSchema;
      for (const fallback of translatedSchemaOrWithFallback.fallbackFor) {
        const wereArgumentsForThatFallbackDefinedAndFallbackFunctionDefined =
          (validationData as any)[fallback] !== undefined && (fallbackFunctions as any)[fallback] !== undefined;
        if (wereArgumentsForThatFallbackDefinedAndFallbackFunctionDefined)
          schemaWithPrivateFields.__fallback.push(
            (fallbackFunctions as any)[fallback]((validationData as any)[fallback])
          );
      }
    } else schemaWithPrivateFields.__adapter[type].__result = translatedSchemaOrWithFallback;
  }
  return schemaWithPrivateFields.__adapter[type].__result;
}

/**
 * The
 */
export async function formatErrorFromParseMethod(
  adapter: SchemaAdapter,
  error: any,
  path: string[],
  errorsAsHashedSet: Set<string>
) {
  const formattedError = await adapter.formatError(error);
  formattedError.path = Array.isArray(formattedError.path) ? [...path, ...formattedError.path] : path;
  const formattedErrorAsParseResultError = formattedError as unknown as Awaited<
    ReturnType<Schema['__fallback'][number]>
  >[number];
  formattedErrorAsParseResultError.isValid = false;
  errorsAsHashedSet.add(JSON.stringify(formattedErrorAsParseResultError));
  return formattedErrorAsParseResultError;
}
