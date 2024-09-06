import type { Schema } from '../schema/schema';
import type { SupportedSchemas } from '../types';
import type { withFallbackFactory } from '../utils';

export type NonToTranslateArgs<TType extends SupportedSchemas> = {
  withFallback: ReturnType<typeof withFallbackFactory<TType>>;
};

export type AdapterToStringArgs = {
  parsers: {
    optional: Schema['__optional']['allow'];
    nullable: Schema['__nullable']['allow'];
  };
  type: Schema['__type'];
  optional: Schema['__optional'];
  nullable: Schema['__nullable'];
};

export type AdapterTranslateArgs<TType extends SupportedSchemas = SupportedSchemas> = AdapterToStringArgs &
  NonToTranslateArgs<TType>;

export type DatetimeAdapterTranslateArgs = {
  allowString: boolean | undefined;
  above:
    | {
        value: Date;
        inclusive: boolean;
        message: string;
      }
    | undefined;
  below:
    | {
        value: Date;
        inclusive: boolean;
        message: string;
      }
    | undefined;
} & AdapterTranslateArgs<'datetime'>;

export type BooleanAdapterTranslateArgs = {
  parsers: {
    allowString: boolean | undefined;
    allowNumber: boolean | undefined;
    trueValues: any[] | undefined;
    falseValues: any[] | undefined;
  } & AdapterTranslateArgs<'boolean'>['parsers'];
  is:
    | {
        value: boolean;
        message: string;
      }
    | undefined;
} & AdapterTranslateArgs<'boolean'>;

export type ArrayAdapterTranslateArgs = {
  schemas: any[];
  minLength:
    | {
        value: number;
        inclusive: boolean;
        message: string;
      }
    | undefined;
  maxLength:
    | {
        value: number;
        inclusive: boolean;
        message: string;
      }
    | undefined;
  nonEmpty:
    | {
        message: string;
      }
    | undefined;

  isTuple: boolean;
} & (
  | {
      isTuple: true;
      schemas: [any, ...any[]];
    }
  | { isTuple: false; schemas: [any] }
) &
  AdapterTranslateArgs<'array'>;

export type NumberAdapterTranslateArgs = {
  parsers: {
    allowString: boolean | undefined;
  } & AdapterTranslateArgs<'number'>['parsers'];
  is:
    | {
        value: number[];
        message: string;
      }
    | undefined;
  min:
    | {
        value: number;
        inclusive: boolean;
        message: string;
      }
    | undefined;
  max:
    | {
        value: number;
        inclusive: boolean;
        message: string;
      }
    | undefined;
  maxDigits:
    | {
        value: number;
        message: string;
      }
    | undefined;
  decimalPlaces:
    | {
        value: number;
        message: string;
      }
    | undefined;
  integer:
    | {
        message: string;
      }
    | undefined;
} & AdapterTranslateArgs<'number'>;

export type StringAdapterToStringArgs = Omit<StringAdapterTranslateArgs, keyof NonToTranslateArgs<'string'>>;

export type StringAdapterTranslateArgsWithoutNonTranslateArgs = Omit<
  StringAdapterTranslateArgs,
  keyof NonToTranslateArgs<'string'>
>;

export type StringAdapterTranslateArgs = {
  is:
    | {
        value: string[] | string;
        message: string;
      }
    | undefined;
  uuid:
    | {
        message: string;
      }
    | undefined;
  email: { message: string } | undefined;
  minLength:
    | {
        value: number;
        message: string;
      }
    | undefined;
  maxLength:
    | {
        value: number;
        message: string;
      }
    | undefined;
  regex:
    | {
        value: RegExp;
        message: string;
      }
    | undefined;
  endsWith:
    | {
        value: string;
        message: string;
      }
    | undefined;
  startsWith:
    | {
        value: string;
        message: string;
      }
    | undefined;
  includes:
    | {
        value: string;
        message: string;
      }
    | undefined;
} & AdapterTranslateArgs<'string'>;

export type NumberAdapterToStringArgs = Omit<NumberAdapterTranslateArgs, keyof NonToTranslateArgs<'number'>>;

export type NumberAdapterTranslateArgsWithoutNonTranslateArgs = Omit<
  NumberAdapterTranslateArgs,
  keyof NonToTranslateArgs<'number'>
>;

export type ObjectAdapterTranslateArgs = {
  data: Record<string, any>;
} & AdapterTranslateArgs<'object'>;

export type ObjectAdapterToStringArgs = {
  data: Record<string, string>;
} & AdapterToStringArgs;

export type UnionAdapterTranslateArgs<TSchemasType = any> = {
  schemas: TSchemasType;
} & AdapterTranslateArgs<'union'>;

export type UnionAdapterToStringArgs = {
  schemas: [string, string, ...string[]];
} & AdapterToStringArgs;

export type UnionAdapterTranslateArgsWithoutNonTranslateArgs = Omit<
  UnionAdapterTranslateArgs,
  keyof NonToTranslateArgs<'union'>
>;

export type ObjectAdapterTranslateArgsWithoutNonTranslateArgs = Omit<
  ObjectAdapterTranslateArgs,
  keyof NonToTranslateArgs<'object'>
>;

export type ArrayAdapterTranslateArgsWithoutNonTranslateArgs = Omit<
  ArrayAdapterTranslateArgs,
  keyof NonToTranslateArgs<'array'>
>;

export type BooleanAdapterTranslateArgsWithoutNonTranslateArgs = Omit<
  BooleanAdapterTranslateArgs,
  keyof NonToTranslateArgs<'boolean'>
>;

export type DatetimeAdapterTranslateArgsWithoutNonTranslateArgs = Omit<
  DatetimeAdapterTranslateArgs,
  keyof NonToTranslateArgs<'datetime'>
>;
export type ValidationDataBasedOnType<TType> = TType extends 'number'
  ? NumberAdapterTranslateArgsWithoutNonTranslateArgs
  : TType extends 'union'
    ? UnionAdapterTranslateArgsWithoutNonTranslateArgs
    : TType extends 'string'
      ? StringAdapterTranslateArgsWithoutNonTranslateArgs
      : TType extends 'array'
        ? ArrayAdapterTranslateArgsWithoutNonTranslateArgs
        : TType extends 'boolean'
          ? BooleanAdapterTranslateArgsWithoutNonTranslateArgs
          : TType extends 'datetime'
            ? DatetimeAdapterTranslateArgsWithoutNonTranslateArgs
            : ObjectAdapterTranslateArgsWithoutNonTranslateArgs;

export type ErrorCodes =
  | 'max'
  | 'maxDigits'
  | 'decimalPlaces'
  | 'min'
  | 'integer'
  | 'required'
  | 'null'
  | 'object'
  | 'number'
  | 'string'
  | 'array'
  | 'tuple'
  | 'nonEmpty'
  | 'datetime'
  | 'is'
  | 'above'
  | 'below'
  | 'boolean'
  | 'minLength'
  | 'maxLength'
  | 'regex'
  | 'uuid'
  | 'email'
  | 'includes'
  | 'endsWith'
  | 'startsWith'
  | `customError${string}`;
