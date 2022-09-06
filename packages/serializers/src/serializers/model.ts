import { ModelFields, models } from '@palmares/databases';
import { Serializer } from ".";
import type {
  SerializerType,
  SerializerFieldsType,
  InSerializerType,
  OutSerializerType,
  SerializerParamsTypeForConstructor,
  SerializerParamsType,
  ModelSerializerOptions
} from "./types";
import type { This } from '../types';
import type { FieldType, InFieldType, OutFieldType } from '../fields/types';
import { InvalidModelOnModelSerializerError } from '../exceptions';

export default class ModelSerializer<
  I extends ModelSerializer = any,
  M extends boolean = boolean,
  C = any,
  D extends SerializerType<I> | undefined = undefined,
  N extends boolean = boolean,
  R extends boolean = boolean,
  RO extends boolean = boolean,
  WO extends boolean = boolean,
  MO extends ReturnType<typeof models.Model<MO>> = ReturnType<typeof models.Model>,
  IN extends keyof ModelFields<InstanceType<MO>> = any,
  EX extends keyof ModelFields<InstanceType<MO>> = any,

> extends Serializer<I, M, C, D, N, R, RO, WO> {
  type!: FieldType<SerializerType<I>, N, R, D>;
  inType!: M extends true ? InFieldType<FieldType<InSerializerType<I>, N, R, D>, RO>[] : InFieldType<FieldType<InSerializerType<I>, N, R, D>, RO>;
  outSerializerType!: OutFieldType<FieldType<OutSerializerType<I>, N, R, D> & Pick<ModelFields<InstanceType<MO>>, IN> & Omit<ModelFields<InstanceType<MO>>, EX>, WO>;
  outType!: M extends true ? this["outSerializerType"][] : this["outSerializerType"];

  fields = {} as SerializerFieldsType;
  options = {} as ModelSerializerOptions<MO>;

  constructor(params: SerializerParamsTypeForConstructor<I, M, C, N, R, RO, WO> = {}) {
    super(params);
    const isModelNotDefined = !(this.options.model instanceof models.BaseModel);
    if (isModelNotDefined) throw new InvalidModelOnModelSerializerError(this.constructor.name, this.options.model);
  }

  static new<
    I extends This<typeof Serializer>,
    M extends boolean = false,
    C = any,
    D extends SerializerType<InstanceType<I>> | undefined = undefined,
    N extends boolean = false,
    R extends boolean = true,
    RO extends boolean = false,
    WO extends boolean = false,
  >(
    this: I,
    params: SerializerParamsType<InstanceType<I>, M extends boolean ? M : boolean, C, D, N, R, RO, WO> = {}
  ) {
    return new this(params) as ModelSerializer<
      InstanceType<I>,
      M, C, D, N, R, RO, WO,
      InstanceType<I>["options"]["model"],
      InstanceType<I>["options"]["fields"][number],
      InstanceType<I>["options"]["excludes"][number]
      >;
  }
}
