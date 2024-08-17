import SchemaAdapter from './adapter';
import { getDefaultAdapter } from './conf';
import { checkType, nullable, optional } from './validators/schema';
import Validator from './validators/utils';

import type FieldAdapter from './adapter/fields';
import type { ValidationDataBasedOnType } from './adapter/types';
import type Schema from './schema/schema';
import type { ValidationFallbackCallbackReturnType, ValidationFallbackReturnType } from './schema/types';
import type { FallbackFunctionsType, SupportedSchemas } from './types';

/**
 * The usage of this is that imagine that the library doesn't support a specific feature that we support on
 * our schema definition, it can return an instance of this class and with this instance we are able to
 * fallback to our default implementation of the schema validation.
 */
export default class WithFallback<TType extends SupportedSchemas> {
  fallbackFor: Set<
    | keyof Omit<ValidationDataBasedOnType<TType>, 'withFallback' | 'parsers'>
    | keyof ValidationDataBasedOnType<TType>['parsers']
  >;
  transformedSchema: any;
  adapterType: TType;

  constructor(
    adapterType: TType,
    fallbackFor: (
      | keyof Omit<ValidationDataBasedOnType<TType>, 'withFallback' | 'parsers'>
      | keyof ValidationDataBasedOnType<TType>['parsers']
    )[],
    transformedSchema: any
  ) {
    this.adapterType = adapterType;
    this.fallbackFor = new Set<
      | keyof Omit<ValidationDataBasedOnType<TType>, 'withFallback' | 'parsers'>
      | keyof ValidationDataBasedOnType<TType>['parsers']
    >(fallbackFor as any);
    this.transformedSchema = transformedSchema;
  }
}

/**
 * Factory function for creating a new instance of WithFallback. We call that function when parsing the
 * schema adapter, and then, inside of the adapter the user will can the inner function to create a new
 * instance of WithFallback.
 *
 * @param adapterType - The type of the adapter that we are using.
 *
 * @returns - A currying function that will create a new instance of WithFallback.
 */
