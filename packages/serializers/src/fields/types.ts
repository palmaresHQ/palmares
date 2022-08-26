import { ErrorMessagesType } from "../types";
import { Field, Empty } from ".";

export type FieldErrorMessagesType = {
  required?: ErrorMessagesType,
  null?: ErrorMessagesType,
}

type AllowNull<T, N extends boolean = boolean> = N extends false ? T : T | null;
type Required<T, R extends boolean = boolean> = R extends false ? T | undefined : T;
export type FieldType<T, N extends boolean = boolean, R extends boolean = boolean,  RO extends boolean = boolean, WO extends boolean = boolean> =
  Required<AllowNull<T, N>, R>

export type FieldParamsType<
  I extends Field,
  D extends I["type"] | typeof Empty = typeof Empty,
  N extends boolean = false,
  R extends boolean = true,
  RO extends boolean = boolean,
  WO extends boolean = boolean
> = {
  source?: string;
  required?: R;
  defaultValue?: D | null;
  allowNull?: N;
  readOnly?: RO;
  writeOnly?: WO;
  errorMessages?: FieldErrorMessagesType;
}

export type CharFieldParamsType<
  I extends Field,
  D extends I["type"] | typeof Empty = typeof Empty,
  N extends boolean = false,
  R extends boolean = true,
  RO extends boolean = boolean,
  WO extends boolean = boolean
> = {
  allowBlank?: boolean;
  maxLength?: number;
  minLength?: number,
} & FieldParamsType<I, D, N, R, RO, WO>
