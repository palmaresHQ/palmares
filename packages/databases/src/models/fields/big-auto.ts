import Field from './field';
import type { FieldDefaultParamsType } from './types';
import type { This } from '../../types';

/**
 * Same as the `AutoField` except that this is a big integer field so it accepts bigger numbers.
 * By default it is an auto-incrementing integer field, it is the primary key and it is unique.
 */
export default class BigAutoField<
  F extends Field = any,
  D extends N extends true ? F['type'] | undefined | null : F['type'] | undefined = undefined,
  U extends boolean = true,
  N extends boolean = false,
  A extends boolean = true,
  CA = any
> extends Field<F, D, U, N, A, CA> {
  declare type: number;
  typeName: string = BigAutoField.name;

  constructor(params: FieldDefaultParamsType<F, D, U, N, A, CA> = {}) {
    super({
      ...params,
      primaryKey: true,
      allowNull: false as N,
      unique: true as U,
      dbIndex: true,
      isAuto: true as A,
    });
  }

  static new<
    I extends This<typeof BigAutoField>,
    D extends N extends true
      ? InstanceType<I>['type'] | undefined | null
      : InstanceType<I>['type'] | undefined = undefined,
    U extends boolean = true,
    N extends boolean = false,
    A extends boolean = true,
    CA = any
  >(this: I, params: FieldDefaultParamsType<InstanceType<I>, D, U, N, A, CA> = {}) {
    return new this(params) as BigAutoField<InstanceType<I>, D, U, N, A, CA>;
  }
}
