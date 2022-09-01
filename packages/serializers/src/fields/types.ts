import { ErrorMessagesType } from "../types";
import Field from "./field";

export type FieldErrorMessagesType = {
  required?: ErrorMessagesType,
  null?: ErrorMessagesType,
}

export type CallbackIfDefinedToInternal<
  F extends Field,
  D extends Exclude<F["inType"], null | undefined> = Exclude<F["inType"], null | undefined>
> = (data: D) => Promise<F["inType"]> | F["inType"]

export type CallbackIfDefinedToRepresentation<
  F extends Field,
  D extends Exclude<F["outType"], null | undefined> = Exclude<F["outType"], null | undefined>
> = (data: D) => Promise<F["outType"]> | F["outType"]

type AllowNull<T, N extends boolean = false> = N extends false ? T : T | null;
type Required<T, R extends boolean = true, D = any> = D extends undefined ? R extends false ? T | undefined : T : T;
export type FieldType<
T,
N extends boolean = false,
R extends boolean = true,
D = any
> = Required<AllowNull<T, N>, R, D>

type ReadOnly<T, RO extends boolean = false> = RO extends false ? T : never;
export type InFieldType<
  T extends FieldType<any>,
  RO extends boolean = false
> = ReadOnly<T, RO>

type WriteOnly<T, WriteOnly extends boolean = false> = WriteOnly extends false ? T : never;
export type OutFieldType<
  T extends FieldType<any>,
  WO extends boolean = false
> = WriteOnly<T, WO>

export type FieldParamsType<
  I extends Field,
  D extends I["type"] | undefined = undefined,
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
  D extends I["type"] | undefined = undefined,
  N extends boolean = false,
  R extends boolean = true,
  RO extends boolean = boolean,
  WO extends boolean = boolean
> = {
  allowBlank?: boolean;
  maxLength?: number;
  minLength?: number,
} & FieldParamsType<I, D, N, R, RO, WO>
