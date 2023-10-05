import Field from './field';
import type { FieldDefaultParamsType } from './types';
import type { This } from '../../types';

/**
 * This is similar to an Integer Field except that it is the `id` of the database.
 * By default it is an auto-incrementing integer field, it is the primary key and it is unique.
 */
export default class AutoField<
  F extends Field = any,
  D extends N extends true ? F['_type'] | undefined | null : F['_type'] | undefined = undefined,
  U extends boolean = true,
  N extends boolean = false,
  A extends boolean = true,
  CA = any
> extends Field<F, D, U, N, A, CA> {
  declare _type: number;
  typeName: string = AutoField.name;

  constructor(params: FieldDefaultParamsType<F, D, U, N, A, CA>) {
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
    I extends This<typeof AutoField>,
    D extends N extends true
      ? InstanceType<I>['_type'] | undefined | null
      : InstanceType<I>['_type'] | undefined = undefined,
    U extends boolean = true,
    N extends boolean = false,
    A extends boolean = true,
    CA = any
  >(this: I, params: FieldDefaultParamsType<InstanceType<I>, D, U, N, A, CA> = {}) {
    return new this(params) as AutoField<InstanceType<I>, D, U, N, A, CA>;
  }
}
