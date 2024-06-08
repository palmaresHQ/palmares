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
  // Those functions will assume control of the validation process on adapters, instead of the schema. Why this is used? The idea is that the Schema has NO idea
  // that one of it's children might be an UnionSchema for example. The adapter might not support unions, so then we give control to the union. The parent schema
  // Will already have an array of translated adapter schemas. This means for a union with Number and String it'll generate two schemas, one for number and one for the value as String.
  // Of course this gets multiplied. So if we have a union with Number and String. We should take those two schemas from the array and validate them individually. This logic is
  // handled by the union schema. If we have an intersection type for example, instead of validating One schema OR the other, we validate one schema AND the other. This will be handled
  // by the schema that contains that intersection logic.
  __beforeValidationCallbacks: Map<
    string,
    (
      adapterToUse: SchemaAdapter,
      fieldAdapter: FieldAdapter,
      schema: Schema<any, any> & {
        __validateByAdapter: Schema<any, any>['__validateByAdapter'];
      },
      translatedSchemas: any[],
      value: TType['input'],
      path: ValidationFallbackCallbackReturnType['errors'][number]['path'],
      options: Parameters<Schema['_transformToAdapter']>[0]
    ) => ReturnType<Schema['__validateByAdapter']>
  > = new Map();
  __rootFallbacksValidator!: Validator;
  __validationSchema!: any;
  __refinements: {
    callback: (value: any) => Promise<boolean | { isValid: boolean; message: string }>;
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
      transformed: boolean;
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
    path: ValidationFallbackCallbackReturnType['errors'][number]['path'],
    parseResult: {
      errors: undefined | ValidationFallbackCallbackReturnType['errors'];
      parsed: TType['input'];
    },
    options: Parameters<Schema['_transformToAdapter']>[0]
  ) {
    if (this.__rootFallbacksValidator)
      return this.__rootFallbacksValidator.validate(options.errorsAsHashedSet || new Set(), path, parseResult, options);

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
    adapter: SchemaAdapter,
    fieldAdapter: FieldAdapter,
    schema: any,
    value: TType['input'],
    path: NonNullable<Parameters<Schema['__parse']>[1]>,
    options: Parameters<Schema['_transformToAdapter']>[0]
  ) {
    const parseResult: Awaited<ReturnType<Schema['__parse']>> = {
      errors: [],
      parsed: value,
    };
    // On the next iteration we will reset the errors and the parsed value
    parseResult.errors = [];
    parseResult.parsed = value;

    if (fieldAdapter === undefined || typeof fieldAdapter.parse !== 'function') return parseResult;

    const adapterParseResult = await fieldAdapter.parse(adapter, schema.transformed, value);

    parseResult.parsed = adapterParseResult.parsed;

    if (adapterParseResult.errors) {
      if (Array.isArray(adapterParseResult.errors))
        parseResult.errors = await Promise.all(
          adapterParseResult.errors.map(async (error) =>
            formatErrorFromParseMethod(adapter, error, path, options.errorsAsHashedSet || new Set())
          )
        );
      else
        parseResult.errors = [
          await formatErrorFromParseMethod(adapter, parseResult.errors, path, options.errorsAsHashedSet || new Set()),
        ];
    }
    return parseResult;
  }

  async validate(value: TType['input']): Promise<boolean> {
    return this.__validationSchema.validate(value);
  }

  async _transformToAdapter(_options: {
    // force to transform
    force?: boolean;
    toInternalToBubbleUp?: (() => Promise<void>)[];
    schemaAdapter?: SchemaAdapter;
    errorsAsHashedSet?: Set<string>;
    shouldAddStringVersion?: boolean;
    appendFallbacksBeforeAdapterValidation?: (
      uniqueNameOfFallback: string,
      fallbackValidationBeforeAdapter: (
        adapterToUse: SchemaAdapter,
        fieldAdapter: FieldAdapter,
        schema: Omit<Schema<any, any>, '__validateByAdapter'> & {
          __validateByAdapter: Schema<any, any>['__validateByAdapter'];
        },
        translatedSchemas: any[],
        value: any,
        path: ValidationFallbackCallbackReturnType['errors'][number]['path'],
        options: Parameters<Schema['_transformToAdapter']>[0]
      ) => ReturnType<Schema['__validateByAdapter']>
    ) => void;
  }): Promise<
    {
      transformed: ReturnType<FieldAdapter['translate']>;
      asString: string;
    }[]
  > {
    throw new Error('Not implemented');
  }

  protected async __parse(
    value: TType['input'],
    path: ValidationFallbackCallbackReturnType['errors'][number]['path'] = [],
    options: Parameters<Schema['_transformToAdapter']>[0]
  ): Promise<{ errors: any[]; parsed: TType['internal'] }> {
    const shouldRunToInternalToBubbleUp = options.toInternalToBubbleUp === undefined;
    if (shouldRunToInternalToBubbleUp) options.toInternalToBubbleUp = [];
    if (options.errorsAsHashedSet instanceof Set === false) options.errorsAsHashedSet = new Set();

    const shouldCallDefaultFunction = value === undefined && typeof this.__defaultFunction === 'function';
    const shouldCallToValidateCallback = typeof this.__toValidate === 'function';
    const schemaAdapterFieldType = this.constructor.name
      .replace('Schema', '')
      .toLowerCase() as OnlyFieldAdaptersFromSchemaAdapter;

    if (shouldCallDefaultFunction) value = await (this.__defaultFunction as any)();
    if (shouldCallToValidateCallback) value = await Promise.resolve((this.__toValidate as any)(value));

    const parseResult: {
      errors: ValidationFallbackCallbackReturnType['errors'];
      parsed: TType['input'];
    } = { errors: [], parsed: value };

    if (options.appendFallbacksBeforeAdapterValidation === undefined)
      options.appendFallbacksBeforeAdapterValidation = (name, callback) => {
        this.__beforeValidationCallbacks.set(name, callback);
      };

    await this._transformToAdapter(options);

    const adapterToUse = options.schemaAdapter
      ? options.schemaAdapter
      : Object.values(this.__transformedSchemas)[0].adapter;

    // With this, the children takes control of validating by the adapter. For example on a union schema we want to validate all of the schemas and choose the one that has no errors.
    if (this.__beforeValidationCallbacks.size > 0) {
      for (const callback of this.__beforeValidationCallbacks.values()) {
        const parsedValuesAfterValidationCallbacks = await callback(
          adapterToUse,
          adapterToUse[schemaAdapterFieldType],
          this as Schema<any, any> & {
            __validateByAdapter: Schema<any, any>['__validateByAdapter'];
          },
          this.__transformedSchemas[adapterToUse.constructor.name].schemas,
          value,
          path,
          options
        );
        parseResult.parsed = parsedValuesAfterValidationCallbacks.parsed;
        parseResult.errors = parsedValuesAfterValidationCallbacks.errors;
      }
    } else {
      const parsedValuesAfterValidatingByAdapter = await this.__validateByAdapter(
        adapterToUse,
        adapterToUse[schemaAdapterFieldType],
        this.__transformedSchemas[adapterToUse.constructor.name].schemas[0],
        value,
        path,
        options
      );
      parseResult.parsed = parsedValuesAfterValidatingByAdapter.parsed;
      parseResult.errors = parsedValuesAfterValidatingByAdapter.errors;
    }
    const parsedResultsAfterFallbacks = await this.__validateByFallbacks(
      path,
      {
        errors: [],
        parsed: value,
      },
      options
    );

    parseResult.parsed = parsedResultsAfterFallbacks.parsed;
    parseResult.errors = (parseResult.errors || []).concat(parsedResultsAfterFallbacks.errors || []);

    const doesNotHaveErrors = !Array.isArray(parseResult.errors) || parseResult.errors.length === 0;
    const hasToInternalCallback = typeof this.__toInternal === 'function';
    const shouldCallToInternalDuringParse =
      doesNotHaveErrors && hasToInternalCallback && Array.isArray(options.toInternalToBubbleUp) === false;
    const hasNoErrors = parseResult.errors === undefined || (parseResult.errors || []).length === 0;

    if (shouldCallToInternalDuringParse && hasNoErrors) parseResult.parsed = await (this.__toInternal as any)(value);
    if (shouldRunToInternalToBubbleUp && hasNoErrors)
      for (const functionToModifyResult of options.toInternalToBubbleUp || []) await functionToModifyResult();
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
    > & { is: never };
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
        input: TType['input'] | null;
        validate: TType['validate'] | null;
        internal: TType['internal'] | null;
        output: TType['output'] | null;
        representation: TType['representation'] | null;
      },
      TDefinitions
    > & { is: never };
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

  /**
   * Used to transform the given schema on a stringfied version of the adapter.
   */
  async compile(adapter: SchemaAdapter) {
    const data = await this._transformToAdapter({
      shouldAddStringVersion: true,
      force: true,
    });

    const stringVersions = data.map((value) => value.asString);
    return stringVersions;
  }

  static new<TType extends { input: any; output: any; internal: any; representation: any; validate: any }>(
    ..._args: any[]
  ): Schema<TType> {
    const result = new Schema<TType>();

    const adapterInstance = getDefaultAdapter();
    result.__transformedSchemas[adapterInstance.constructor.name] = {
      transformed: false,
      adapter: adapterInstance,
      schemas: [],
    };

    return result;
  }
}

export const schema = Schema.new;
