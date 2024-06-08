import { withFallbackFactory } from '../utils';
import Schema from '../schema/schema';

export type NonToTranslateArgs = {
  withFallback: ReturnType<typeof withFallbackFactory>;
};

export type AdapterToStringArgs = {
  optional: Schema['__optional'];
  nullable: Schema['__nullable'];
};

export type AdapterTranslateArgs = AdapterToStringArgs & NonToTranslateArgs;

export type ArrayAdapterTranslateArgs = {
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
} & AdapterTranslateArgs;

export type NumberAdapterTranslateArgs = {
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
  allowNegative:
    | {
        allowZero: boolean;
        message: string;
      }
    | undefined;
  allowPositive:
    | {
        allowZero: boolean;
        message: string;
      }
    | undefined;
  integer:
    | {
        message: string;
      }
    | undefined;
} & AdapterTranslateArgs;

export type StringAdapterToStringArgs = Omit<StringAdapterTranslateArgs, keyof NonToTranslateArgs>;

export type StringAdapterTranslateArgsWithoutNonTranslateArgs = Omit<
  StringAdapterTranslateArgs,
  keyof NonToTranslateArgs
>;

export type StringAdapterTranslateArgs = {
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
} & AdapterTranslateArgs;

export type NumberAdapterToStringArgs = Omit<NumberAdapterTranslateArgs, keyof NonToTranslateArgs>;

export type NumberAdapterTranslateArgsWithoutNonTranslateArgs = Omit<
  NumberAdapterTranslateArgs,
  keyof NonToTranslateArgs
>;

export type ObjectAdapterTranslateArgs = {
  data: Record<string, any>;
} & AdapterTranslateArgs;

export type ObjectAdapterToStringArgs = {
  data: Record<string, string>;
} & AdapterToStringArgs;

export type UnionAdapterTranslateArgs<TSchemasType = any> = {
  schemas: TSchemasType;
} & AdapterTranslateArgs;

export type UnionAdapterToStringArgs = {
  schemas: [string, string, ...string[]];
} & AdapterToStringArgs;

export type UnionAdapterTranslateArgsWithoutNonTranslateArgs = Omit<
  UnionAdapterTranslateArgs,
  keyof NonToTranslateArgs
>;

export type ObjectAdapterTranslateArgsWithoutNonTranslateArgs = Omit<
  ObjectAdapterTranslateArgs,
  keyof NonToTranslateArgs
>;

export type ArrayAdapterTranslateArgsWithoutNonTranslateArgs = Omit<
  ArrayAdapterTranslateArgs,
  keyof NonToTranslateArgs
>;

export type ValidationDataBasedOnType<TType> = TType extends 'number'
  ? NumberAdapterTranslateArgsWithoutNonTranslateArgs
  : TType extends 'union'
  ? UnionAdapterTranslateArgsWithoutNonTranslateArgs
  : TType extends 'string'
  ? StringAdapterTranslateArgsWithoutNonTranslateArgs
  : TType extends 'array'
  ? ArrayAdapterTranslateArgsWithoutNonTranslateArgs
  : ObjectAdapterTranslateArgsWithoutNonTranslateArgs;

export type ErrorCodes =
  | 'max'
  | 'allowNegative'
  | 'allowPositive'
  | 'negative'
  | 'min'
  | 'integer'
  | 'required'
  | 'object'
  | 'number'
  | 'string'
  | 'array'
  | 'datetime'
  | 'minLength'
  | 'maxLength'
  | 'regex'
  | 'includes'
  | 'endsWith'
  | 'startsWith';
