import { withFallbackFactory } from '../utils';
import Schema from '../schema/schema';
export type NonToTranslateArgs = {
  withFallback: ReturnType<typeof withFallbackFactory>;
};

export type AdapterTranslateArgs = {
  optional: Schema['__optional'];
  nullable: Schema['__nullable'];
} & NonToTranslateArgs;

export type NumberAdapterTranslateArgs = {
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

export type NumberAdapterTranslateArgsWithoutNonTranslateArgs = Omit<
  NumberAdapterTranslateArgs,
  keyof NonToTranslateArgs
>;

export type ObjectAdapterTranslateArgs = {
  data: Record<string, any>;
} & AdapterTranslateArgs;

export type UnionAdapterTranslateArgs<TSchemasType = any> = {
  schemas: TSchemasType;
} & AdapterTranslateArgs;

export type UnionAdapterTranslateArgsWithoutNonTranslateArgs = Omit<
  UnionAdapterTranslateArgs,
  keyof NonToTranslateArgs
>;

export type ObjectAdapterTranslateArgsWithoutNonTranslateArgs = Omit<
  ObjectAdapterTranslateArgs,
  keyof NonToTranslateArgs
>;
export type ErrorCodes =
  | 'max'
  | 'allowNegative'
  | 'allowPositive'
  | 'min'
  | 'integer'
  | 'required'
  | 'object'
  | 'number';
