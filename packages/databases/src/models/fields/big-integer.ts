import Field from './field';
import type { FieldDefaultParamsType } from './types';
import type { This } from '../../types';

export default class BigIntegerField<
  F extends Field = any,
  D extends N extends true ? F['_type'] | undefined | null : F['_type'] | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any
> extends Field<F, D, U, N, A, CA> {
  declare _type: number;
  typeName: string = BigIntegerField.name;

  constructor(params: FieldDefaultParamsType<F, D, U, N, A, CA> = {}) {
    super(params);
  }

  static new<
    I extends This<typeof BigIntegerField>,
    D extends N extends true
      ? InstanceType<I>['_type'] | undefined | null
      : InstanceType<I>['_type'] | undefined = undefined,
    U extends boolean = false,
    N extends boolean = false,
    A extends boolean = false,
    CA = any
  >(this: I, params: FieldDefaultParamsType<InstanceType<I>, D, U, N, A, CA> = {}) {
    return new this(params) as BigIntegerField<InstanceType<I>, D, U, N, A, CA>;
  }
}
