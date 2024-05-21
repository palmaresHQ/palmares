import SchemaAdapter from '../adapter';
import FieldAdapter from '../adapter/fields';
import { getDefaultAdapter } from '../conf';
import { formatErrorFromParseMethod } from '../utils';
import Validator from '../validators/utils';
import {
  DefinitionsOfSchemaType,
  OnlyFieldAdaptersFromSchemaAdapter,
  ValidationFallbackCallbackReturnType,
} from './types';

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
  __types!: {
    input: TType['input'];
    output: TType['output'];
    validate: TType['validate'];
    internal: TType['internal'];
    representation: TType['representation'];
  };
  __rootFallbacksValidator!: Validator;
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
  __transformedSchemas: Record<
    string,
    {
      adapter: TDefinitions['schemaAdapter'];
      schemas: any[]; // This is the transformed schemas
    }
  > = {};
  __defaultFunction: (() => Promise<TType['input'] | TType['output']>) | undefined = undefined;
  __toRepresentation: ((value: TType['output']) => TType['output']) | undefined = undefined;
  __toValidate: ((value: TType['input']) => TType['validate']) | undefined = undefined;
  __toInternal: ((value: TType['validate']) => TType['internal']) | undefined = undefined;
  __type: {
    message: string;
    check: (value: TType['input']) => boolean;
  } = {
    message: 'Invalid type',
    check: () => true,
  };

  /**
   * This will validate the data with the fallbacks, so internally, without relaying on the schema adapter. This is nice because we can support things that the schema adapter is not able to support by default.
   *
   * @param errorsAsHashedSet - The errors as a hashed set. This is used to prevent duplicate errors.
   * @param path - The path of the error.
   * @param parseResult - The result of the parse method.
   */
  private async __validateByFallbacks(
    errorsAsHashedSet: Set<string>,
    path: ValidationFallbackCallbackReturnType['errors'][number]['path'],
    parseResult: {
      errors: undefined | ValidationFallbackCallbackReturnType['errors'];
      parsed: TType['input'];
    },
    options: Parameters<Schema['_transformToAdapter']>[0]
  ) {
    if (this.__rootFallbacksValidator)
      return this.__rootFallbacksValidator.validate(errorsAsHashedSet, path, parseResult, options);

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
    path: NonNullable<Parameters<Schema['__parse']>[1]>,
    parseResult: Awaited<ReturnType<Schema['__parse']>>,
    options: Parameters<Schema['_transformToAdapter']>[0]
  ) {
    await this._transformToAdapter(options);
    const defaultAdapterName = Object.keys(this.__transformedSchemas)?.[0];
    const adapter = this.__transformedSchemas[defaultAdapterName].adapter;
    const transformedSchema = this.__transformedSchemas[defaultAdapterName].schemas[0];

    const partialParseResult: Awaited<ReturnType<Schema['__parse']>> = {
      errors: [],
      parsed: value,
    };
    // On the next iteration we will reset the errors and the parsed value
    partialParseResult.errors = [];
    partialParseResult.parsed = value;

    const schemaAdapterFieldType = this.constructor.name
      .replace('Schema', '')
      .toLowerCase() as OnlyFieldAdaptersFromSchemaAdapter;
    if (typeof adapter[schemaAdapterFieldType]?.parse !== 'function') return parseResult;

    const adapterParseResult = await (adapter[schemaAdapterFieldType].parse as NonNullable<FieldAdapter['parse']>)(
      adapter,
      transformedSchema,
      value
    );

    partialParseResult.parsed = adapterParseResult.parsed;

    if (adapterParseResult.errors) {
      if (Array.isArray(adapterParseResult.errors))
        partialParseResult.errors = await Promise.all(
          adapterParseResult.errors.map(async (error) =>
            formatErrorFromParseMethod(adapter, error, path, errorsAsHashedSet)
          )
        );
      else
        partialParseResult.errors = [
          await formatErrorFromParseMethod(adapter, partialParseResult.errors, path, errorsAsHashedSet),
        ];
    }

    parseResult.errors =
      parseResult.errors?.concat(partialParseResult.errors) || (partialParseResult.errors?.length || 0) > 0
        ? partialParseResult.errors
        : undefined;
    parseResult.parsed = partialParseResult.parsed;
    return parseResult;
  }

  async validate(value: TType['input']): Promise<boolean> {
    return this.__validationSchema.validate(value);
  }

  async _transformToAdapter(_options: {
    toInternalToBubbleUp?: (() => Promise<void>)[];
    schemaAdapter?: SchemaAdapter;
    fallbacksBeforeAdapterValidation?: Record<string, () => Promise<void>>;
  }): Promise<ReturnType<FieldAdapter['translate']>> {
    throw new Error('Not implemented');
  }

  protected async __parse(
    value: TType['input'],
    path: ValidationFallbackCallbackReturnType['errors'][number]['path'] = [],
    options: Parameters<Schema['_transformToAdapter']>[0]
  ): Promise<{ errors?: any[]; parsed: TType['internal'] }> {
    const errorsAsHashedSet = new Set<string>();
    const shouldCallDefaultFunction = value === undefined && typeof this.__defaultFunction === 'function';
    const shouldCallToValidateCallback = typeof this.__toValidate === 'function';

    if (shouldCallDefaultFunction) value = await (this.__defaultFunction as any)();
    if (shouldCallToValidateCallback) value = await Promise.resolve((this.__toValidate as any)(value));

    const parseResult: {
      errors: undefined | ValidationFallbackCallbackReturnType['errors'];
      parsed: TType['input'];
    } = { errors: undefined, parsed: value };

    if (options.fallbacksBeforeAdapterValidation === undefined) options.fallbacksBeforeAdapterValidation = {};
    await this._transformToAdapter(options);
    let parsedResultsAfterAdapter = await this.__validateByAdapter(
      value,
      errorsAsHashedSet,
      path,
      { parsed: parseResult.parsed, errors: [] },
      options
    );

    const parsedResultsAfterFallbacks = await this.__validateByFallbacks(
      errorsAsHashedSet,
      path,
      {
        errors: parseResult.errors,
        parsed: value,
      },
      options
    );
    parseResult.parsed = parsedResultsAfterFallbacks.parsed;

    // Validating the adapter twice is needed because of unions, we will only enter that condition if we are validating a union.
    // Pretty much the idea is that we change the schema, after changing the schema we need to validate with the adapters again.
    /*if (shouldValidateByAdapterAgain) {
      parsedResultsAfterAdapter = await this.__validateByAdapter(
        value,
        errorsAsHashedSet,
        path,
        { parsed: parseResult.parsed, errors: [] },
        options
      );
      parseResult.parsed = parsedResultsAfterAdapter.parsed;
    }*/

    parseResult.errors = [...(parsedResultsAfterAdapter.errors || []), ...(parsedResultsAfterFallbacks.errors || [])];

    const areErrorsEmpty = Array.isArray(parseResult.errors) && parseResult.errors.length === 0;
    if (areErrorsEmpty) parseResult.errors = undefined;

    const doesNotHaveErrors = !Array.isArray(parseResult.errors) || parseResult.errors.length === 0;
    const hasToInternalCallback = typeof this.__toInternal === 'function';
    const shouldCallToInternalDuringParse =
      doesNotHaveErrors && hasToInternalCallback && Array.isArray(options.toInternalToBubbleUp) === false;
    const hasNoErrors = parseResult.errors === undefined || (parseResult.errors || []).length === 0;

    if (shouldCallToInternalDuringParse && hasNoErrors) parseResult.parsed = await (this.__toInternal as any)(value);

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

  async parse(value: TType['input']): Promise<{ errors?: any[]; parsed: TType['internal'] }> {
    return this.__parse(value, [], {});
  }

  instanceOf(args: Schema['__type']) {
    this.__type.check = typeof args.check === 'function' ? args.check : this.__type.check;
    this.__type.message = typeof args.message === 'string' ? args.message : this.__type.message;

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
    const result = new Schema<TType>();

    const adapterInstance = getDefaultAdapter();
    result.__transformedSchemas[adapterInstance.constructor.name] = {
      adapter: adapterInstance,
      schemas: [],
    };

    return result;
  }
}
