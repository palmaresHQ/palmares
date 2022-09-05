import Field from "./field";
import { FieldType, InFieldType, NumberFieldParamsType, OutFieldType } from "./types";
import { This } from "../types";
import Schema from "../schema";

export default class NumberField<
  I extends NumberField = any,
  D extends I["type"] | undefined = undefined,
  N extends boolean = false,
  R extends boolean = true,
  RO extends boolean = boolean,
  WO extends boolean = boolean,
  C = any
> extends Field<I, D, N, R, RO, WO, C> {

  type!: FieldType<number, N, R, D>;
  inType!: InFieldType<this["type"], RO>;
  outType!: OutFieldType<this["type"], WO>;

  allowNegative = true;
  allowPositive = true;
  allowZero = true;
  isInteger = false;
  max?: number;
  min?: number;
  maxDigits?: number;
  decimalPlaces?: number;

  constructor(params: NumberFieldParamsType<I, D, N, R, RO, WO> = {}) {
    super(params);

    const isMaxLengthDefined = typeof params.max === 'number';
    const isMinLengthDefined = typeof params.min === 'number';
    const isMaxDigitsDefined = typeof params.maxDigits === 'number';
    const isDecimalPlacesDefined = typeof params.decimalPlaces === 'number';
    const isAllowNegativeDefined = typeof params.allowNegative === 'boolean';
    const isAllowPositiveDefined = typeof params.allowPositive === 'boolean';
    const isAllowZeroDefined = typeof params.allowZero === 'boolean';
    const isIntegerDefined = typeof params.isInteger === 'boolean';

    if (isAllowNegativeDefined) this.allowNegative = params.allowNegative as boolean;
    if (isAllowPositiveDefined) this.allowPositive = params.allowPositive as boolean;
    if (isAllowZeroDefined) this.allowZero = params.allowZero as boolean;
    if (isMaxLengthDefined) this.max = params.max;
    if (isMinLengthDefined) this.min = params.min;
    if (isMaxDigitsDefined) this.maxDigits = params.maxDigits;
    if (isDecimalPlacesDefined) this.decimalPlaces = params.decimalPlaces;
    if (isIntegerDefined) this.isInteger = params.isInteger as boolean;

    this.errorMessages = {
      invalid: 'Not a valid number',
      maxValue: `Ensure this value is less than or equal to ${this.max}.`,
      minValue: `Ensure this value is less than or equal to ${this.min}.`,
      maxDigits: `The number should not contain more than ${this.maxDigits} digits.`,
      decimalPlaces: `Ensure that there are no more than ${this.decimalPlaces} decimal `+
                    ` places (maximum of ${this.decimalPlaces} values after the '.').`,
      zero: 'The value cannot be 0 (zero).',
      negative: 'The value cannot be negative.',
      positive: 'The value cannot be positive.',
      integer: 'The value must be an integer.',
      ...this.errorMessages,
    }
  }

  static new<
    I extends This<typeof NumberField>,
    D extends number | undefined = undefined,
    N extends boolean = false,
    R extends boolean = true,
    RO extends boolean = boolean,
    WO extends boolean = boolean,
    C = any
  >(
    this: I,
    params: NumberFieldParamsType<InstanceType<I>, D, N, R, RO, WO> = {}
  ) {
    return new this(params) as NumberField<InstanceType<I>,D, N, R, RO, WO, C>;
  }

  async schema<S extends Schema>(isIn = true, schema?: S): Promise<ReturnType<S["getNumber"]>> {
    await super.schema(isIn, schema);
    const schemaToUse = this._schema as S;
    return schemaToUse.getNumber(this);
  }

  async validate(data: any) {
    await super.validate(data);

    const isDataNull = data === null;
    if (isDataNull) return;

    const isDataNotANumber = typeof data !== 'number';
    if (isDataNotANumber) await this.fail('invalid');

    const isAboveMaxValue = typeof this.max === 'number' && data > this.max;
    if (isAboveMaxValue) await this.fail('maxValue');

    const isBelowMinValue = typeof this.min === 'number' && data < this.min;
    if (isBelowMinValue) await this.fail('minValue');

    const isNegative = this.allowNegative === false && data < 0;
    if (isNegative) await this.fail('negative');

    const isPositive = this.allowPositive === false && data > 0;
    if (isPositive) await this.fail('positive');

    const isZero = this.allowZero === false && data === 0;
    if (isZero) await this.fail('zero');

    const isInteger = this.isInteger === true && !Number.isInteger(data);
    if (isInteger) await this.fail('integer');

    const isMaxDigitsExceeded = typeof this.maxDigits === 'number' &&
      data.toString().length > this.maxDigits;
    if (isMaxDigitsExceeded) await this.fail('maxDigits');

    const isDecimalPlacesExceeded = typeof this.decimalPlaces === 'number' &&
      data.toString().split('.')[1]?.length > this.decimalPlaces;
    if (isDecimalPlacesExceeded) await this.fail('decimalPlaces');
  }

  async toInternal(data: this["inType"])  {
    return super.toInternal(data, (data) => Number(data));
  }

  async toRepresentation(data: this["outType"]) {
    return super.toRepresentation(data, (data) => Number(data)) ;
  }
}
