import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import { defaultTransform, defaultTransformToAdapter } from '../utils';
import { DefinitionsOfSchemaType } from './types';
import { optional, nullable } from '../validators/schema';
import { datetimeValidation, allowStringParser, above, below } from '../validators/datetime';

export default class DatetimeSchema<
  TType extends {
    input: any;
    validate: any;
    internal: any;
    output: any;
    representation: any;
  } = {
    input: Date;
    output: string;
    internal: Date;
    representation: string;
    validate: Date;
  },
  TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
> extends Schema<TType, TDefinitions> {
  protected __allowString!: boolean;

  protected __above!: {
    value: Date;
    inclusive: boolean;
    message: string;
  };
  protected __below!: {
    value: Date;
    inclusive: boolean;
    message: string;
  };

  protected async __transformToAdapter(options: Parameters<Schema['__transformToAdapter']>[0]): Promise<any> {
    return defaultTransformToAdapter(
      async (adapter) => {
        return defaultTransform(
          'datetime',
          this,
          adapter,
          adapter.datetime,
          () => ({
            allowString: this.__allowString,
            below: this.__below,
            above: this.__above,
            nullable: this.__nullable,
            optional: this.__optional,
            parsers: {
              nullable: this.__nullable.allow,
              optional: this.__optional.allow,
            }
          }),
          {
            optional,
            nullable,
            allowString: allowStringParser,
            above,
            below,
          },
          {
            validatorsIfFallbackOrNotSupported: datetimeValidation(),
            shouldAddStringVersion: options.shouldAddStringVersion,
            fallbackIfNotSupported: async () => [],
          }
        );
      },
      this.__transformedSchemas,
      options,
      'datetime'
    );
  }

  /**
   * This will allow the value to be a string, it does not validate, it just parses inputs as strings and allows the result to be a string as well.
   *
   * @example
   * ```ts
   * datetime().allowString().parse('11-07-1994') // works
   * ```
   *
   * @returns - The schema instance
   */
  allowString() {
    this.__allowString = true;

    return this as any as DatetimeSchema<
      {
        input: string | TType['input'];
        output: string | TType['output'];
        internal: string | TType['output'];
        representation: string | TType['output'];
        validate: string | TType['output'];
      },
      TDefinitions
    >;
  }

  /**
   * This will validate if the value is above the specified date.
   *
   * @example
   * ```ts
   * const today = new Date();
   * const yesterday = new Date(today);
   * yesterday.setDate(today.getDate() - 1);
   *
   * datetime().above(today).parse(today) // throws error
   * datetime().above(today, { inclusive: true }).parse(today) // works
   * datetime().above(yesterday).parse(today) // works
   * ```
   *
   * @param value - The value that we are comparing against.
   * @param options - The options that we are passing to the validator.
   * @param options.inclusive - If the value is inclusive or not. In other words, if the value can be equal to the specified date.
   * @param options.message - The message that we are returning if the value is not above the specified date.
   *
   * @returns - The schema instance
   */
  above(value: Date, options?: { inclusive?: boolean; message: string }) {
    const inclusive = typeof options?.inclusive === 'boolean' ? options?.inclusive : false;
    const message = options?.message || 'Value is not above the specified date';

    this.__above = {
      value,
      inclusive,
      message,
    };
    return this;
  }

  /**
   * This will validate if the value is below the specified date.
   *
   * @example
   * ```ts
   * const today = new Date();
   * const yesterday = new Date(today);
   * yesterday.setDate(today.getDate() - 1);
   *
   * datetime().below(today).parse(today) // throws error
   * datetime().below(today, { inclusive: true }).parse(today) // works
   * datetime().below(today).parse(yesterday) // works
   * ```
   *
   * @param value - The value that we are comparing against.
   * @param options - The options that we are passing to the validator.
   * @param options.inclusive - If the value is inclusive or not. In other words, if the value can be equal to the specified date.
   * @param options.message - The message that we are returning if the value is not above the specified date.
   *
   * @returns - The schema instance
   */
  below(value: Date, options?: { inclusive?: boolean; message: string }) {
    const inclusive = typeof options?.inclusive === 'boolean' ? options?.inclusive : false;
    const message = options?.message || 'Value is not below the specified date';

    this.__below = {
      value,
      inclusive,
      message,
    };
    return this;
  }

  static new<TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType>() {
    const returnValue = new DatetimeSchema<
      {
        input: Date;
        validate: Date;
        internal: Date;
        output: Date;
        representation: Date;
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

export const datetime = <TDefinitions extends DefinitionsOfSchemaType>() => DatetimeSchema.new<TDefinitions>();
