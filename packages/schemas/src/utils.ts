import SchemaAdapter from './adapter';
import FieldAdapter from './adapter/fields';
import {
  NumberAdapterTranslateArgs,
  NumberAdapterTranslateArgsWithoutNonTranslateArgs,
  ObjectAdapterTranslateArgsWithoutNonTranslateArgs,
  UnionAdapterTranslateArgsWithoutNonTranslateArgs,
  ValidationDataBasedOnType,
} from './adapter/types';
import Schema from './schema/schema';
import { ValidationFallbackCallbackReturnType, ValidationFallbackReturnType } from './schema/types';
import { FallbackFunctionsType, MaybePromise } from './types';
import { checkType, nullable, optional } from './validators/schema';
import Validator from './validators/utils';

/**
 * The usage of this is that imagine that the library doesn't support a specific feature that we support on our schema definition, it can return an instance
 * of this class and with this instance we are able to fallback to our default implementation of the schema validation.
 */
export default class WithFallback {
  fallbackFor: Set<keyof Omit<NumberAdapterTranslateArgs, 'withFallbackFactory'>>;
  transformedSchema: any;
  adapterType: 'number' | 'object' | 'union' | 'string';

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
export async function defaultTransform<TType extends WithFallback['adapterType']>(
  type: TType,
  schema: Schema,
  adapter: SchemaAdapter,
  fieldAdapter: FieldAdapter | undefined,
  getValidationData: (isStringVersion: boolean) => MaybePromise<ValidationDataBasedOnType<TType>>,
  fallbackFunctions: FallbackFunctionsType<ReturnType<typeof getValidationData>>,
  options: {
    /**
     * If the schema is not supported by the adapter, this means, that the adapter hasn't defined an adapter for that field type, we can fallback to a custom implementation.
     * The problem is that, for example: Unions,
     *
     * Let's say we have a schema like this: ObjectSchema.new({ age: UnionSchema.new([NumberSchema.new(), StringSchema.new()] )});
     *
     * The root object will be validated by the adapter so what we need to do is create two schemas on the root object, one where the
     * value of `age` key is a number and another where the value of `age` key is a string. Now the root object has two schemas memoized on __transformedSchemas, nice,
     * what's the logic on that case? The ObjectSchema shouldn't take care of that logic. So the Union schema takes control of validating through the adapter. Is adapter 1 without errors?
     * If yes, return the result, if not, try the second adapter. If the second adapter is without errors, return the result, if not, return the errors.
     *
     * In other words, the `fallbackIfNotSupported` function on Unions should return the two schemas saved on it on that case, that way the root ObjectSchema will
     * create those two schemas on the array.
     */
    fallbackIfNotSupported?: () => ReturnType<Schema['_transformToAdapter']>;
  } & Pick<Parameters<Schema['_transformToAdapter']>[0], 'shouldAddStringVersion'>
): Promise<any[]> {
  const validationData = await Promise.resolve(getValidationData(false));
  const validationDataForStringVersion = (
    options.shouldAddStringVersion ? await getValidationData(true) : undefined
  ) as ValidationDataBasedOnType<TType>;
  const schemaWithPrivateFields = schema as unknown as {
    __transformedSchemas: Schema['__transformedSchemas'];
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

  const hasFallbacks = schemaWithPrivateFields.__rootFallbacksValidator instanceof Validator;
  if (hasFallbacks) {
    Validator.createAndAppendFallback(schema, optional(schemaWithPrivateFields.__optional));
    Validator.createAndAppendFallback(schema, nullable(schemaWithPrivateFields.__nullable));
    Validator.createAndAppendFallback(schema, checkType(schemaWithPrivateFields.__type));
  }

  if (options.fallbackIfNotSupported !== undefined && fieldAdapter === undefined) {
    const existingFallbacks = Object.keys(fallbackFunctions) as Parameters<WithFallback['fallbackFor']['add']>[0][];
    for (const fallback of existingFallbacks) checkIfShouldAppendFallbackAndAppend(fallback);
    return options.fallbackIfNotSupported();
  }
  if (!fieldAdapter) throw new Error('The field adapter is not supported and no fallback was provided.');

  const translatedSchemaOrWithFallback = (await Promise.resolve(
    fieldAdapter.translate(adapter.field, {
      withFallback: withFallbackFactory(type),
      ...validationData,
    })
  )) as any | WithFallback;

  let stringVersion = '';
  if (options.shouldAddStringVersion)
    stringVersion = await fieldAdapter.toString(adapter, adapter.field, validationDataForStringVersion);

  if (translatedSchemaOrWithFallback instanceof WithFallback) {
    for (const fallback of translatedSchemaOrWithFallback.fallbackFor) checkIfShouldAppendFallbackAndAppend(fallback);
    return [
      {
        transformed: translatedSchemaOrWithFallback.transformedSchema,
        asString: stringVersion,
      },
    ];
  }

  return [
    {
      transformed: translatedSchemaOrWithFallback,
      asString: stringVersion,
    },
  ];
}

/**
 * This function is used to transform the schema to the adapter. By default it caches the transformed schemas on the schema instance. So on subsequent validations we don't need
 * to transform to the schema again.
 */
export async function defaultTransformToAdapter(
  callback: (adapter: SchemaAdapter) => ReturnType<FieldAdapter['translate']>,
  transformedSchemas: Schema['__transformedSchemas'],
  options: Parameters<Schema['_transformToAdapter']>[0],
  type: string
) {
  const schemaAdapterNameToUse = options.schemaAdapter?.constructor?.name || Object.keys(transformedSchemas)[0];
  const isACustomSchemaAdapterAndNotYetDefined =
    transformedSchemas[schemaAdapterNameToUse] === undefined && options.schemaAdapter !== undefined;

  if (isACustomSchemaAdapterAndNotYetDefined)
    transformedSchemas[schemaAdapterNameToUse] = {
      transformed: false,
      adapter: options.schemaAdapter as SchemaAdapter,
      schemas: [],
    };

  const shouldTranslate = transformedSchemas[schemaAdapterNameToUse].transformed === false || options.force === true;

  if (shouldTranslate) {
    const translatedSchemas = await callback(transformedSchemas[schemaAdapterNameToUse].adapter);
    transformedSchemas[schemaAdapterNameToUse].schemas = translatedSchemas;
    transformedSchemas[schemaAdapterNameToUse].transformed = true;
  }
  transformedSchemas[schemaAdapterNameToUse].transformed = true;

  return transformedSchemas[schemaAdapterNameToUse].schemas;
}

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