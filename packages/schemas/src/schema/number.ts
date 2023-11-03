import SchemaAdapter from '../adapter';
import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import {
  DEFAULT_NUMBER_INTEGER_EXCEPTION,
  DEFAULT_NUMBER_MAX_EXCEPTION,
  DEFAULT_NUMBER_MIN_EXCEPTION,
  DEFAULT_NUMBER_NEGATIVE_EXCEPTION,
} from '../constants';

export default class NumberSchema<
  TType extends {
    input: any;
    output: any;
  } = {
    input: number | bigint;
    output: number | bigint;
  },
  TDefinitions = any,
> extends Schema<TType> {
  protected __adapter!: SchemaAdapter;
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

  async _transform() {
    if (!this.__adapter.number.__result)
      this.__adapter.number.__result = this.__adapter.number.translate(this.__adapter.field, {
        nullish: this.__nullish,
        min: this.__min,
        max: this.__max,
        integer: this.__integer,
        allowNegative: this.__allowNegative,
        allowPositive: this.__allowPositive,
      });

    return this.__adapter.number.__result;
  }

  async _parse(value: any) {
    const transformedSchema = await this._transform();
    return this.__adapter.number.parse(this.__adapter, transformedSchema, value);
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
    return this as unknown as NumberSchema<
      { input: TType['input'] | null; output: TType['output'] | null | undefined },
      TDefinitions
    >;
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

    return this as unknown as NumberSchema<
      { input: TType['input'] | null; output: TType['output'] | null | undefined },
      TDefinitions
    >;
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
      { input: TType['input'] | null; output: TType['output'] | null | undefined },
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
      { input: TType['input'] | null; output: TType['output'] | null | undefined },
      TDefinitions
    >;
  }

  integer(options?: { message?: string }) {
    const message = typeof options?.message === 'string' ? options?.message : DEFAULT_NUMBER_INTEGER_EXCEPTION();

    this.__integer = {
      message,
    };
    return this as unknown as NumberSchema<
      { input: TType['input'] | null; output: TType['output'] | null | undefined },
      TDefinitions
    >;
  }

  static new<TType extends { input: any; output: any }>() {
    const returnValue = new NumberSchema<TType, any>();
    const adapterInstance = new (getDefaultAdapter())();

    returnValue.__adapter = adapterInstance;

    return returnValue;
  }
}
