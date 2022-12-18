import Field from './field';
import type { This } from '../../types';
import type { DecimalFieldParamsType } from './types';

export default class DecimalField<
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
  typeName: string = DecimalField.name;
  maxDigits: number;
  decimalPlaces: number;

  constructor(params: DecimalFieldParamsType<F, D, U, N, A, CA>) {
    super(params);
    this.maxDigits = params.maxDigits;
    this.decimalPlaces = params.decimalPlaces;
  }

  static new<
    I extends This<typeof DecimalField>,
    D extends N extends true
      ? InstanceType<I>['type'] | undefined | null
      : InstanceType<I>['type'] | undefined = undefined,
    U extends boolean = false,
    N extends boolean = false,
    A extends boolean = false,
    CA = any
  >(this: I, params: DecimalFieldParamsType<InstanceType<I>, D, U, N, A, CA>) {
    return new this(params) as DecimalField<InstanceType<I>, D, U, N, A, CA>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async toString(indentation = 0, _ = '') {
    const ident = '  '.repeat(indentation + 1);
    return super.toString(
      indentation,
      `${ident}maxDigits: ${this.maxDigits},\n` +
        `${ident}decimalPlaces: ${this.decimalPlaces}`
    );
  }

  async compare(field: Field): Promise<boolean> {
    const fieldAsDecimal = field as DecimalField;
    return (
      (await super.compare(field)) &&
      fieldAsDecimal.maxDigits === this.maxDigits &&
      fieldAsDecimal.decimalPlaces === this.decimalPlaces
    );
  }
}
