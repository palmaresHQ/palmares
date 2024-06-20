import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import {
  DEFAULT_NUMBER_INTEGER_EXCEPTION,
  DEFAULT_NUMBER_MAX_EXCEPTION,
  DEFAULT_NUMBER_MIN_EXCEPTION,
  DEFAULT_NUMBER_NEGATIVE_EXCEPTION,
} from '../constants';
import { defaultTransform, defaultTransformToAdapter } from '../utils';
import { max, min, numberValidation } from '../validators/number';
import { DefinitionsOfSchemaType } from './types';
import Validator from '../validators/utils';

export default class NumberSchema<
  TType extends {
    input: any;
    validate: any;
    internal: any;
    output: any;
    representation: any;
  } = {
    input: number | bigint;
    output: number | bigint;
    validate: number | bigint;
    internal: number | bigint;
    representation: number | bigint;
  },
  TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
> extends Schema<TType, TDefinitions> {
  protected __is!: {
    value: TType['input'][];
    message: string;
  };

  protected __integer!: {
    message: string;
  };

  protected __max!: {
    value: number;
    inclusive: boolean;
    message: string;
  };

  protected __min!: {
    value: number;
    inclusive: boolean;
    message: string;
  };

  protected __allowNegative!: {
    allowZero: boolean;
    message: string;
  };

  protected __allowPositive!: {
    allowZero: boolean;
    message: string;
  };

  protected async __transformToAdapter(options: Parameters<Schema['__transformToAdapter']>[0]): Promise<any> {
    return defaultTransformToAdapter(
      async (adapter) => {
        return defaultTransform(
          'number',
          this,
          adapter,
          adapter.number,
          () => ({
            is: this.__is,
            min: this.__min,
            allowNegative: this.__allowNegative,
            allowPositive: this.__allowPositive,
            max: this.__max,
            integer: this.__integer,
            optional: this.__optional,
            nullable: this.__nullable,
            parsers: {
              nullable: this.__nullable.allow,
              optional: this.__optional.allow,
            }
          }),
          {
            max,
            min,
          },
          {
            validatorsIfFallbackOrNotSupported: numberValidation(),
            shouldAddStringVersion: options.shouldAddStringVersion,
            fallbackIfNotSupported: async () => {
              return [];
            },
          }
        );
      },
      this.__transformedSchemas,
      options,
      'number'
    );
  }

  is<const TValue extends TType['input'][]>(value: TValue) {
    this.__is = {
      value,
      message: `The value should be equal to ${value}`,
    };

    return this as any as Schema<
      {
        input: TValue[number];
        output: TValue[number];
        internal: TValue[number];
        representation: TValue[number];
        validate: TValue[number];
      },
      TDefinitions
    >;
  }

  max(
    value: number,
    options?: {
      inclusive?: boolean;
      message?: string;
    }
  ) {
    const inclusive = typeof options?.inclusive === 'boolean' ? options?.inclusive : false;
    const message =
      typeof options?.message === 'string' ? options?.message : DEFAULT_NUMBER_MAX_EXCEPTION(value, inclusive);
    this.__max = {
      value,
      inclusive,
      message,
    };
    return this as unknown as NumberSchema<TType, TDefinitions> & { is: never };
  }

  min(
    value: number,
    options?: {
      inclusive?: boolean;
      message?: string;
    }
  ) {
    const inclusive = typeof options?.inclusive === 'boolean' ? options?.inclusive : false;
    const message =
      typeof options?.message === 'string' ? options?.message : DEFAULT_NUMBER_MIN_EXCEPTION(value, inclusive);

    this.__min = {
      value,
      inclusive,
      message,
    };

    return this;
  }

  negative(options?: { allowZero?: boolean; message?: string }) {
    const allowZero = typeof options?.allowZero === 'boolean' ? options?.allowZero : true;
    const message =
      typeof options?.message === 'string' ? options?.message : DEFAULT_NUMBER_NEGATIVE_EXCEPTION(allowZero);

    this.__allowNegative = {
      allowZero,
      message,
    };
    return this as unknown as NumberSchema<
      {
        input: TType['input'];
        output: TType['output'];
        representation: TType['representation'];
        internal: TType['internal'];
        validate: TType['validate'];
      },
      TDefinitions
    >;
  }

  positive(options?: { allowZero?: boolean; message?: string }) {
    const allowZero = typeof options?.allowZero === 'boolean' ? options?.allowZero : true;
    const message =
      typeof options?.message === 'string' ? options?.message : DEFAULT_NUMBER_NEGATIVE_EXCEPTION(allowZero);

    this.__allowPositive = {
      allowZero,
      message,
    };
    return this as unknown as NumberSchema<
      {
        input: TType['input'];
        output: TType['output'];
        representation: TType['representation'];
        internal: TType['internal'];
        validate: TType['validate'];
      },
      TDefinitions
    >;
  }

  integer(options?: { message?: string }) {
    const message = typeof options?.message === 'string' ? options?.message : DEFAULT_NUMBER_INTEGER_EXCEPTION();

    this.__integer = {
      message,
    };
    return this as unknown as NumberSchema<
      {
        input: TType['input'];
        output: TType['output'];
        representation: TType['representation'];
        internal: TType['internal'];
        validate: TType['validate'];
      },
      TDefinitions
    >;
  }

  static new<TDefinitions extends DefinitionsOfSchemaType>() {
    const returnValue = new NumberSchema<
      {
        input: number | bigint;
        output: number | bigint;
        internal: number | bigint;
        representation: number | bigint;
        validate: number | bigint;
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

export const number = <TDefinitions extends DefinitionsOfSchemaType>() => NumberSchema.new<TDefinitions>();


const main = async () => {
  const schema = number().omit()
  const value = await schema.data(1);
}
