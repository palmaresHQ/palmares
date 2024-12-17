import { getDefaultAdapter } from '../conf';
import { formatErrorFromParseMethod } from '../utils';

import type {
  DefinitionsOfSchemaType,
  OnlyFieldAdaptersFromSchemaAdapter,
  ValidationFallbackCallbackReturnType
} from './types';
import type { SchemaAdapter } from '../adapter';
import type { FieldAdapter } from '../adapter/fields';
import type { ValidationDataBasedOnType } from '../adapter/types';
import type { Validator } from '../validators/utils';

export class Schema<
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
  TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType
> {
  protected $$type = '$PSchema';
  protected fieldType = 'schema';
  // Those functions will assume control of the validation process on adapters, instead of the schema.
  // Why this is used? The idea is that the Schema has NO idea
  // that one of it's children might be an UnionSchema for example. The adapter might not support unions,
  // so then we give control to the union. The parent schema will already have an array of translated
  // adapter schemas. This means for a union with Number and String it'll generate two schemas, one for number
  // and one for the value as String. Of course this gets multiplied. So if we have a union with Number and String.
  // We should take those two schemas from the array and validate them individually. This logic is
  // handled by the union schema. If we have an intersection type for example, instead of validating
  // One schema OR the other, we validate one schema AND the other. This will be handled
  // by the schema that contains that intersection logic.
  protected __beforeValidationCallbacks: Map<
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
      options: Parameters<Schema['__transformToAdapter']>[0]
    ) => ReturnType<Schema['__validateByAdapter']>
  > = new Map();

  protected __cachedGetParent?: () => Schema<any, any>;
  protected set __getParent(value: () => Schema<any, any>) {
    this.__cachedGetParent = value;
  }
  protected get __getParent(): (() => Schema<any, any>) | undefined {
    return this.__cachedGetParent;
  }

  protected __alreadyAppliedModel?: Promise<any>;
  protected __runBeforeParseAndData?: (self: any) => Promise<void>;
  protected __rootFallbacksValidator!: Validator;
  protected __saveCallback?: <TContext = any>(value: any, context: TContext) => Promise<any | void> | any | void;
  protected __modelOmitCallback?: () => void;
  protected __parsers: Record<
    'high' | 'medium' | 'low',
    Map<
      string,
      (value: any) =>
        | {
            value: any;
            preventNextParsers: boolean;
          }
        | Promise<{
            value: any;
            preventNextParsers: boolean;
          }>
    >
  > & { _fallbacks: Set<string> } = {
    high: new Map(),
    medium: new Map(),
    low: new Map(),
    _fallbacks: new Set()
  };
  protected __refinements: ((
    value: any
  ) =>
    | Promise<void | undefined | { code: string; message: string }>
    | void
    | undefined
    | { code: string; message: string })[] = [];
  protected __nullable: {
    message: string;
    allow: boolean;
  } = {
    message: 'Cannot be null',
    allow: false
  };
  protected __optional: {
    message: string;
    allow: boolean;
  } = {
    message: 'Required',
    allow: false
  };
  protected __extends:
    | {
        callback: (schema: any) => any;
        toStringCallback?: (schemaAsString: string) => string;
      }
    | undefined = undefined;

  protected __transformedSchemas: Record<
    string,
    {
      transformed: boolean;
      adapter: TDefinitions['schemaAdapter'];
      schemas: any[]; // This is the transformed schemas
    }
  > = {};
  protected __defaultFunction: (() => Promise<TType['input'] | TType['output']>) | undefined = undefined;
  protected __toRepresentation: ((value: TType['output']) => TType['output']) | undefined = undefined;
  protected __toValidate: ((value: TType['input']) => TType['validate']) | undefined = undefined;
  protected __toInternal: ((value: TType['validate']) => TType['internal']) | undefined = undefined;
  protected __type: {
    message: string;
    check: (value: TType['input']) => boolean;
  } = {
    message: 'Invalid type',
    check: () => true
  };

  protected __getDefaultTransformedSchemas() {
    const adapterInstance = getDefaultAdapter();

    // eslint-disable-next-line ts/no-unnecessary-condition
    if (this.__transformedSchemas[adapterInstance.constructor.name] === undefined)
      this.__transformedSchemas[adapterInstance.constructor.name] = {
        transformed: false,
        adapter: adapterInstance,
        schemas: []
      };
  }

  /**
   * This will validate the data with the fallbacks, so internally, without relaying on the schema adapter.
   * This is nice because we can support things that the schema adapter is not able to support by default.
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
    options: Parameters<Schema['__transformToAdapter']>[0]
  ) {
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (this.__rootFallbacksValidator)
      return this.__rootFallbacksValidator.validate(options.errorsAsHashedSet as Set<any>, path, parseResult, options);

    return parseResult;
  }

  /**
   * This will validate by the adapter. In other words, we send the data to the schema adapter and then we validate
   * that data.
   * So understand that, first we send the data to the adapter, the adapter validates it, then, after we validate
   * from the adapter we validate with the fallbacks so we can do all of the extra validations not handled by
   * the adapter.
   *
   * @param value - The value to be validated.
   * @param errorsAsHashedSet - The errors as a hashed set. This is used to prevent duplicate errors on the validator.
   * @param path - The path of the error so we can construct an object with the nested paths of the error.
   * @param parseResult - The result of the parse method.
   *
   * @returns The result and the errors of the parse method.
   */
  protected async __validateByAdapter(
    adapter: SchemaAdapter,
    fieldAdapter: FieldAdapter,
    schema: any,
    value: TType['input'],
    path: NonNullable<Parameters<Schema['__parse']>[1]>,
    options: Parameters<Schema['__transformToAdapter']>[0]
  ) {
    const parseResult: Awaited<ReturnType<Schema['__parse']>> = {
      errors: [],
      parsed: value
    };
    // On the next iteration we will reset the errors and the parsed value
    parseResult.errors = [];
    parseResult.parsed = value;

    // eslint-disable-next-line ts/no-unnecessary-condition
    if (fieldAdapter === undefined || typeof fieldAdapter.parse !== 'function') return parseResult;

    const adapterParseResult = await fieldAdapter.parse(
      adapter,
      adapter.field,
      schema.transformed,
      value,
      options.args
    );

    parseResult.parsed = adapterParseResult.parsed;

    if (adapterParseResult.errors) {
      if (Array.isArray(adapterParseResult.errors))
        parseResult.errors = await Promise.all(
          adapterParseResult.errors.map(async (error) =>
            formatErrorFromParseMethod(
              adapter,
              fieldAdapter,
              error,
              value,
              schema.transformed,
              path,
              options.errorsAsHashedSet || new Set()
            )
          )
        );
      else
        parseResult.errors = [
          await formatErrorFromParseMethod(
            adapter,
            fieldAdapter,
            parseResult.errors,
            value,
            schema.transformed,
            path,
            options.errorsAsHashedSet || new Set()
          )
        ];
    }
    parseResult.errors = parseResult.errors.filter((error) => typeof error !== 'undefined');
    return parseResult;
  }

  // eslint-disable-next-line ts/require-await
  protected async __transformToAdapter(_options: {
    // force to transform
    args: Omit<ValidationDataBasedOnType<any>, 'withFallback'>;
    force?: boolean;
    toInternalToBubbleUp?: (() => Promise<void>)[];
    schemaAdapter?: SchemaAdapter;
    errorsAsHashedSet?: Set<string>;
    shouldAddStringVersion?: boolean;
    context?: any;
    appendFallbacksBeforeAdapterValidation?: (
      schema: Schema<any, any>,
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
        options: Parameters<Schema['__transformToAdapter']>[0]
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

  /** */
  protected async __parsersToTransformValue(value: any, parsersToUse?: Set<string>) {
    let shouldStop = false;

    for (const [parserName, parser] of this.__parsers.high.entries()) {
      if (parsersToUse instanceof Set === false || parsersToUse.has(parserName)) {
        const result = await Promise.resolve(parser(value));
        if (result.preventNextParsers) shouldStop = true;
        value = result.value;
      } else continue;
    }
    if (shouldStop === false) {
      for (const [parserName, parser] of this.__parsers.medium.entries()) {
        if (parsersToUse instanceof Set === false || parsersToUse.has(parserName)) {
          const result = await Promise.resolve(parser(value));
          if (result.preventNextParsers) shouldStop = true;
          value = result.value;
        } else continue;
      }
    }
    if (shouldStop === false) {
      for (const [parserName, parser] of this.__parsers.low.entries()) {
        if (parsersToUse instanceof Set === false || parsersToUse.has(parserName)) {
          const result = await Promise.resolve(parser(value));
          if (result.preventNextParsers) shouldStop = true;
          value = result.value;
        } else continue;
      }
    }

    return value;
  }

  protected async __parse(
    value: TType['input'],
    path: ValidationFallbackCallbackReturnType['errors'][number]['path'] = [],
    options: Parameters<Schema['__transformToAdapter']>[0]
  ): Promise<{ errors: any[]; parsed: TType['internal'] }> {
    this.__getDefaultTransformedSchemas();
    if (typeof this.__runBeforeParseAndData === 'function') await this.__runBeforeParseAndData(this);

    // This is used to run the toInternal command. If we didn't do this, we would need to parse through all of
    // the schemas to run the toInternal command, from the leafs (ObjectSchemas) to the root schema. This is not
    // a good idea, so what we do is that during validation the leafs attach a function to the
    // options.toInternalToBubbleUp like
    // `options.toInternalToBubbleUp.push(async () => (value[key] = await (schema as any).__toInternal(parsed)));``
    // This way, when the root schema finishes the validation, it will run all of the functions in the
    // toInternalToBubbleUp array, modifying the parsed value.
    const shouldRunToInternalToBubbleUp = options.toInternalToBubbleUp === undefined;
    if (shouldRunToInternalToBubbleUp) options.toInternalToBubbleUp = [];
    if (options.errorsAsHashedSet instanceof Set === false) options.errorsAsHashedSet = new Set();

    const shouldCallDefaultFunction = value === undefined && typeof this.__defaultFunction === 'function';
    const shouldCallToValidateCallback = typeof this.__toValidate === 'function';
    const schemaAdapterFieldType = this.fieldType;

    if (shouldCallDefaultFunction) value = await (this.__defaultFunction as any)();
    if (shouldCallToValidateCallback) value = await Promise.resolve((this.__toValidate as any)(value));

    const parseResult: {
      errors: ValidationFallbackCallbackReturnType['errors'];
      parsed: TType['input'];
    } = { errors: [], parsed: value };
    value = await this.__parsersToTransformValue(value, this.__parsers._fallbacks);

    if (options.appendFallbacksBeforeAdapterValidation === undefined)
      options.appendFallbacksBeforeAdapterValidation = (schema, name, callback) => {
        // We just need this if the union adapter is net defined but the parent is not of the same type.
        // For example, it's a union child of o object schema
        if (this !== schema) this.__beforeValidationCallbacks.set(name, callback);
      };

    if (
      this.__transformedSchemas[options.schemaAdapter?.constructor.name || getDefaultAdapter().constructor.name]
        .transformed === false
    )
      await this.__transformToAdapter(options);

    const adapterToUse = options.schemaAdapter
      ? options.schemaAdapter
      : Object.values(this.__transformedSchemas)[0].adapter;

    const parsedResultsAfterFallbacks = await this.__validateByFallbacks(
      path,
      {
        errors: parseResult.errors,
        parsed: value
      },
      options
    );

    parseResult.parsed = parsedResultsAfterFallbacks.parsed;
    // eslint-disable-next-line ts/no-unnecessary-condition
    parseResult.errors = (parseResult.errors || []).concat(parsedResultsAfterFallbacks.errors || []);
    // With this, the children takes control of validating by the adapter. For example on a union schema we
    // want to validate all of the schemas and choose the one that has no errors.
    if (this.__beforeValidationCallbacks.size > 0) {
      for (const callback of this.__beforeValidationCallbacks.values()) {
        const parsedValuesAfterValidationCallbacks = await callback(
          adapterToUse,
          (adapterToUse as any)[schemaAdapterFieldType],
          this as any,
          this.__transformedSchemas[adapterToUse.constructor.name].schemas,
          value,
          path,
          options
        );
        parseResult.parsed = parsedValuesAfterValidationCallbacks.parsed;

        parseResult.errors =
          Array.isArray(parseResult.errors) && Array.isArray(parsedValuesAfterValidationCallbacks.errors)
            ? [...parseResult.errors, ...parsedValuesAfterValidationCallbacks.errors]
            : Array.isArray(parseResult.errors)
              ? parseResult.errors
              : parsedValuesAfterValidationCallbacks.errors;
      }
    } else {
      const parsedValuesAfterValidatingByAdapter = await this.__validateByAdapter(
        adapterToUse,
        (adapterToUse as any)[schemaAdapterFieldType],
        this.__transformedSchemas[adapterToUse.constructor.name].schemas[0],
        value,
        path,
        options
      );

      parseResult.parsed = parsedValuesAfterValidatingByAdapter.parsed;
      // eslint-disable-next-line ts/no-unnecessary-condition
      parseResult.errors = (parseResult.errors || []).concat(parsedValuesAfterValidatingByAdapter.errors);
    }

    const hasToInternalCallback = typeof this.__toInternal === 'function';
    const shouldCallToInternalDuringParse =
      hasToInternalCallback &&
      (options.toInternalToBubbleUp?.length === 0 || Array.isArray(options.toInternalToBubbleUp) === false);
    // eslint-disable-next-line ts/no-unnecessary-condition
    const hasNoErrors = parseResult.errors === undefined || (parseResult.errors || []).length === 0;

    await Promise.all(
      this.__refinements.map(async (refinement) => {
        const errorOrNothing = await Promise.resolve(refinement(parseResult.parsed));

        if (typeof errorOrNothing === 'undefined') return;
        parseResult.errors.push({
          isValid: false,
          code: errorOrNothing.code as any,
          message: errorOrNothing.message,
          received: parseResult.parsed,
          path
        });
      })
    );

    if (shouldCallToInternalDuringParse && hasNoErrors) parseResult.parsed = await (this.__toInternal as any)(value);
    if (shouldRunToInternalToBubbleUp && hasNoErrors)
      for (const functionToModifyResult of options.toInternalToBubbleUp || []) await functionToModifyResult();

    return parseResult;
  }

  /**
   * This let's you refine the schema with custom validations. This is useful when you want to validate something
   * that is not supported by default by the schema adapter.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const numberSchema = p.number().refine((value) => {
   *   if (value < 0) return { code: 'invalid_number', message: 'The number should be greater than 0' };
   * });
   *
   * const { errors, parsed } = await numberSchema.parse(-1);
   *
   * console.log(errors);
   * // [{ isValid: false, code: 'invalid_number', message: 'The number should be greater than 0', path: [] }]
   * ```
   *
   * @param refinementCallback - The callback that will be called to validate the value.
   * @param options - Options for the refinement.
   * @param options.isAsync - Whether the callback is async or not. Defaults to true.
   */
  refine(
    refinementCallback: (
      value: TType['input']
    ) =>
      | Promise<void | undefined | { code: string; message: string }>
      | void
      | undefined
      | { code: string; message: string }
  ) {
    this.__refinements.push(refinementCallback);

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

  /**
   * Allows the value to be either undefined or null.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const numberSchema = p.number().optional();
   *
   * const { errors, parsed } = await numberSchema.parse(undefined);
   *
   * console.log(parsed); // undefined
   *
   * const { errors, parsed } = await numberSchema.parse(null);
   *
   * console.log(parsed); // null
   *
   * const { errors, parsed } = await numberSchema.parse(1);
   *
   * console.log(parsed); // 1
   * ```
   *
   * @returns - The schema we are working with.
   */
  optional(options?: { message?: string; allow?: false }) {
    this.__optional = {
      message: typeof options?.message === 'string' ? options.message : 'Required',
      allow: typeof options?.allow === 'boolean' ? options.allow : true
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

  /**
   * Allows the value to be null and ONLY null. You can also use this function to set a custom message when
   * the value is NULL by setting the { message: 'Your custom message', allow: false } on the options.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const numberSchema = p.number().nullable();
   *
   * const { errors, parsed } = await numberSchema.parse(null);
   *
   * console.log(parsed); // null
   *
   * const { errors, parsed } = await numberSchema.parse(undefined);
   *
   * console.log(errors); // [{ isValid: false, code: 'invalid_type', message: 'Invalid type', path: [] }]
   * ```
   *
   * @param options - The options for the nullable function.
   * @param options.message - The message to be shown when the value is not null. Defaults to 'Cannot be null'.
   * @param options.allow - Whether the value can be null or not. Defaults to true.
   *
   * @returns The schema.
   */
  nullable(options?: { message: string; allow: false }) {
    this.__nullable = {
      message: typeof options?.message === 'string' ? options.message : 'Cannot be null',
      allow: typeof options?.allow === 'boolean' ? options.allow : true
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
    >;
  }

  /**
   * Appends a custom schema to the schema, this way it will bypass the creation of the schema in runtime.
   *
   * By default when validating, on the first validation we create the schema. Just during the first validation.
   * With this function, you bypass that, so you can speed up the validation process.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   * import * as z from 'zod';
   *
   * const numberSchema = p.number().appendSchema(z.number());
   *
   * const { errors, parsed } = await numberSchema.parse(1);
   * ```
   *
   * @param schema - The schema to be appended.
   * @param args - The arguments for the schema.
   * @param args.adapter - The adapter to be used. If not provided, the default adapter will be used.
   *
   * @returns The same schema again.
   */
  appendSchema<TType extends any = any>(schema: TDefinitions['schemaAdapter'], args?: { adapter?: SchemaAdapter }) {
    const adapter = args?.adapter || getDefaultAdapter();

    this.__transformedSchemas[adapter.constructor.name] = {
      transformed: true,
      adapter: adapter,
      schemas: [schema]
    };

    return this as unknown as Schema<
      {
        input: TType;
        validate: TType;
        internal: TType;
        output: TType;
        representation: TType;
      },
      TDefinitions
    >;
  }

  /**
   * This method will remove the value from the representation of the schema. If the value is undefined it will keep
   * that way otherwise it will set the value to undefined after it's validated.
   * This is used in conjunction with the {@link data} function, the {@link parse} function or {@link validate}
   * function. This will remove the value from the representation of the schema.
   *
   * By default, the value will be removed just from the representation, in other words, when you call the {@link data}
   * function. But if you want to remove the value from the internal representation, you can pass the argument
   * `toInternal` as true. Then if you still want to remove the value from the representation, you will need to pass
   * the argument `toRepresentation` as true as well.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const userSchema = p.object({
   *   id: p.number().optional(),
   *   name: p.string(),
   *   password: p.string().omit()
   * });
   *
   * const user = await userSchema.data({
   *  id: 1,
   *  name: 'John Doe',
   *  password: '123456'
   * });
   *
   * console.log(user); // { id: 1, name: 'John Doe' }
   * ```
   *
   *
   * @param args - By default, the value will be removed just from the representation, in other words, when you call
   * the {@link data} function.
   * But if you want to remove the value from the internal representation, you can pass the argument `toInternal`
   * as true. Then if you still want to remove the value from the representation, you will need to pass the
   * argument `toRepresentation` as true as well.
   *
   * @returns The schema.
   */
  omit<
    TToInternal extends boolean,
    TToRepresentation extends boolean = boolean extends TToInternal ? true : false
  >(args?: { toInternal?: TToInternal; toRepresentation?: TToRepresentation }) {
    // To representation is true by default, unless to internal is true.
    const toRepresentation =
      typeof args?.toRepresentation === 'boolean' ? args.toRepresentation : typeof args?.toInternal !== 'boolean';
    const toInternal = typeof args?.toInternal === 'boolean' ? args.toInternal : false;

    if (toInternal) {
      if (this.__toInternal) {
        const toInternal = this.__toInternal;
        this.__toInternal = async (value) => {
          await toInternal(value);
          return undefined;
        };
        // eslint-disable-next-line ts/require-await
      } else this.__toInternal = async () => undefined;
    } else if (toRepresentation) {
      if (this.__toRepresentation) {
        const toRepresentation = this.__toRepresentation;
        this.__toRepresentation = async (value) => {
          await toRepresentation(value);
          return undefined;
        };
        // eslint-disable-next-line ts/require-await
      } else this.__toRepresentation = async () => undefined;
    }

    return this as unknown as Schema<
      {
        input: TToInternal extends true ? TType['input'] | undefined : TType['input'];
        validate: TToInternal extends true ? TType['validate'] | undefined : TType['validate'];
        internal: TToInternal extends true ? undefined : TType['internal'];
        output: TToRepresentation extends true ? TType['output'] | undefined : TType['output'];
        representation: TToRepresentation extends true ? undefined : TType['representation'];
      },
      TDefinitions
    >;
  }

  /**
   * This function is used in conjunction with the {@link validate} function. It's used to save a value to an external
   * source like a database. You should always return the schema after you save the value, that way we will always have
   * the correct type of the schema after the save operation.
   *
   * You can use the {@link toRepresentation} function to transform and clean the value it returns after the save.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * import { User } from './models';
   *
   * const userSchema = p.object({
   *   id: p.number().optional(),
   *   name: p.string(),
   *   email: p.string().email(),
   * }).onSave(async (value) => {
   *   // Create or update the user on the database using palmares models or any other library of your choice.
   *   if (value.id)
   *      await User.default.set(value, { search: { id: value.id } });
   *   else
   *      await User.default.set(value);
   *
   *   return value;
   * });
   *
   *
   * // Then, on your controller, do something like this:
   * const { isValid, save, errors } = await userSchema.validate(req.body);
   * if (isValid) {
   *    const savedValue = await save();
   *    return Response.json(savedValue, { status: 201 });
   * }
   *
   * return Response.json({ errors }, { status: 400 });
   * ```
   *
   * @param callback - The callback that will be called to save the value on an external source.
   *
   * @returns The schema.
   */
  onSave(
    callback: <TContext = any>(
      value: TType['internal'],
      context: TContext
    ) => Promise<TType['output']> | TType['output']
  ) {
    this.__saveCallback = callback;

    return this as unknown as Schema<
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'];
        representation: TType['representation'];
      },
      TDefinitions & {
        hasSave: true;
      }
    >;
  }

  /**
   * This function is used to validate the schema and save the value to the database. It is used in
   * conjunction with the {@link onSave} function.
   *
   * Different from other validation libraries, palmares schemas is aware that you want to save. On your
   * routes/functions we recommend to ALWAYS use this function instead of {@link parse} directly. This is because
   * this function by default will return an object with the property `save` or the `errors`. If the errors are present,
   * you can return the errors to the user. If the save property is present, you can use to save the value to an
   * external source. e.g. a database.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * import { User } from './models';
   *
   * const userSchema = p.object({
   *   id: p.number().optional(),
   *   name: p.string(),
   *   email: p.string().email(),
   * }).onSave(async (value) => {
   *   // Create or update the user on the database using palmares models or any other library of your choice.
   *   if (value.id)
   *      await User.default.set(value, { search: { id: value.id } });
   *   else
   *      await User.default.set(value);
   *
   *   return value;
   * });
   *
   *
   * // Then, on your controller, do something like this:
   * const { isValid, save, errors } = await userSchema.validate(req.body);
   * if (isValid) {
   *    const savedValue = await save();
   *    return Response.json(savedValue, { status: 201 });
   * }
   *
   * return Response.json({ errors }, { status: 400 });
   * ```
   *
   * @param value - The value to be validated.
   *
   * @returns An object with the property isValid, if the value is valid, the function `save` will be present.
   * If the value is invalid, the property errors will be present.
   */
  async validate(
    value: unknown,
    context: any
  ): Promise<
    | { isValid: false; errors: any[]; save: undefined }
    | { isValid: true; save: () => Promise<TType['representation']>; errors: undefined }
  > {
    const { errors, parsed } = await this.__parse(value, [], { context } as any);
    // eslint-disable-next-line ts/no-unnecessary-condition
    if ((errors || []).length > 0) return { isValid: false, errors: errors, save: undefined };
    return { isValid: true, save: async () => this._save.bind(this)(parsed, context), errors: undefined };
  }

  /**
   * Internal function, when we call the {@link validate} function it's this function that gets called
   * when the user uses the `save` function returned by the {@link validate} function if the value is valid.
   *
   * @param value - The value to be saved.
   *
   * @returns The value to representation.
   */
  protected async _save(value: TType['input'], context: any): Promise<TType['representation']> {
    if (this.__saveCallback) {
      const result = await this.__saveCallback(value, context);
      return this.data(result) as Promise<
        true extends TDefinitions['hasSave'] ? TType['representation'] : { errors?: any[]; parsed: TType['internal'] }
      >;
    }

    return this.data(value);
  }

  /**
   * This function is used to validate and parse the value to the internal representation of the schema.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const numberSchema = p.number().allowString();
   *
   * const { errors, parsed } = await numberSchema.parse('123');
   *
   * console.log(parsed); // 123
   * ```
   *
   * @param value - The value to be parsed.
   *
   * @returns The parsed value.
   */
  async parse(value: TType['input']): Promise<{ errors?: any[]; parsed: TType['internal'] }> {
    return this.__parse(value, [], {} as any);
  }

  /**
   * This function is used to transform the value to the representation without validating it.
   * This is useful when you want to return a data from a query directly to the user. But for example
   * you are returning the data of a user, you can clean the password or any other sensitive data.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const userSchema = p.object({
   *   id: p.number().optional(),
   *   name: p.string(),
   *   email: p.string().email(),
   *   password: p.string().optional()
   * }).toRepresentation(async (value) => {
   *   return {
   *    id: value.id,
   *    name: value.name,
   *   email: value.email
   *  }
   * });
   *
   * const user = await userSchema.data({
   *   id: 1,
   *   name: 'John Doe',
   *   email: 'john@gmail.com',
   *   password: '123456'
   * });
   * ```
   */
  async data(value: TType['output']): Promise<TType['representation']> {
    this.__getDefaultTransformedSchemas();
    if (typeof this.__runBeforeParseAndData === 'function') await this.__runBeforeParseAndData(this);
    value = await this.__parsersToTransformValue(value);

    if (this.__toRepresentation) value = await Promise.resolve(this.__toRepresentation(value));
    if (this.__defaultFunction && value === undefined) value = await Promise.resolve(this.__defaultFunction());
    return value;
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

  /**
   * This function is used to add a default value to the schema. If the value is either undefined or null,
   * the default value will be used.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const numberSchema = p.number().default(0);
   *
   * const { errors, parsed } = await numberSchema.parse(undefined);
   *
   * console.log(parsed); // 0
   * ```
   */
  default<TDefaultValue extends TType['input'] | (() => Promise<TType['input']>)>(
    defaultValueOrFunction: TDefaultValue
  ) {
    const isFunction = typeof defaultValueOrFunction === 'function';
    if (isFunction) this.__defaultFunction = defaultValueOrFunction;
    // eslint-disable-next-line ts/require-await
    else this.__defaultFunction = async () => defaultValueOrFunction;

    return this as unknown as Schema<
      {
        input: TType['input'] | undefined | null;
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'] | undefined | null;
        representation: TType['representation'];
      },
      TDefinitions
    >;
  }

  /**
   * This function let's you customize the schema your own way. After we translate the schema on the adapter we call
   * this function to let you customize the custom schema your own way. Our API does not support passthrough?
   * No problem, you can use this function to customize the zod schema.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const numberSchema = p.number().extends((schema) => {
   *   return schema.nonnegative();
   * });
   *
   * const { errors, parsed } = await numberSchema.parse(-1);
   *
   * console.log(errors);
   * // [{ isValid: false, code: 'nonnegative', message: 'The number should be nonnegative', path: [] }]
   * ```
   *
   * @param callback - The callback that will be called to customize the schema.
   * @param toStringCallback - The callback that will be called to transform the schema to a string when you want
   * to compile the underlying schema to a string so you can save it for future runs.
   *
   * @returns The schema.
   */
  extends(
    callback: (
      schema: Awaited<ReturnType<NonNullable<TDefinitions['schemaAdapter'][TDefinitions['schemaType']]>['translate']>>
    ) => Awaited<ReturnType<NonNullable<TDefinitions['schemaAdapter'][TDefinitions['schemaType']]>['translate']>>,
    toStringCallback?: (schemaAsString: string) => string
  ) {
    this.__extends = {
      callback,
      toStringCallback
    };
    return this;
  }

  /**
   * This function is used to transform the value to the representation of the schema. When using the {@link data}
   * function. With this function you have full control to add data cleaning for example, transforming the data
   * and whatever. Another use case is when you want to return deeply nested recursive data.
   * The schema maps to itself.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const recursiveSchema = p.object({
   *   id: p.number().optional(),
   *   name: p.string(),
   * }).toRepresentation(async (value) => {
   *    return {
   *      id: value.id,
   *      name: value.name,
   *      children: await Promise.all(value.children.map(async (child) => await recursiveSchema.data(child)))
   *    }
   * });
   *
   * const data = await recursiveSchema.data({
   *    id: 1,
   *    name: 'John Doe',
   * });
   * ```
   *
   * @example
   * ```
   * import * as p from '@palmares/schemas';
   *
   * const colorToRGBSchema = p.string().toRepresentation(async (value) => {
   *    switch (value) {
   *      case 'red': return { r: 255, g: 0, b: 0 };
   *      case 'green': return { r: 0, g: 255, b: 0 };
   *      case 'blue': return { r: 0, g: 0, b: 255 };
   *      default: return { r: 0, g: 0, b: 0 };
   *   }
   * });
   * ```
   * @param toRepresentationCallback - The callback that will be called to transform the value to the representation.
   * @param options - Options for the toRepresentation function.
   * @param options.after - Whether the toRepresentationCallback should be called after the existing
   * toRepresentationCallback. Defaults to true.
   * @param options.before - Whether the toRepresentationCallback should be called before the existing
   * toRepresentationCallback. Defaults to true.
   *
   * @returns The schema with a new return type
   */
  toRepresentation<TRepresentation>(
    toRepresentationCallback: (value: TType['representation']) => Promise<TRepresentation> | TRepresentation,
    options?: {
      after?: boolean;
      before?: boolean;
    }
  ) {
    if (this.__toRepresentation) {
      const before =
        typeof options?.before === 'boolean'
          ? options.before
          : typeof options?.after === 'boolean'
            ? !options.after
            : true;
      const existingToRepresentation = this.__toRepresentation;

      this.__toRepresentation = async (value) => {
        if (before) return toRepresentationCallback(await existingToRepresentation(value));
        else return existingToRepresentation(await toRepresentationCallback(value));
      };
    } else this.__toRepresentation = toRepresentationCallback;

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

  /**
   * This function is used to transform the value to the internal representation of the schema. This is useful
   * when you want to transform the value to a type that the schema adapter can understand. For example, you
   * might want to transform a string to a date. This is the function you use.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const dateSchema = p.string().toInternal((value) => {
   *   return new Date(value);
   * });
   *
   * const date = await dateSchema.parse('2021-01-01');
   *
   * console.log(date); // Date object
   *
   * const rgbToColorSchema = p.object({
   *   r: p.number().min(0).max(255),
   *   g: p.number().min(0).max(255),
   *   b: p.number().min(0).max(255),
   * }).toInternal(async (value) => {
   *    if (value.r === 255 && value.g === 0 && value.b === 0) return 'red';
   *    if (value.r === 0 && value.g === 255 && value.b === 0) return 'green';
   *    if (value.r === 0 && value.g === 0 && value.b === 255) return 'blue';
   *    return `rgb(${value.r}, ${value.g}, ${value.b})`;
   * });
   * ```
   *
   * @param toInternalCallback - The callback that will be called to transform the value to the internal representation.
   *
   * @returns The schema with a new return type.
   */
  toInternal<TInternal>(toInternalCallback: (value: TType['validate']) => Promise<TInternal>) {
    if (this.__toInternal) {
      const toInternal = this.__toInternal;
      this.__toInternal = async (value) => {
        const newValue = await toInternal(value);
        return toInternalCallback(newValue);
      };
    } else this.__toInternal = toInternalCallback;

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
   * Called before the validation of the schema. Let's say that you want to validate a date that might receive a
   * string, you can convert that string to a date here BEFORE the validation. This pretty much transforms the value
   * to a type that the schema adapter can understand.
   *
   * @example
   * ```
   * import * as p from '@palmares/schemas';
   * import * as z from 'zod';
   *
   * const customRecordToMapSchema = p.schema().appendSchema(z.map()).toValidate(async (value) => {
   *    return new Map(value); // Before validating we transform the value to a map.
   * });
   *
   * const { errors, parsed } = await customRecordToMapSchema.parse({ key: 'value' });
   * ```
   *
   * @param toValidateCallback - The callback that will be called to validate the value.
   *
   * @returns The schema with a new return type.
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
    const data = await this.__transformToAdapter({
      shouldAddStringVersion: true,
      force: true
    } as any);

    const stringVersions = data.map((value) => value.asString);
    return stringVersions;
  }

  static new<TType extends { input: any; output: any; internal: any; representation: any; validate: any }>(
    ..._args: any[]
  ): Schema<TType> {
    const result = new Schema<TType>();
    return result;
  }
}

export const schema = Schema.new;
