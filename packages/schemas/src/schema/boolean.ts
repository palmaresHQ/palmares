import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import { defaultTransform, defaultTransformToAdapter } from '../utils';
import { DefinitionsOfSchemaType } from './types';
import { optional, nullable, is } from '../validators/schema';
import { booleanValidation } from '../validators/boolean';
import convertFromStringBuilder from '../parsers/convert-from-string';

export default class BooleanSchema<
  TType extends {
    input: any;
    validate: any;
    internal: any;
    output: any;
    representation: any;
  } = {
    input: boolean;
    output: boolean;
    internal: boolean;
    representation: boolean;
    validate: boolean;
  },
  TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
> extends Schema<TType, TDefinitions> {
  protected __allowString!: boolean;
  protected __allowNumber!: boolean;
  protected __trueValues!: any[];
  protected __falseValues!: any[];

  protected __is!: {
    value: boolean;
    message: string;
  };

  protected async __transformToAdapter(options: Parameters<Schema['__transformToAdapter']>[0]): Promise<any> {
    return defaultTransformToAdapter(
      async (adapter) => {
        return defaultTransform(
          'boolean',
          this,
          adapter,
          adapter.boolean,
          () => ({
            parsers: {
              allowString: this.__allowString,
              allowNumber: this.__allowNumber,
              is: this.__is?.value,
              trueValues: this.__trueValues,
              falseValues: this.__falseValues,
              nullable: this.__nullable.allow,
              optional: this.__optional.allow,
            },
            is: this.__is,
            nullable: this.__nullable,
            optional: this.__optional,
          }),
          {

            optional,
            nullable,
            is,
          },
          {
            validatorsIfFallbackOrNotSupported: booleanValidation(),
            shouldAddStringVersion: options.shouldAddStringVersion,
            fallbackIfNotSupported: async () => [],
          }
        );
      },
      this.__transformedSchemas,
      options,
      'boolean'
    );
  }

  /**
   * This will allow the value to be a string, it does not validate, it just parses inputs as strings and allows the result to be a string as well.
   *
   * @example
   * ```ts
   * boolean().allowString().parse('true') // true
   * ```
   *
   * @returns - The schema instance
   */
  allowString() {
    this.__allowString = true;

    this.__parsers.low.set(
      'allowString',
      convertFromStringBuilder((value) => {
        return {
          value: Boolean(value),
          preventNextParsers: false,
        };
      })
    );

    return this as any as BooleanSchema<
      {
        input: string | TType['input'];
        output: string | TType['output'];
        internal: string | TType['internal'];
        representation: string | TType['representation'];
        validate: string | TType['validate'];
      },
      TDefinitions
    >;
  }

  trueValues<const TValues extends any[]>(values: TValues) {
    this.__trueValues = values;

    this.__parsers.medium.set('trueValues', (value) => {
      const valueExistsInList = values.includes(value);
      return {
        preventNextParsers: valueExistsInList,
        value: valueExistsInList,
      };
    });
    return this as any as BooleanSchema<
      {
        input: TValues[number] | TType['input'];
        output: TValues[number] | TType['output'];
        internal: TValues[number] | TType['internal'];
        representation: TValues[number] | TType['representation'];
        validate: TValues[number] | TType['validate'];
      },
      TDefinitions
    >;
  }

  falseValues<const TValues extends any[]>(values: TValues) {
    this.__falseValues = values;

    this.__parsers.medium.set('falseValues', (value) => {
      const valueExistsInList = values.includes(value);
      return {
        preventNextParsers: valueExistsInList,
        value: !valueExistsInList,
      };
    });

    return this as any as BooleanSchema<
      {
        input: TValues[number] | TType['input'];
        output: TValues[number] | TType['output'];
        internal: TValues[number] | TType['internal'];
        representation: TValues[number] | TType['representation'];
        validate: TValues[number] | TType['validate'];
      },
      TDefinitions
    >;
  }

  /**
   * This will allow the value to be a number, it does not validate, it just parses inputs as number and allows the result to be a string as well.
   *
   * @example
   * ```ts
   * boolean().allowNumber().parse(1) // true
   * ```
   *
   * @returns - The schema instance
   */
  allowNumber() {
    this.__allowNumber = true;

    this.__parsers.low.set('allowNumber', (value) => {
      return {
        value: typeof value === 'number' ? Boolean(value) : value,
        preventNextParsers: typeof value === 'number',
      };
    });

    return this as any as BooleanSchema<
      {
        input: number | TType['input'];
        output: number | TType['output'];
        internal: number | TType['output'];
        representation: number | TType['output'];
        validate: number | TType['output'];
      },
      TDefinitions
    >;
  }

  /**
   * This will validate if the value is equal to the value passed as argument. This way you can guarantee that the value
   * is exactly what you want.
   *
   * @param value - The value to compare with
   * @param options - The options to be passed to the validation
   * @param options.message - The message to be returned if the validation fails
   *
   * @example
   * ```ts
   * boolean().is(true).parse(true) // true
   * boolean().is(true).parse(false) // doesn't allow
   * ```
   *
   * @returns - The schema instance
   */
  is<TValue extends true | false>(value: TValue, options?: { message?: string }) {
    this.__is = {
      value,
      message: typeof options?.message === 'string' ? options?.message : `The value should be equal to ${value}`,
    };

    this.__parsers.high.set('is', (valueFromParser) => {
      const isSetValue = value === valueFromParser;
      return {
        value: isSetValue ? valueFromParser : undefined,
        preventNextParsers: true,
      };
    });

    return this as any as Schema<
      {
        input: TValue extends true ? true : false;
        output: TValue extends true ? true : false;
        internal: TValue extends true ? true : false;
        representation: TValue extends true ? true : false;
        validate: TValue extends true ? true : false;
      },
      TDefinitions
    >;
  }

  static new<TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType>() {
    const returnValue = new BooleanSchema<
      {
        input: boolean;
        validate: boolean;
        internal: boolean;
        output: boolean;
        representation: boolean;
      },
      TDefinitions
    >();

    const adapterInstance = getDefaultAdapter();

    returnValue.__transformedSchemas[adapterInstance.constructor.name] = {
      transformed: false,
      adapter: adapterInstance,
      schemas: [],
    };

    return returnValue;
  }
}

export const boolean = <TDefinitions extends DefinitionsOfSchemaType>() => BooleanSchema.new<TDefinitions>();
