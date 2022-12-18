import Field from './field';
import type { FieldDefaultParamsType } from './types';
import type { This } from '../../types';

export default class IntegerField<
  F extends Field = any,
  D extends N extends true
    ? F['type'] | undefined | null
    : F['type'] | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any
> extends Field<F, D, U, N, A, CA> {
  type!: number;
  typeName: string = IntegerField.name;

  constructor(params: FieldDefaultParamsType<F, D, U, N, A, CA> = {}) {
    super(params);
  }

  static new<
    I extends This<typeof IntegerField>,
    D extends N extends true
      ? InstanceType<I>['type'] | undefined | null
      : InstanceType<I>['type'] | undefined = undefined,
    U extends boolean = false,
    N extends boolean = false,
    A extends boolean = false,
    CA = any
  >(
    this: I,
    params: FieldDefaultParamsType<InstanceType<I>, D, U, N, A, CA> = {}
  ) {
    return new this(params) as IntegerField<InstanceType<I>, D, U, N, A, CA>;
  }
}
