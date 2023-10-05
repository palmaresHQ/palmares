import Field from './field';
import type { FieldDefaultParamsType } from './types';
import type { This } from '../../types';

/**
 * BooleanField is a field that is used to store boolean values.
 */
export default class BooleanField<
  TField extends Field = any,
  TDefaultValue extends TNull extends true
    ? TField['_type'] | undefined | null
    : TField['_type'] | undefined = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  CA = any
> extends Field<TField, TDefaultValue, TUnique, TNull, TAuto, CA> {
  declare _type: boolean;
  typeName: string = BooleanField.name;

  constructor(params: FieldDefaultParamsType<TField, TDefaultValue, TUnique, TNull, TAuto, CA> = {}) {
    super(params);
  }

  static new<
    TFieldInstance extends This<typeof BooleanField>,
    TDefaultValue extends TNull extends true
      ? InstanceType<TFieldInstance>['_type'] | undefined | null
      : InstanceType<TFieldInstance>['_type'] | undefined = undefined,
    TUnique extends boolean = true,
    TNull extends boolean = false,
    TAuto extends boolean = true,
    CA = any
  >(
    this: TFieldInstance,
    params: FieldDefaultParamsType<InstanceType<TFieldInstance>, TDefaultValue, TUnique, TNull, TAuto, CA> = {}
  ) {
    return new this(params) as BooleanField<InstanceType<TFieldInstance>, TDefaultValue, TUnique, TNull, TAuto, CA>;
  }
}