export function withFallbackFactory<TType extends SupportedSchemas>(adapterType: TType) {
  return (
    fallbackFor: (
      | keyof Omit<ValidationDataBasedOnType<TType>, 'withFallback' | 'parsers'>
      | keyof ValidationDataBasedOnType<TType>['parsers']
    )[],
    transformedSchema: WithFallback<SupportedSchemas>['transformedSchema']
  ) => new WithFallback<TType>(adapterType, fallbackFor, transformedSchema);
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
 * The default transform function that we use for the schema adapters. This function tries to abstract away
 * the complexity of translating the schema to the adapter.
 *
 * So first things first, WHAT IS a fallback? A fallback is a function that we call when the user defines a
 * validation that is not supported by the adapter. For example, imagine that for some reason the adapter
 * doesn't support the `max` validation, we can define a fallback for that validation and then, when the
 * user defines that validation, we call the fallback function. So, even if the adapter doesn't support that
 * validation our schema will still be able to validate that.
 *
 * @param type - The type of the adapter that we are using, can be a number, an object, all of the possible
 * schema adapters.
 * @param schema - The schema that we are translating.
 * @param validationData - The data that we are using to validate the schema. This means for example, the
 * `max` validation, the `min` validation, etc. The message of the validation when it is not valid, etc.
 * @param fallbackFunctions - The fallback functions that we are using to validate the schema. Those are
 * the functions we fallback to when the user defines a validation that is not supported by the adapter.
 *
 * @returns - The translated schema for something that the adapter is able to understand.
 */
export async function defaultTransform<TType extends SupportedSchemas>(
  type: TType,
  schema: Schema<any, any>,
  adapter: SchemaAdapter,
  fieldAdapter: FieldAdapter | undefined,
  getValidationData: (isStringVersion: boolean) => ValidationDataBasedOnType<TType>,
  fallbackFunctions: FallbackFunctionsType<Omit<Awaited<ReturnType<typeof getValidationData>>, 'parsers'>>,
  options: {
    validatorsIfFallbackOrNotSupported?: ValidationFallbackReturnType | ValidationFallbackReturnType[];
    /**
     * If the schema is not supported by the adapter, this means, that the adapter hasn't defined an adapter
     * for that field type, we can fallback to a custom implementation.
     * The problem is that, for example: Unions,
     *
     * Let's say we have a schema like this:
     * ObjectSchema.new({ age: UnionSchema.new([NumberSchema.new(), StringSchema.new()] )});
     *
     * The root object will be validated by the adapter so what we need to do is create two schemas on the
     * root object, one where the value of `age` key is a number and another where the value of `age` key is
     * a string. Now the root object has two schemas memoized on __transformedSchemas, nice, what's the logic
     * on that case? The ObjectSchema shouldn't take care of that logic. So the Union schema takes control of
     * validating through the adapter. Is adapter 1 without errors? If yes, return the result, if not, try
     * the second adapter. If the second adapter is without errors, return the result, if not, return the
     * errors.
     *
     * In other words, the `fallbackIfNotSupported` function on Unions should return the two schemas saved on
     * it on that case, that way the root ObjectSchema will create those two schemas on the array.
     */
    fallbackIfNotSupported?: () => ReturnType<Schema['__transformToAdapter']>;
  } & Pick<Parameters<Schema['__transformToAdapter']>[0], 'shouldAddStringVersion'>
): Promise<any[]> {
  const validationData = await Promise.resolve(getValidationData(false));

  const validationDataForStringVersion = (
    options.shouldAddStringVersion ? await Promise.resolve(getValidationData(true)) : undefined
  ) as ValidationDataBasedOnType<TType>;
  const schemaWithPrivateFields = schema as unknown as {
    __transformedSchemas: Schema['__transformedSchemas'];
    __rootFallbacksValidator: Schema['__rootFallbacksValidator'];
    __optional: Schema['__optional'];
    __nullable: Schema['__nullable'];
    __type: Schema['__type'];
    __parsers: Schema['__parsers'];
    __extends: Schema['__extends'];
  };

  const checkIfShouldUseParserAndAppend = (
    parser: Parameters<WithFallback<SupportedSchemas>['fallbackFor']['add']>[0]
  ) => {
    const isValidationDataAParser = (validationData as any).parsers?.[parser] !== undefined;
    if (isValidationDataAParser)
      (
        schema as unknown as {
          __parsers: Schema['__parsers'];
        }
      ).__parsers._fallbacks.add(parser);
  };

  const getExtendedOrNotSchemaAndString = (schema: any, toStringVersion: string) => {
    const extendedOrNotSchema =
      typeof schemaWithPrivateFields.__extends?.callback === 'function'
        ? schemaWithPrivateFields.__extends.callback(schema)
        : schema;
    const extendedOrNotSchemaString =
      typeof schemaWithPrivateFields.__extends?.toStringCallback === 'function'
        ? schemaWithPrivateFields.__extends.toStringCallback(toStringVersion)
        : toStringVersion;
    return [extendedOrNotSchema, extendedOrNotSchemaString];
  };

  const checkIfShouldAppendFallbackAndAppend = (
    fallback: Parameters<WithFallback<SupportedSchemas>['fallbackFor']['add']>[0]
  ) => {
    const wereArgumentsForThatFallbackDefinedAndFallbackFunctionDefined =
      (validationData as any)[fallback] !== undefined && (fallbackFunctions as any)[fallback] !== undefined;

    if (wereArgumentsForThatFallbackDefinedAndFallbackFunctionDefined) {
      const fallbackReturnType = (fallbackFunctions as any)[fallback](
        (validationData as any)[fallback]
      ) as ValidationFallbackReturnType;
      Validator.createAndAppendFallback(schema, fallbackReturnType);
    }
  };

  const appendRootFallback = () => {
    if (options.validatorsIfFallbackOrNotSupported) {
      const validatorsIfFallbackOrNotSupported = Array.isArray(options.validatorsIfFallbackOrNotSupported)
        ? options.validatorsIfFallbackOrNotSupported
        : [options.validatorsIfFallbackOrNotSupported];

      for (const fallback of validatorsIfFallbackOrNotSupported) Validator.createAndAppendFallback(schema, fallback);
    }
  };

  const appendRequiredFallbacks = () => {
    const hasFallbacks = schemaWithPrivateFields.__rootFallbacksValidator instanceof Validator;
    if (hasFallbacks) {
      Validator.createAndAppendFallback(schema, optional(schemaWithPrivateFields.__optional));
      Validator.createAndAppendFallback(schema, nullable(schemaWithPrivateFields.__nullable));
      Validator.createAndAppendFallback(schema, checkType(schemaWithPrivateFields.__type));
    }
  };

  const isFieldAdapterNotSupportedForThatFieldType = fieldAdapter === undefined;

  if (options.fallbackIfNotSupported !== undefined && isFieldAdapterNotSupportedForThatFieldType) {
    const existingFallbacks = Object.keys(fallbackFunctions) as Parameters<
      WithFallback<SupportedSchemas>['fallbackFor']['add']
    >[0][];
    const allParsers = Object.keys(validationData['parsers']) as Parameters<
      WithFallback<SupportedSchemas>['fallbackFor']['add']
    >[0][];

    appendRootFallback();

    for (const fallback of existingFallbacks) checkIfShouldAppendFallbackAndAppend(fallback);
    for (const parser of allParsers) checkIfShouldUseParserAndAppend(parser);
    appendRequiredFallbacks();

    return options.fallbackIfNotSupported();
  }
  if (!fieldAdapter) throw new Error('The field adapter is not supported and no fallback was provided.');

  const translatedSchemaOrWithFallback = await Promise.resolve(
    fieldAdapter.translate(adapter.field, {
      withFallback: withFallbackFactory<SupportedSchemas>(type),
      ...validationData
    })
  );

  let stringVersion = '';
  if (options.shouldAddStringVersion)
    stringVersion = await fieldAdapter.toString(adapter, adapter.field, validationDataForStringVersion);

  if (translatedSchemaOrWithFallback instanceof WithFallback) {
    appendRootFallback();
    for (const fallback of translatedSchemaOrWithFallback.fallbackFor) {
      checkIfShouldAppendFallbackAndAppend(fallback);
      checkIfShouldUseParserAndAppend(fallback);
    }

    const [extendedOrNotSchema, extendedOrNotSchemaString] = getExtendedOrNotSchemaAndString(
      translatedSchemaOrWithFallback.transformedSchema,
      stringVersion
    );
    appendRequiredFallbacks();

    return [
      {
        transformed: extendedOrNotSchema,
        asString: extendedOrNotSchemaString
      }
    ];
  }

  const [extendedOrNotSchema, extendedOrNotSchemaString] = getExtendedOrNotSchemaAndString(
    translatedSchemaOrWithFallback,
    stringVersion
  );

  return [
    {
      transformed: extendedOrNotSchema,
      asString: extendedOrNotSchemaString
    }
  ];
}

/**
 * This function is used to transform the schema to the adapter. By default it caches the transformed schemas on
 * the schema instance. So on subsequent validations we don't need to transform to the schema again.
 */
export async function defaultTransformToAdapter(
  callback: (adapter: SchemaAdapter) => ReturnType<FieldAdapter['translate']>,
  schema: Schema<any, any>,
  transformedSchemas: Schema['__transformedSchemas'],
  options: Parameters<Schema['__transformToAdapter']>[0],
  type: string
) {
  const isTransformedSchemasEmpty = Object.keys(transformedSchemas).length <= 0;
  if (isTransformedSchemasEmpty) {
    const adapterInstanceToUse =
      options.schemaAdapter instanceof SchemaAdapter ? options.schemaAdapter : getDefaultAdapter();
    schema['__transformedSchemas'][adapterInstanceToUse.constructor.name] = {
      transformed: false,
      adapter: adapterInstanceToUse,
      schemas: []
    };
  }

  const schemaAdapterNameToUse = options.schemaAdapter?.constructor.name || Object.keys(transformedSchemas)[0];
  const isACustomSchemaAdapterAndNotYetDefined =
    // eslint-disable-next-line ts/no-unnecessary-condition
    transformedSchemas[schemaAdapterNameToUse] === undefined && options.schemaAdapter !== undefined;

  if (isACustomSchemaAdapterAndNotYetDefined)
    transformedSchemas[schemaAdapterNameToUse] = {
      transformed: false,
      adapter: options.schemaAdapter as SchemaAdapter,
      schemas: []
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
  fieldAdapter: FieldAdapter,
  error: any,
  received: any,
  schema: any,
  path: ValidationFallbackCallbackReturnType['errors'][number]['path'],
  errorsAsHashedSet: Set<string>
) {
  const formattedError = await fieldAdapter.formatError(adapter, adapter.field, schema, error);
  formattedError.path = Array.isArray(formattedError.path) ? [...path, ...formattedError.path] : path;

  const formattedErrorAsParseResultError =
    formattedError as unknown as ValidationFallbackCallbackReturnType['errors'][number];
  formattedErrorAsParseResultError.isValid = false;
  const sortedError = Object.fromEntries(
    Object.entries(formattedErrorAsParseResultError).sort(([a], [b]) => a.localeCompare(b))
  );
  const hashedError = JSON.stringify(sortedError);
  errorsAsHashedSet.add(JSON.stringify(sortedError));
  formattedErrorAsParseResultError.received = received;
  return formattedErrorAsParseResultError;
}

/**
 * Transform the schema and check if we should add a fallback validation for that schema. This is used for complex
 * schemas like Objects, arrays, unions, etc.
 */
export async function transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas(
  schema: Schema,
  options: Parameters<Schema['__transformToAdapter']>[0]
) {
  const schemaWithProtected = schema as Schema & {
    __runBeforeParseAndData: Schema['__runBeforeParseAndData'];
    __toInternal: Schema['__toInternal'];
    __toValidate: Schema['__toValidate'];
    __toRepresentation: Schema['__toRepresentation'];
    __defaultFunction: Schema['__defaultFunction'];
    __rootFallbacksValidator: Schema['__rootFallbacksValidator'];
    __transformToAdapter: Schema['__transformToAdapter'];
    __parsers: Schema['__parsers'];
  };

  // This should come first because we will get the fallbacks of the field here.
  const transformedData = await schemaWithProtected.__transformToAdapter(options);

  // eslint-disable-next-line ts/no-unnecessary-condition
  const doesKeyHaveFallback = schemaWithProtected.__rootFallbacksValidator !== undefined;
  const doesKeyHaveToInternal = typeof schemaWithProtected.__toInternal === 'function';
  const doesKeyHaveToValidate = typeof schemaWithProtected.__toValidate === 'function';
  const doesKeyHaveToDefault = typeof schemaWithProtected.__defaultFunction === 'function';
  const doesKeyHaveRunBeforeParseAndData = typeof schemaWithProtected.__runBeforeParseAndData === 'function';
  const doesKeyHaveParserFallback = schemaWithProtected.__parsers._fallbacks.size > 0;
  const shouldAddFallbackValidation =
    doesKeyHaveFallback ||
    doesKeyHaveToInternal ||
    doesKeyHaveToValidate ||
    doesKeyHaveToDefault ||
    doesKeyHaveParserFallback ||
    doesKeyHaveRunBeforeParseAndData ||
    // eslint-disable-next-line ts/no-unnecessary-condition
    transformedData === undefined;

  return [transformedData, shouldAddFallbackValidation] as const;
}
