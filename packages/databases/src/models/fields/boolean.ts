import Field from './field';
import type { FieldDefaultParamsType } from './types';
import type { This } from '../../types';

/**
 * BooleanField is a field that is used to store boolean values.
 */
export default class BooleanField<
  TField extends Field = any,
  TDefaultValue extends TNull extends true ? TField['type'] | undefined | null : TField['type'] | undefined = undefined,
  TUnique extends boolean = true,
  TNull extends boolean = false,
  TAuto extends boolean = true,
  CA = any
> extends Field<TField, TDefaultValue, TUnique, TNull, TAuto, CA> {
  declare type: boolean;
  typeName: string = BooleanField.name;

  constructor(params: FieldDefaultParamsType<TField, TDefaultValue, TUnique, TNull, TAuto, CA> = {}) {
    super({
      ...params,
      primaryKey: true,
      allowNull: false as TNull,
      unique: true as TUnique,
      dbIndex: true,
      isAuto: true as TAuto,
    });
  }

  static new<
    I extends This<typeof BooleanField>,
    D extends N extends true
      ? InstanceType<I>['type'] | undefined | null
      : InstanceType<I>['type'] | undefined = undefined,
    U extends boolean = true,
    N extends boolean = false,
    A extends boolean = true,
    CA = any
  >(this: I, params: FieldDefaultParamsType<InstanceType<I>, D, U, N, A, CA> = {}) {
    return new this(params) as BooleanField<InstanceType<I>, D, U, N, A, CA>;
  }
}
