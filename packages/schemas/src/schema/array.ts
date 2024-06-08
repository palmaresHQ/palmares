import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import {
  defaultTransform,
  defaultTransformToAdapter,
  transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas,
} from '../utils';
import { DefinitionsOfSchemaType, ExtractTypeFromArrayOfSchemas } from './types';
import { arrayValidation } from '../validators/array';
import Validator from '../validators/utils';
import StringSchema from './string';

export default class ArraySchema<
  TType extends {
    input: any[];
    validate: any[];
    internal: any[];
    output: any[];
    representation: any[];
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

  protected __includes!: {
    value: string | number | boolean | null | undefined;
    message: string;
  };

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

  async _transformToAdapter(options: Parameters<Schema['_transformToAdapter']>[0]): Promise<any> {
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
            includes: this.__includes,
            maxLength: this.__maxLength,
            minLength: this.__minLength,
            nonEmpty: this.__nonEmpty,
          }),
          {},
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

  includes(value: string | number | boolean | null | undefined, message?: string) {
    message = message || `The array must include ${value}`;
    this.__includes = {
      value: value,
      message: message,
    };
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
