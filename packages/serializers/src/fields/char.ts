import Field from './field';
import { CharFieldParamsType, InFieldType, OutFieldType, FieldType } from './types';
import { This } from "../types"
import { Schema } from '..';

export default class CharField<
  I extends CharField = any,
  D extends I["type"] | undefined = undefined,
  N extends boolean = false,
  R extends boolean = true,
  RO extends boolean = boolean,
  WO extends boolean = boolean,
  C = any
> extends Field<I, D, N, R, RO, WO, C> {

  type!: FieldType<string, N, R, D>;
  inType!: InFieldType<this["type"], RO>;
  outType!: OutFieldType<this["type"], WO>;

  minLength?: number;
  maxLength?: number;
  allowBlank: boolean;

  constructor(params: CharFieldParamsType<I, D, N, R, RO, WO> = {}) {
    super(params);

    const isAllowBlankABoolean = typeof params.allowBlank === 'boolean';
    const isMinLengthDefined = typeof params.minLength === 'number';
    const isMaxLengthDefined = typeof params.maxLength === 'number';

    this.allowBlank = isAllowBlankABoolean ? params.allowBlank as boolean : false;
    if (isMaxLengthDefined) this.maxLength = params.maxLength;
    if (isMinLengthDefined) this.minLength = params.minLength;

    this.errorMessages = {
      invalid: 'Not a valid string',
      maxLength: `Make sure this field is not logger than ${params.maxLength} character(s) long.`,
      minLength: `Make sure this field is at least ${params.minLength} character(s) long.`,
      blank: 'The field cannot be blank',
      ...this.errorMessages,
    }
  }

  static new<
    I extends This<typeof CharField>,
    D extends string | undefined = undefined,
    N extends boolean = false,
    R extends boolean = true,
    RO extends boolean = boolean,
    WO extends boolean = boolean,
    C = any
  >(
    this: I,
    params: CharFieldParamsType<InstanceType<I>, D, N, R, RO, WO> = {}
  ) {
    return new this(params) as CharField<InstanceType<I>,D, N, R, RO, WO, C>;
  }

  async schema<S extends Schema>(isIn = true, schema?: S): Promise<ReturnType<S["getChar"]>> {
    await super.schema(isIn, schema);
    const schemaToUse = this._schema as S;
    return schemaToUse.getChar(this);
  }

  async validate(data: any) {
    await super.validate(data);

    const isDataNull = data === null;
    if (isDataNull) return;

    const isDataNotAString = typeof data !== 'string';
    if (isDataNotAString) await this.fail('invalid');

    const isLengthAboveMaxLength = this.maxLength && data.length > this.maxLength;
    if (isLengthAboveMaxLength) await this.fail('maxLength');

    const isLengthBelowMinLength = this.minLength && data.length < this.minLength;
    if (isLengthBelowMinLength) await this.fail('maxLength');

    const isBlank = this.allowBlank === false && data === '';
    if (isBlank) await this.fail('blank')
  }

  async toInternal(data: this["inType"])  {
    return super.toInternal(data, (data) => data.toString());
  }

  async toRepresentation(data: this["outType"]) {
    return super.toRepresentation(data, (data) => data.toString()) ;
  }

}
