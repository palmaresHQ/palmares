import { models, ModelFields } from '@palmares/databases';

import { Field } from '../fields';
import type {
  FieldParamsType,
  FieldType,
  InFieldType,
  OutFieldType,
} from '../fields/types';
import Serializer from '.';
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
  instance?: M extends false ? OutSerializerType<I> : OutSerializerType<I>;
  data?: M extends false ? InSerializerType<I> : InSerializerType<I>[];
  many?: M;
  context?: C;
} & FieldParamsType<I, any, N, R, RO, WO>;

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
} & FieldParamsType<I, D, N, R, RO, WO>;

export type ModelSerializerOutType<
  I extends ModelSerializer,
  D extends SerializerType<I> | undefined,
  N extends boolean,
  R extends boolean,
  WO extends boolean,
  MO extends ReturnType<typeof models.Model>,
  IN extends keyof ModelFields<InstanceType<MO>>,
  EX extends keyof ModelFields<InstanceType<MO>>
> = OutFieldType<
  FieldType<
    OutSerializerType<I> &
      Pick<
        ModelFields<InstanceType<MO>>,
        Exclude<keyof InstanceType<MO>['fields'], EX>
      > &
      Pick<ModelFields<InstanceType<MO>>, IN>,
    N,
    R,
    D
  >,
  WO
>;

export type ModelSerializerInType<
  I extends ModelSerializer,
  D extends SerializerType<I> | undefined = undefined,
  N extends boolean = false,
  R extends boolean = true,
  RO extends boolean = false,
  MO extends ReturnType<typeof models.Model> = I['options']['model'],
  IN extends keyof ModelFields<
    InstanceType<MO>
  > = I['options']['fields'] extends readonly (keyof ModelFields<
    InstanceType<I['options']['model']>
  >)[]
    ? I['options']['fields'][number]
    : any,
  EX extends keyof ModelFields<
    InstanceType<MO>
  > = I['options']['excludes'] extends readonly (keyof ModelFields<
    InstanceType<I['options']['model']>
  >)[]
    ? I['options']['excludes'][number]
    : any
> = InFieldType<
  FieldType<
    InSerializerType<I> &
      Pick<
        ModelFields<InstanceType<MO>>,
        Exclude<keyof InstanceType<MO>['fields'], EX>
      > &
      Pick<ModelFields<InstanceType<MO>>, IN>,
    N,
    R,
    D
  >,
  RO
>;
export type ModelSerializerParamsType<
  I extends ModelSerializer,
  M extends boolean = boolean,
  C = any,
  D extends SerializerType<I> | undefined = undefined,
  N extends boolean = boolean,
  R extends boolean = boolean,
  RO extends boolean = boolean,
  WO extends boolean = boolean,
  DR extends boolean = boolean,
  MO extends ReturnType<typeof models.Model> = ReturnType<typeof models.Model>,
  IN extends keyof ModelFields<InstanceType<MO>> = any,
  EX extends keyof ModelFields<InstanceType<MO>> = any
> = {
  instance?: M extends false
    ? ModelSerializerOutType<I, D, N, R, WO, MO, IN, EX>
    : ModelSerializerOutType<I, D, N, R, WO, MO, IN, EX>[];
  data?: M extends false
    ? ModelSerializerInType<I, D, N, R, RO, MO, IN, EX>
    : ModelSerializerInType<I, D, N, R, RO, MO, IN, EX>[];
  isDynamicRepresentation?: DR;
  engineName?: string;
} & SerializerParamsType<I, M, C, D, N, R, RO, WO>;

export type ModelSerializerParamsTypeForConstructor<
  I extends ModelSerializer,
  M extends boolean = boolean,
  C = any,
  N extends boolean = boolean,
  R extends boolean = boolean,
  RO extends boolean = boolean,
  WO extends boolean = boolean,
  DR extends boolean = boolean,
  MO extends ReturnType<typeof models.Model> = ReturnType<typeof models.Model>,
  IN extends keyof ModelFields<InstanceType<MO>> = any,
  EX extends keyof ModelFields<InstanceType<MO>> = any
> = {
  instance?: M extends false
    ? ModelSerializerOutType<I, any, N, R, WO, MO, IN, EX>
    : ModelSerializerOutType<I, any, N, R, WO, MO, IN, EX>[];
  data?: M extends false
    ? ModelSerializerInType<I, any, N, R, RO, MO, IN, EX>
    : ModelSerializerInType<I, any, N, R, RO, MO, IN, EX>[];
  isDynamicRepresentation?: DR;
  engineName?: string;
} & SerializerParamsTypeForConstructor<I, M, C, N, R, RO, WO>;

export type SerializerFieldsType<F extends Field = Field> = {
  [key: string]: F;
};

type Required<I> = {
  [K in keyof I as undefined[] extends I[K]
    ? never
    : undefined extends I[K]
    ? never
    : K]: I[K];
};
type Optional<I> = {
  [K in keyof I as undefined[] extends I[K]
    ? undefined extends I[K]
      ? K
      : never
    : never]?: I[K];
};

type FieldTypesOfSerializer<I extends Serializer> = {
  [K in keyof I['fields']]: I['fields'][K]['type'];
};
type InFieldTypesOfSerializer<I extends Serializer> = {
  [K in keyof I['fields']]: I['fields'][K]['inType'];
};
type OutFieldTypesOfSerializer<I extends Serializer> = {
  [K in keyof I['fields']]: I['fields'][K]['outType'];
};
type FieldsType<I extends Serializer> = Required<FieldTypesOfSerializer<I>> &
  Optional<FieldTypesOfSerializer<I>>;
type OutFieldsType<I extends Serializer> = Required<
  OutFieldTypesOfSerializer<I>
> &
  Optional<OutFieldTypesOfSerializer<I>>;
type InFieldsType<I extends Serializer> = Required<
  InFieldTypesOfSerializer<I>
> &
  Optional<InFieldTypesOfSerializer<I>>;

export type SerializerType<I extends Serializer> = FieldsType<I>;
export type InSerializerType<I extends Serializer> = {
  [K in keyof InFieldsType<I> as InFieldsType<I>[K] extends never
    ? never
    : K]: InFieldsType<I>[K];
};
export type OutSerializerType<I extends Serializer> = {
  [K in keyof OutFieldsType<I> as OutFieldsType<I>[K] extends never
    ? never
    : K]: OutFieldsType<I>[K];
};

export type ModelSerializerOptions<
  M extends ReturnType<typeof models.Model> = ReturnType<typeof models.Model>
> = {
  model: M;
  fields?: readonly (keyof ModelFields<InstanceType<M>>)[];
  excludes?: readonly (keyof ModelFields<InstanceType<M>>)[];
  dependsOn?: readonly ReturnType<typeof models.Model>[];
};

export type SerializerIn<S extends Serializer['inType']> = Exclude<
  S,
  undefined | null
>;
