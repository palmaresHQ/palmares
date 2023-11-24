import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import {
  DEFAULT_NUMBER_INTEGER_EXCEPTION,
  DEFAULT_NUMBER_MAX_EXCEPTION,
  DEFAULT_NUMBER_MIN_EXCEPTION,
  DEFAULT_NUMBER_NEGATIVE_EXCEPTION,
} from '../constants';
import { defaultTransform } from '../utils';
import { max, min } from '../validators/number';

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
  TDefinitions = any,
> extends Schema<TType> {
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

  async _transform(): Promise<any> {
    return defaultTransform(
      'number',
      this,
      {
        min: this.__min,
        allowNegative: this.__allowNegative,
        allowPositive: this.__allowPositive,
        max: this.__max,
        integer: this.__integer,
        nullish: this.__nullish,
      },
      {
        max,
        min,
      }
    );
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
    return this;
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

  static new<
    TType extends {
      input: number | bigint;
      output: number | bigint;
      internal: number | bigint;
      representation: number | bigint;
      validate: number | bigint;
    },
  >() {
    const returnValue = new NumberSchema<TType, any>();
    const adapterInstance = new (getDefaultAdapter())();

    returnValue.__adapter = adapterInstance;

    return returnValue;
  }
}