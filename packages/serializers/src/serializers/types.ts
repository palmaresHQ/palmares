import { models, ModelFields } from '@palmares/databases';

import { Field } from "../fields";
import type { FieldParamsType, FieldType, InFieldType, OutFieldType } from "../fields/types";
import Serializer from ".";
import ModelSerializer from './model';

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

export type ModelSerializerParamsType<
  I extends ModelSerializer,
  M extends boolean = boolean,
  C = any,
  D extends SerializerType<I> | undefined = undefined,
  N extends boolean = boolean,
  R extends boolean = boolean,
  RO extends boolean = boolean,
  WO extends boolean = boolean,
  MO extends ReturnType<typeof models.Model<MO>> = ReturnType<typeof models.Model>,
  IN extends keyof ModelFields<InstanceType<MO>> = any,
  EX extends keyof ModelFields<InstanceType<MO>> = any
> = {
  instance?: M extends false ?
    OutFieldType<FieldType<OutSerializerType<I>, N, R, D> & Pick<ModelFields<InstanceType<MO>>, Exclude<keyof InstanceType<MO>["fields"], EX>> & Pick<ModelFields<InstanceType<MO>>, IN>, WO> :
    OutFieldType<FieldType<OutSerializerType<I>, N, R, D> & Pick<ModelFields<InstanceType<MO>>, Exclude<keyof InstanceType<MO>["fields"], EX>> & Pick<ModelFields<InstanceType<MO>>, IN>, WO>[];
  data?: M extends false ?
    InFieldType<FieldType<InSerializerType<I>, N, R, D> & Pick<ModelFields<InstanceType<MO>>, Exclude<keyof InstanceType<MO>["fields"], EX>> & Pick<ModelFields<InstanceType<MO>>, IN>, RO> :
    InFieldType<FieldType<InSerializerType<I>, N, R, D> & Pick<ModelFields<InstanceType<MO>>, Exclude<keyof InstanceType<MO>["fields"], EX>> & Pick<ModelFields<InstanceType<MO>>, IN>, RO>[];
} & SerializerParamsType<I, M, C, D, N, R, RO, WO>

export type SerializerFieldsType<F extends Field = Field> = {
  [key: string]: F ;
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

export type ModelSerializerOptions<
  M extends ReturnType<typeof models.Model> = ReturnType<typeof models.Model>,
> = {
  model: M;
  fields?: readonly (keyof ModelFields<InstanceType<M>>)[];
  excludes?: readonly (keyof ModelFields<InstanceType<M>>)[];
  dependsOn?: readonly ReturnType<typeof models.Model>[]
}
