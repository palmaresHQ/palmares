import SchemaAdapter from '../adapter';
import FieldAdapter from '../adapter/fields';
import { ErrorCodes } from '../adapter/types';
import { formatErrorFromParseMethod, parseErrorsFactory } from '../utils';
import { DefinitionsOfSchemaType, OnlyFieldAdaptersFromSchemaAdapter, ValidationFallbackType } from './types';

export default class Schema<
  TType extends {
    input: any;
    validate: any;
    internal: any;
    output: any;
    representation: any;
  } = {
    input: any;
    validate: any;
    internal: any;
    output: any;
    representation: any;
  },
  TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
> {
  protected __adapter!: TDefinitions['schemaAdapter'];
  protected __highPriorityFallbacks: ((
    value: any,
    path: (string | number)[],
    options: Parameters<Schema['_transformToAdapter']>[0]
  ) => Promise<{
    parsed: any;
    errors: {
      isValid: boolean;
      code: ErrorCodes;
      message: string;
      path: (string | number)[];
    }[];
    shouldPreventLowPriorityFallbacks: boolean;
  }>)[] = [];

  /**
   * Fallback means that the schema validator library is not able to validate everything so it's pretty much letting the handling of the validation on Palmares side and NOT on the
   * schema validator side
   */
  protected __fallbacks: ((
    value: any,
    path: (string | number)[],
    options: Parameters<Schema['_transformToAdapter']>[0]
  ) => Promise<{
    parsed: any;
    errors: {
      isValid: boolean;
      code: ErrorCodes;
      message: string;
      path: (string | number)[];
    }[];
  }>)[] = [];
  __validationSchema!: any;
  __refinements: {
    callback: (value: TType['input']) => Promise<boolean | { isValid: boolean; message: string }>;
    isAsync: boolean;
  }[] = [];
  __nullable: {
    message: string;
    allow: boolean;
  } = {
    message: 'Cannot be null',
    allow: false,
  };
  __optional: {
    message: string;
    allow: boolean;
  } = {
    message: 'Required',
    allow: false,
  };
  __defaultFunction: (() => Promise<TType['input'] | TType['output']>) | undefined = undefined;
  __toRepresentation: ((value: TType['output']) => TType['output']) | undefined = undefined;
  __toValidate: ((value: TType['input']) => TType['validate']) | undefined = undefined;
  __toInternal: ((value: TType['validate']) => TType['internal']) | undefined = undefined;
  __instanceSymbol = Symbol();

  /**
   * This will validate the data with the fallbacks, so internally, without relaying on the schema adapter. This is nice because we can support things that the schema adapter is not able to support by default.
   *
   * @param errorsAsHashedSet - The errors as a hashed set. This is used to prevent duplicate errors.
   * @param path - The path of the error.
   * @param parseResult - The result of the parse method.
   */
  private async __validateByFallbacks(
    errorsAsHashedSet: Set<string>,
    path: ValidationFallbackType['errors'][number]['path'],
    parseResult: {
      errors: undefined | ValidationFallbackType['errors'];
      parsed: TType['input'];
    },
    options: Parameters<Schema['_transformToAdapter']>[0] = {}
  ) {
    for (const fallback of this.__fallbacks) {
      const { parsed, errors } = await fallback(parseResult.parsed, path, options);
      parseResult.parsed = parsed;

      for (const error of errors) {
        if (error.isValid === false) {
          const hashedError = JSON.stringify(error);
          if (errorsAsHashedSet.has(hashedError)) continue;
          if (!Array.isArray(parseResult.errors)) parseResult.errors = [];
          parseResult.errors.push(error);
        }
      }
    }

    return parseResult;
  }

  /**
   * This will validate by the adapter. In other words, we send the data to the schema adapter and then we validate that data.
   * So understand that, first we send the data to the adapter, the adapter validates it, then, after we validate from the adapter
   * we validate with the fallbacks so we can do all of the extra validations not handled by the adapter.
   *
   * @param value - The value to be validated.
   * @param errorsAsHashedSet - The errors as a hashed set. This is used to prevent duplicate errors on the validator.
   * @param path - The path of the error so we can construct an object with the nested paths of the error.
   * @param parseResult - The result of the parse method.
   *
   * @returns The result and the errors of the parse method.
   */
  private async __validateByAdapter(
    value: TType['input'],
    errorsAsHashedSet: Set<string>,
    path: NonNullable<Parameters<Schema['_parse']>[1]>,
    parseResult: Awaited<ReturnType<Schema['_parse']>>,
    options: Parameters<Schema['_transformToAdapter']>[0]
  ) {
    const transformedSchema = await this._transformToAdapter(options);

    const schemaAdapterFieldType = this.constructor.name
      .replace('Schema', '')
      .toLowerCase() as OnlyFieldAdaptersFromSchemaAdapter;

    const adapterParseResult = await this.__adapter[schemaAdapterFieldType].parse(
      this.__adapter,
      transformedSchema,
      value
    );
    parseResult.parsed = adapterParseResult.parsed;
    if (adapterParseResult.errors) {
      if (Array.isArray(adapterParseResult.errors))
        parseResult.errors = await Promise.all(
          adapterParseResult.errors.map(async (error) =>
            formatErrorFromParseMethod(this.__adapter, error, path, errorsAsHashedSet)
          )
        );
      else
        parseResult.errors = [
          await formatErrorFromParseMethod(this.__adapter, parseResult.errors, path, errorsAsHashedSet),
        ];
    }

    return parseResult;
  }

  async validate(value: TType['input']): Promise<boolean> {
    return this.__validationSchema.validate(value);
  }

  async _transformToAdapter(_options: {
    toInternalToBubbleUp?: (() => Promise<void>)[];
  }): Promise<ReturnType<FieldAdapter['translate']>> {
    throw new Error('Not implemented');
  }

  async _parse(
    value: TType['input'],
    path: ValidationFallbackType['errors'][number]['path'] = [],
    options: Parameters<Schema['_transformToAdapter']>[0]
  ): Promise<{ errors?: any[]; parsed: TType['internal'] }> {
    const errorsAsHashedSet = new Set<string>();
    const shouldCallDefaultFunction = value === undefined && typeof this.__defaultFunction === 'function';
    const shouldCallToValidateCallback = typeof this.__toValidate === 'function';

    if (shouldCallDefaultFunction) value = await (this.__defaultFunction as any)();
    if (shouldCallToValidateCallback) value = await Promise.resolve((this.__toValidate as any)(value));

    const parseResult: {
      errors: undefined | ValidationFallbackType['errors'];
      parsed: TType['input'];
    } = { errors: undefined, parsed: value };

    const parsedResultsAfterAdapter = await this.__validateByAdapter(
      value,
      errorsAsHashedSet,
      path,
      parseResult,
      options
    );
    parseResult.errors = parsedResultsAfterAdapter.errors;
    parseResult.parsed = parsedResultsAfterAdapter.parsed;

    const parsedResultsAfterFallbacks = await this.__validateByFallbacks(errorsAsHashedSet, path, parseResult);
    parseResult.errors = parsedResultsAfterFallbacks.errors;
    parseResult.parsed = parsedResultsAfterFallbacks.parsed;

    const doesNotHaveErrors = !Array.isArray(parseResult.errors) || parseResult.errors.length === 0;
    const hasToInternalCallback = typeof this.__toInternal === 'function';
    const shouldCallToInternalDuringParse =
      doesNotHaveErrors && hasToInternalCallback && Array.isArray(options.toInternalToBubbleUp) === false;

    if (shouldCallToInternalDuringParse) parseResult.parsed = await (this.__toInternal as any)(value);

    return parseResult;
  }

  async _transform(value: TType['output']): Promise<TType['representation']> {
    const shouldCallDefaultFunction = value === undefined && typeof this.__defaultFunction === 'function';
    if (shouldCallDefaultFunction) value = await this.__defaultFunction!();

    const hasToRepresentationCallback = typeof this.__toRepresentation === 'function';
    if (hasToRepresentationCallback) value = (await (this.__toRepresentation as any)(value)) as TType['representation'];
    return value;
  }
  /**
   * This let's you refine the schema with custom validations. This is useful when you want to validate something that is not supported by default by the schema adapter.
   *
   * @param refinementCallback - The callback that will be called to validate the value.
   * @param options - Options for the refinement.
   * @param options.isAsync - Whether the callback is async or not. Defaults to true.
   */
  refine<TRefinedType extends TType>(
    refinementCallback: (value: TType['input']) => Promise<boolean | { isValid: boolean; message: string }>,
    options?: {
      isAsync?: boolean;
    }
  ) {
    const isAsync = typeof options?.isAsync === 'boolean' ? options.isAsync : true;

    this.__refinements.push({
      callback: refinementCallback,
      isAsync,
    });
    return this as unknown as Schema<TRefinedType, TDefinitions>;
  }

  optional(options: NonNullable<Partial<Schema['__optional']>> = {}) {
    const message = typeof options.message === 'string' ? options.message : 'Required';
    const allow = typeof options.allow === 'boolean' ? options.allow : true;

    this.__optional = {
      message,
      allow,
    };

    return this as unknown as Schema<
      {
        input: TType['input'] | undefined | null;
        validate: TType['validate'] | undefined | null;
        internal: TType['internal'] | undefined | null;
        output: TType['output'] | undefined | null;
        representation: TType['representation'] | undefined | null;
      },
      TDefinitions
    >;
  }

  nullable(options: NonNullable<Partial<Schema['__nullable']>> = {}) {
    const message = typeof options.message === 'string' ? options.message : 'Cannot be null';
    const allow = typeof options.allow === 'boolean' ? options.allow : true;

    this.__nullable = {
      message,
      allow,
    };

    return this as unknown as Schema<
      {
        input: TType['input'] | undefined | null;
        validate: TType['validate'] | undefined | null;
        internal: TType['internal'] | undefined | null;
        output: TType['output'] | undefined | null;
        representation: TType['representation'] | undefined | null;
      },
      TDefinitions
    >;
  }

  default<TDefaultValue extends TType['input'] | (() => Promise<TType['input']>)>(
    defaultValueOrFunction: TDefaultValue
  ) {
    const isFunction = typeof defaultValueOrFunction === 'function';
    if (isFunction) this.__defaultFunction = defaultValueOrFunction;
    else this.__defaultFunction = async () => defaultValueOrFunction;

    return this as unknown as Schema<
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'];
        representation: TType['representation'];
      },
      TDefinitions
    >;
  }

  toRepresentation<TRepresentation>(
    toRepresentationCallback: (value: TType['representation']) => Promise<TRepresentation>
  ) {
    this.__toRepresentation = toRepresentationCallback;

    return this as unknown as Schema<
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'];
        representation: TRepresentation;
      },
      TDefinitions
    >;
  }

  toInternal<TInternal>(toInternalCallback: (value: TType['validate']) => Promise<TInternal>) {
    this.__toInternal = toInternalCallback;

    return this as unknown as Schema<
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TInternal;
        output: TType['output'];
        representation: TType['representation'];
      },
      TDefinitions
    >;
  }

  /**
   * Called before the validation of the schema. Let's say that you want to validate a date that might receive a string, you can convert that string to a date
   * here BEFORE the validation. This pretty much transforms the value to a type that the schema adapter can understand.
   *
   * @param toValidateCallback - The callback that will be called to validate the value.
   */
  toValidate<TValidate>(toValidateCallback: (value: TType['input']) => Promise<TValidate> | TValidate) {
    this.__toValidate = toValidateCallback;

    return this as unknown as Schema<
      {
        input: TType['input'];
        validate: TValidate;
        internal: TType['internal'];
        output: TType['output'];
        representation: TType['representation'];
      },
      TDefinitions
    >;
  }

  static new<TType extends { input: any; output: any; internal: any; representation: any; validate: any }>(
    _args?: any
  ): Schema<TType> {
    return new Schema<TType>();
  }
}
