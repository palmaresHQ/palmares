import { Field, Empty } from "../fields";
import { FieldParamsType } from "../fields/types";
import { Serializer } from ".";

export type SerializerParamsType<
  I extends Serializer,
  M extends boolean = boolean,
  C = any,
  D extends I["type"] | typeof Empty = typeof Empty,
  N extends boolean = boolean,
  R extends boolean = boolean,
  RO extends boolean = boolean,
  WO extends boolean = boolean
> = {
  instance?: { [K in keyof I["fields"]] : I["fields"][K]["type"] };
  data?: { [K in keyof I["fields"]] : I["fields"][K]["type"] };
  many?: M;
  context?: C;
} & FieldParamsType<I, D, N, R, RO, WO>

export type SerializerFieldsType = {
  [key: string]: Field;
}
