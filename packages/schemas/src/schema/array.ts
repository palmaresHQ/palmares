import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import {
  defaultTransform,
  defaultTransformToAdapter,
  transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas,
} from '../utils';
import { DefinitionsOfSchemaType, ExtractTypeFromArrayOfSchemas } from './types';
import { arrayValidation, minLength, maxLength, nonEmpty } from '../validators/array';
import Validator from '../validators/utils';
import { optional, nullable } from '../validators/schema';

export default class ArraySchema<
  TType extends {
    input: any;
    validate: any;
    internal: any;
    output: any;
    representation: any;
  } = {
    input: any[];
    output: any[];
    internal: any[];
    representation: any[];
    validate: any[];
  },
  TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
  TSchemas extends readonly [Schema, ...Schema[]] | [Array<Schema>] = [Array<Schema>],
> extends Schema<TType, TDefinitions> {
  protected __schemas: readonly [Schema, ...Schema[]] | [Array<Schema>];

  protected __minLength!: {
    value: number;
    inclusive: boolean;
    message: string;
  };

  protected __maxLength!: {
    value: number;
    inclusive: boolean;
    message: string;
  };

  protected __nonEmpty!: {
    message: string;
  };

  constructor(...schemas: TSchemas) {
    super();
    this.__schemas = schemas;
  }

  protected async __transformToAdapter(options: Parameters<Schema['__transformToAdapter']>[0]): Promise<any> {
    return defaultTransformToAdapter(
      async (adapter) => {
        const schemas = Array.isArray(this.__schemas[0]) ? this.__schemas[0] : this.__schemas;
        const transformedSchemasAsString: string[] = [];
        const transformedSchemas: any[] = [];
        let shouldBeHandledByFallback = false;

        await Promise.all(
          (schemas as Schema[]).map(async (schema) => {
            const [transformedData, shouldAddFallbackValidationForThisSchema] =
              await transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas(schema, options);

            if (shouldAddFallbackValidationForThisSchema) shouldBeHandledByFallback = true;

            for (const transformedSchema of transformedData) {
              transformedSchemasAsString.push(transformedSchema.asString);
              transformedSchemas.push(transformedSchema.transformed);
            }
          })
        );

        if (shouldBeHandledByFallback)
          Validator.createAndAppendFallback(
            this,
            arrayValidation(
              Array.isArray(this.__schemas[0]) === false,
              (Array.isArray(this.__schemas[0]) ? this.__schemas[0] : this.__schemas) as Schema<any, any>[]
            )
          );

        return defaultTransform(
          'array',
          this,
          adapter,
          adapter.array,
          () => ({
            isTuple: Array.isArray(this.__schemas[0]) === false,
            nullable: this.__nullable,
            optional: this.__optional,
            maxLength: this.__maxLength,
            minLength: this.__minLength,
            nonEmpty: this.__nonEmpty,
            parsers: {
              nullable: this.__nullable.allow,
              optional: this.__optional.allow,
            }
          }),
          {
            optional,
            nullable,
            minLength,
            maxLength,
            nonEmpty,
          },
          {
            shouldAddStringVersion: options.shouldAddStringVersion,
            fallbackIfNotSupported: async () => [],
          }
        );
      },
      this.__transformedSchemas,
      options,
      'array'
    );
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
  optional<TOutputOnly extends boolean = false>(options?: { message?: string; allow?: false, outputOnly?: TOutputOnly}) {
    return (options?.outputOnly ? this : super.optional(options)) as unknown as ArraySchema<(TOutputOnly extends true ?
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'] | undefined | null;
        representation: TType['representation'];
      } :
      {
        input: TType['input'] | undefined | null;
        validate: TType['validate'] | undefined | null;
        internal: TType['internal'] | undefined | null;
        output: TType['output'] | undefined | null;
        representation: TType['representation'] | undefined | null;
      }),
      TDefinitions,
      TSchemas
    >;
  }


  minLength(value: number, inclusive = true, message?: string) {
    message = message || `The array must have a minimum length of ${value}`;
    this.__minLength = {
      value: value,
      inclusive: inclusive,
      message: message,
    };

    return this;
  }

  maxLength(value: number, inclusive = true, message?: string) {
    message = message || `The array must have a maximum length of ${value}`;
    this.__maxLength = {
      value: value,
      inclusive: inclusive,
      message: message,
    };

    return this;
  }

  nonEmpty(message?: string) {
    message = message || 'The array must not be empty';
    this.__nonEmpty = {
      message: message,
    };

    return this;
  }

  static new<
    TSchemas extends readonly [Schema, ...Schema[]] | [Array<Schema>],
    TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
  >(...schemas: TSchemas) {
    const returnValue = new ArraySchema<
      {
        input: ExtractTypeFromArrayOfSchemas<TSchemas, 'input'>;
        validate: ExtractTypeFromArrayOfSchemas<TSchemas, 'validate'>;
        internal: ExtractTypeFromArrayOfSchemas<TSchemas, 'internal'>;
        output: ExtractTypeFromArrayOfSchemas<TSchemas, 'output'>;
        representation: ExtractTypeFromArrayOfSchemas<TSchemas, 'representation'>;
      },
      TDefinitions,
      TSchemas
    >(...schemas);

    const adapterInstance = getDefaultAdapter();

    returnValue.__transformedSchemas[adapterInstance.constructor.name] = {
      transformed: false,
      adapter: adapterInstance,
      schemas: [],
    };

    return returnValue;
  }
}

export const array = <
  TSchemas extends readonly [Schema, ...Schema[]] | [Array<Schema>],
  TDefinitions extends DefinitionsOfSchemaType,
>(
  ...schemas: TSchemas
) => ArraySchema.new<TSchemas, TDefinitions>(...schemas);
