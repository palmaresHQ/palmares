import SchemaAdapter from '../adapter';
import FieldAdapter from '../adapter/fields';
import { ErrorCodes } from '../adapter/types';
import { formatErrorFromParseMethod, parseErrorsFactory } from '../utils';
import { OnlyFieldAdaptersFromSchemaAdapter } from './types';

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
  TDefinitions = any,
> {
  protected __adapter!: SchemaAdapter;
  /**
   * Fallback means that the schema validator library is not able to validate everything so it's pretty much letting the handling of the validation on Palmares side and NOT on the
   * schema validator side
   */
  protected __fallback: ((
    value: any,
    path: string[]
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
  __nullish!: {
    allowUndefined: boolean;
    message: string;
  };
  __defaultFunction: (() => Promise<TType['input']>) | undefined = undefined;
  __toRepresentation: ((value: TType['output']) => TType['output'])[] = [];
  __toValidate: ((value: TType['input']) => TType['validate']) | undefined = undefined;
  __toInternal: ((value: TType['validate']) => TType['internal']) | undefined = undefined;

  async validate(value: TType['input']): Promise<boolean> {
    return this.__validationSchema.validate(value);
  }

  async _transform(_fieldName?: string): Promise<ReturnType<FieldAdapter['translate']>> {
    throw new Error('Not implemented');
  }

  async _parse(
    value: TType['input'],
    path: string[] = [],
    options: {
      preventAdapterParse?: boolean;
    } = {}
  ): Promise<{ errors?: any[]; parsed: TType['internal'] }> {
    const errorsAsHashedSet = new Set<string>();
    const transformedSchema = await this._transform();

    if (value === undefined && this.__defaultFunction) value = await this.__defaultFunction();
    const isToValidateCallbackDefined = typeof this.__toValidate === 'function';
    if (isToValidateCallbackDefined) value = await Promise.resolve((this.__toValidate as any)(value));

    const parseResult: {
      errors: undefined | Awaited<ReturnType<Schema['__fallback'][number]>>['errors'];
      parsed: TType['input'];
    } = { errors: undefined, parsed: value };

    // We should not parse the value by the adapter on some cases.
    if (options?.preventAdapterParse !== true) {
      const schemaAdapterField = this.constructor.name
        .replace('Schema', '')
        .toLowerCase() as OnlyFieldAdaptersFromSchemaAdapter;

      const adapterParseResult = await this.__adapter[schemaAdapterField].parse(
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
    }

    for (const fallback of this.__fallback) {
      const { parsed, errors } = await fallback(parseResult.parsed, path);
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
    const doesNotHaveErrors = !Array.isArray(parseResult.errors) || parseResult.errors.length === 0;
    const hasToInternalCallback = typeof this.__toInternal === 'function';

    if (doesNotHaveErrors && hasToInternalCallback) parseResult.parsed = await (this.__toInternal as any)(value);

    return parseResult;
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

  nullish(args: { allowUndefined?: boolean; message?: string } = {}) {
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

  toRepresentation<TRepresentation>(toRepresentationCallback: (value: TType['output']) => Promise<TRepresentation>) {
    this.__toRepresentation.splice(0, 1, toRepresentationCallback);

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
