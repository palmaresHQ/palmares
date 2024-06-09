import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import { defaultTransform, defaultTransformToAdapter } from '../utils';
import { DefinitionsOfSchemaType } from './types';
import { optional, nullable, is } from '../validators/schema';
import { allowStringParser, booleanValidation } from '../validators/boolean';

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

  protected __is!: {
    value: boolean;
    message: string;
  };

  async _transformToAdapter(options: Parameters<Schema['_transformToAdapter']>[0]): Promise<any> {
    return defaultTransformToAdapter(
      async (adapter) => {
        return defaultTransform(
          'boolean',
          this,
          adapter,
          adapter.boolean,
          () => ({
            allowString: this.__allowString,
            allowNumber: this.__allowNumber,
            is: this.__is,
            nullable: this.__nullable,
            optional: this.__optional,
          }),
          {
            optional,
            nullable,
            allowString: allowStringParser,
            allowNumber: allowStringParser,
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

    return this as any as BooleanSchema<
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
