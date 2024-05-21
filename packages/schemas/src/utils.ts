import SchemaAdapter from './adapter';
import FieldAdapter from './adapter/fields';
import {
  NumberAdapterTranslateArgs,
  NumberAdapterTranslateArgsWithoutNonTranslateArgs,
  ObjectAdapterTranslateArgsWithoutNonTranslateArgs,
  UnionAdapterTranslateArgsWithoutNonTranslateArgs,
} from './adapter/types';
import Schema from './schema/schema';
import { ValidationFallbackCallbackReturnType, ValidationFallbackReturnType } from './schema/types';
import { FallbackFunctionsType } from './types';
import { checkType, nullable, optional } from './validators/schema';
import Validator from './validators/utils';

/**
 * The usage of this is that imagine that the library doesn't support a specific feature that we support on our schema definition, it can return an instance
 * of this class and with this instance we are able to fallback to our default implementation of the schema validation.
 */
export default class WithFallback {
  fallbackFor: Set<keyof Omit<NumberAdapterTranslateArgs, 'withFallbackFactory'>>;
  transformedSchema: any;
  adapterType: 'number' | 'object' | 'union';

  constructor(
    adapterType: WithFallback['adapterType'],
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
    : TType extends 'union'
    ? UnionAdapterTranslateArgsWithoutNonTranslateArgs
    : ObjectAdapterTranslateArgsWithoutNonTranslateArgs,
  fallbackFunctions: FallbackFunctionsType<typeof validationData>,
  options: {
    force?: boolean;
    /** Let's say we support unions but the library used as adapter does not support that, we should fallback to another translated schema on that case. */
    fallbackTranslatedSchema?: any;
  }
): any[] {
  const schemaWithPrivateFields = schema as unknown as {
    __adapters: Schema['__adapters'];
    __rootFallbacksValidator: Schema['__rootFallbacksValidator'];
    __optional: Schema['__optional'];
    __nullable: Schema['__nullable'];
    __type: Schema['__type'];
  };

  const checkIfShouldAppendFallbackAndAppend = (fallback: Parameters<WithFallback['fallbackFor']['add']>[0]) => {
    const wereArgumentsForThatFallbackDefinedAndFallbackFunctionDefined =
      (validationData as any)[fallback] !== undefined && (fallbackFunctions as any)[fallback] !== undefined;
    if (wereArgumentsForThatFallbackDefinedAndFallbackFunctionDefined) {
      const fallbackReturnType = (fallbackFunctions as any)[fallback](
        (validationData as any)[fallback]
      ) as ValidationFallbackReturnType;
      Validator.createAndAppendFallback(schema, fallbackReturnType);
    }
  };

  let adapters = schemaWithPrivateFields.__adapters;
  const translatedSchemas = getTranslatedSchemasFromAdapters(adapters, type);

  for (let i = 0; i < adapters.length; i++) {
    const adapter = adapters[i];
    let translatedSchema = translatedSchemas[i];
    if (translatedSchema === undefined || options.force) {
      // Translate the schema to the adapter schema if there is an adapter for that schema type.
      const adapterOfThatType = adapter[type] as FieldAdapter;

      const translatedSchemaOrWithFallback = adapterOfThatType?.translate(adapter.field, {
        withFallback: withFallbackFactory(type),
        ...validationData,
      } as any);

      if (translatedSchemaOrWithFallback instanceof WithFallback) {
        adapterOfThatType.__result = translatedSchemaOrWithFallback.transformedSchema;
        for (const fallback of translatedSchemaOrWithFallback.fallbackFor)
          checkIfShouldAppendFallbackAndAppend(fallback);
      } else if (translatedSchemaOrWithFallback === undefined) {
        // On that case the adapter doesn't support that schema type, so we should fallback to the default implementation.
        const existingFallbacks = Object.keys(fallbackFunctions) as Parameters<WithFallback['fallbackFor']['add']>[0][];
        for (const fallback of existingFallbacks) checkIfShouldAppendFallbackAndAppend(fallback);
        if (options.fallbackTranslatedSchema !== undefined)
          adapterOfThatType.__result = options.fallbackTranslatedSchema;
      } else adapterOfThatType.__result = translatedSchemaOrWithFallback;
      translatedSchema = adapterOfThatType.__result;

      const hasFallbacks = schemaWithPrivateFields.__rootFallbacksValidator instanceof Validator;
      if (hasFallbacks) {
        Validator.createAndAppendFallback(schema, optional(schemaWithPrivateFields.__optional));
        Validator.createAndAppendFallback(schema, nullable(schemaWithPrivateFields.__nullable));
        Validator.createAndAppendFallback(schema, checkType(schemaWithPrivateFields.__type));
      }
    }
    translatedSchemas.push(translatedSchema);
  }

  return translatedSchemas;
}

export function getTranslatedSchemasFromAdapters(adapters: SchemaAdapter[], type: WithFallback['adapterType']): any[] {}

/**
 * The
 */
export async function formatErrorFromParseMethod(
  adapter: SchemaAdapter,
  error: any,
  path: ValidationFallbackCallbackReturnType['errors'][number]['path'],
  errorsAsHashedSet: Set<string>
) {
  const formattedError = await adapter.formatError(error);
  formattedError.path = Array.isArray(formattedError.path) ? [...path, ...formattedError.path] : path;
  const formattedErrorAsParseResultError =
    formattedError as unknown as ValidationFallbackCallbackReturnType['errors'][number];
  formattedErrorAsParseResultError.isValid = false;
  errorsAsHashedSet.add(JSON.stringify(formattedErrorAsParseResultError));
  return formattedErrorAsParseResultError;
}

/**
 * Transform the schema and check if we should add a fallback validation for that schema. This is used for complex schemas like Objects, arrays, unions, etc.
 */
export async function transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas(
  schema: Schema,
  options: Parameters<Schema['_transformToAdapter']>[0]
) {
  const schemaWithProtected = schema as Schema & {
    __toInternal: Schema['__toInternal'];
    __toValidate: Schema['__toValidate'];
    __toRepresentation: Schema['__toRepresentation'];
    __defaultFunction: Schema['__defaultFunction'];
    __rootFallbacksValidator: Schema['__rootFallbacksValidator'];
  };

  const transformedData = await schemaWithProtected._transformToAdapter(options); // This should come first because we will get the fallbacks of the field here.

  const doesKeyHaveFallback = schemaWithProtected.__rootFallbacksValidator !== undefined;
  const doesKeyHaveToInternal = typeof schemaWithProtected.__toInternal === 'function';
  const doesKeyHaveToValidate = typeof schemaWithProtected.__toValidate === 'function';
  const doesKeyHaveToDefault = typeof schemaWithProtected.__defaultFunction === 'function';
  const shouldAddFallbackValidation =
    doesKeyHaveFallback ||
    doesKeyHaveToInternal ||
    doesKeyHaveToValidate ||
    doesKeyHaveToDefault ||
    transformedData === undefined;

  return [transformedData, shouldAddFallbackValidation] as const;
}
