import { withFallbackFactory } from '../utils';

export type NonToTranslateArgs = {
  withFallback: ReturnType<typeof withFallbackFactory>;
};

export type AdapterTranslateArgs = {
  nullish: {
    allowUndefined: boolean;
    message: string;
  };
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
  | 'nullish'
  | 'object'
  | 'number';
