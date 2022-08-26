import { Field } from "../fields";
import { FieldParamsType } from "../fields/types";
import { Serializer } from ".";

// We pass the default value as any here because otherwise we would have an issue in the `new` factory method with the value of `this`. This is because
// By default the default type for the serializer will be `{[x: string]: Field}` but when we create a serializer it will be something
// like `{ firstName: string, lastName: string }`
export type SerializerParamsTypeForConstructor<
  I extends Serializer,
  M extends boolean = boolean,
  C = any,
  N extends boolean = boolean,
  R extends boolean = boolean,
  RO extends boolean = boolean,
  WO extends boolean = boolean
> = {
  instance?: OutSerializerType<I>;
  data?: InSerializerType<I>;
  many?: M;
  context?: C;
} & FieldParamsType<I, any, N, R, RO, WO>


export type SerializerParamsType<
  I extends Serializer,
  M extends boolean = boolean,
  C = any,
  D extends SerializerType<I> | undefined = undefined,
  N extends boolean = boolean,
  R extends boolean = boolean,
  RO extends boolean = boolean,
  WO extends boolean = boolean
> = {
  instance?: M extends false ? OutSerializerType<I> : OutSerializerType<I>[];
  data?: M extends false ? InSerializerType<I> : InSerializerType<I>[];
  many?: M;
  context?: C;
} & FieldParamsType<I, D, N, R, RO, WO>

export type SerializerFieldsType = {
  [key: string]: Field ;
}


type Required<I> = {
  [K in keyof I as undefined extends I[K] ? never : K]: I[K]
}
type Optional<I> = {
  [K in keyof I as undefined extends I[K] ? K : never]?: I[K]
}

type FieldTypesOfSerializer<I extends Serializer> = {
  [K in keyof I["fields"]]: I["fields"][K]["type"]
}
type InFieldTypesOfSerializer<I extends Serializer> = {
  [K in keyof I["fields"]]: I["fields"][K]["inType"]
}
type OutFieldTypesOfSerializer<I extends Serializer> = {
  [K in keyof I["fields"]]: I["fields"][K]["outType"]
}
type FieldsType<I extends Serializer> = Required<FieldTypesOfSerializer<I>> & Optional<FieldTypesOfSerializer<I>>
type OutFieldsType<I extends Serializer> = Required<OutFieldTypesOfSerializer<I>> & Optional<OutFieldTypesOfSerializer<I>>
type InFieldsType<I extends Serializer> = Required<InFieldTypesOfSerializer<I>> & Optional<InFieldTypesOfSerializer<I>>

export type SerializerType<I extends Serializer> = FieldsType<I>;
export type InSerializerType<I extends Serializer> = {
  [K in keyof InFieldsType<I> as InFieldsType<I>[K] extends never ? never : K] : InFieldsType<I>[K]
}
export type OutSerializerType<I extends Serializer> = {
  [K in keyof OutFieldsType<I> as OutFieldsType<I>[K] extends never ? never : K] : OutFieldsType<I>[K]
}
