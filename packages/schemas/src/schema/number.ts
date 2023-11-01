import SchemaAdapter from '../adapter';
import Schema from './schema';
import { getDefaultAdapter } from '../conf';

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

  async _parse(value: any) {
    if (!this.__adapter.number.__result)
      this.__adapter.number.__result = this.__adapter.number.translate(this.__adapter.field, {
        nullish: this.__nullish,
        min: this.__min,
        max: this.__max,
        allowNegative: this.__allowNegative,
        allowPositive: this.__allowPositive,
      });

    return this.__adapter.number.parse(this.__adapter, this.__adapter.number.__result, value);
  }

  max(value: number, inclusive: boolean = false, message: string = 'Max value exceeded') {
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

  min(value: number, inclusive: boolean = false, message: string = 'Min value exceeded') {
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

  negative(allowZero: boolean = true, message: string = 'Value must be negative') {
    this.__allowNegative = {
      allowZero,
      message,
    };
    return this as unknown as NumberSchema<
      { input: TType['input'] | null; output: TType['output'] | null | undefined },
      TDefinitions
    >;
  }

  positive(allowZero: boolean = true, message: string = 'Value must be positive') {
    this.__allowPositive = {
      allowZero,
      message,
    };
    return this as unknown as NumberSchema<
      { input: TType['input'] | null; output: TType['output'] | null | undefined },
      TDefinitions
    >;
  }

  static new<TType extends { input: any; output: any }>() {
    const returnValue = new NumberSchema<TType, any>(undefined);
    const adapterInstance = new (getDefaultAdapter())();

    returnValue.__adapter = adapterInstance;

    return returnValue;
  }
}
