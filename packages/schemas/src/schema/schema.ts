import { number } from '.';
import SchemaAdapter from '../adapter';
import FieldAdapter from '../adapter/fields';
import { ErrorCodes } from '../adapter/types';
import { formatErrorFromParseMethod, parseErrorsFactory } from '../utils';
import { OnlyFieldAdaptersFromSchemaAdapter } from './types';

export default class Schema<
  TType extends {
    input: any;
    output: any;
  } = {
    input: any;
    output: any;
  },
  TDefinitions = any,
> {
  protected __adapter!: SchemaAdapter;
  /**
   * Fallback means that the schema validator library is not able to validate everything so it's pretty much letting the handling of the validation on Palmares side and NOT on the
   * schema validator side
   */
  __fallback: ((
    value: any,
    path: string[]
  ) => Promise<
    {
      isValid: boolean;
      code: ErrorCodes;
      message: string;
      path: string[];
    }[]
  >)[] = [];
  __validationSchema!: any;
  __refinements: {
    callback: (value: TType['input']) => Promise<boolean | { isValid: boolean; message: string }>;
    isAsync: boolean;
  }[] = [];
  __nullish!: {
    allowUndefined: boolean;
    message: string;
  };
  __toRepresentation: ((value: TType['output']) => TType['output'])[] = [];
  __toInternal: ((value: TType['input']) => TType['input'])[] = [];

  async validate(value: TType['input']): Promise<boolean> {
    return this.__validationSchema.validate(value);
  }

  async _transform(_fieldName?: string): Promise<ReturnType<FieldAdapter['translate']>> {
    throw new Error('Not implemented');
  }

  async _parse(value: TType['input'], path: string[] = []): Promise<{ errors?: any[]; parsed: TType['input'] }> {
    const errorsAsHashedSet = new Set<string>();
    const transformedSchema = await this._transform();

    const parseResult: {
      errors: undefined | Awaited<ReturnType<Schema['__fallback'][number]>>;
      parsed: TType['input'];
    } = { errors: undefined, parsed: value };

    const schemaAdapterField = this.constructor.name
      .replace('Schema', '')
      .toLowerCase() as OnlyFieldAdaptersFromSchemaAdapter;

    const adapterParseResult = await this.__adapter[schemaAdapterField].parse(this.__adapter, transformedSchema, value);

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

    for (const fallback of this.__fallback) {
      const errorsOfFallback = await fallback(value, path);
      for (const error of errorsOfFallback) {
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
      { input: TType['input'] | null; output: TType['output'] | null | undefined },
      TDefinitions
    >;
  }

  toRepresentation<TOutput>(toRepresentationCallback: (value: TType['output']) => Promise<TOutput>) {
    this.__toRepresentation.splice(0, 1, toRepresentationCallback);

    return this as unknown as Schema<{ input: TType['input']; output: TOutput }, TDefinitions>;
  }

  toInternal<TInput>(toInternalCallback: (value: TType['input']) => Promise<TInput>) {
    this.__toInternal.splice(0, 1, toInternalCallback);

    return this as unknown as Schema<{ input: TInput; output: TType['output'] }, TDefinitions>;
  }

  static new<TType extends { input: any; output: any }>(_args?: any): Schema<TType> {
    return new Schema<TType>();
  }
}
