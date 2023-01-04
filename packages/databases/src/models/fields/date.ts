import Field from './field';
import type { This } from '../../types';
import type { DateFieldParamsType } from './types';

export default class DateField<
  F extends Field = any,
  D extends N extends true
    ? F['type'] | undefined | null
    : F['type'] | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any,
  AN extends boolean = false,
  ANA extends boolean = false
> extends Field<
  F,
  D,
  U,
  N,
  AN extends true ? true : ANA extends true ? true : A,
  CA
> {
  type!: Date;
  typeName: string = DateField.name;
  autoNow: AN;
  autoNowAdd: ANA;

  constructor(
    params: DateFieldParamsType<
      F,
      D,
      U,
      N,
      AN extends true ? true : ANA extends true ? true : A,
      CA,
      AN,
      ANA
    > = {}
  ) {
    super(params);
    this.autoNow = params.autoNow || (false as AN);
    this.autoNowAdd = params.autoNowAdd || (false as ANA);
  }

  static new<
    I extends This<typeof DateField>,
    D extends N extends true
      ? InstanceType<I>['type'] | undefined | null
      : InstanceType<I>['type'] | undefined = undefined,
    U extends boolean = false,
    N extends boolean = false,
    A extends boolean = false,
    CA = any,
    AN extends boolean = false,
    ANA extends boolean = false
  >(
    this: I,
    params?: DateFieldParamsType<
      InstanceType<I>,
      D,
      U,
      N,
      AN extends true ? true : ANA extends true ? true : A,
      CA,
      AN,
      ANA
    >
  ) {
    return new this(params) as DateField<
      InstanceType<I>,
      D,
      U,
      N,
      AN extends true ? true : ANA extends true ? true : A,
      CA,
      AN,
      ANA
    >;
  }

  async toString(
    indentation = 0,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    customParams: string | undefined = undefined
  ) {
    const ident = '  '.repeat(indentation + 1);
    return super.toString(
      indentation,
      `${ident}autoNow: ${this.autoNow},\n${ident}autoNowAdd: ${this.autoNowAdd}`
    );
  }

  async compare(field: Field): Promise<boolean> {
    const fieldAsDate = field as DateField;
    return (
      (await super.compare(field)) &&
      fieldAsDate.autoNow === this.autoNow &&
      fieldAsDate.autoNowAdd === this.autoNowAdd
    );
  }
}
