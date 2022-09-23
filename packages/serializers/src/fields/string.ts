import Field from './field';
import {
  CharFieldParamsType,
  InFieldType,
  OutFieldType,
  FieldType,
} from './types';
import { This } from '../types';
import { emailRegex, ERR_INVALID_URL, uuidRegex } from '../utils';
import Schema from '../schema';

export default class StringField<
  I extends StringField = any,
  D extends I['type'] | undefined = undefined,
  N extends boolean = false,
  R extends boolean = true,
  RO extends boolean = boolean,
  WO extends boolean = boolean,
  C = any
> extends Field<I, D, N, R, RO, WO, C> {
  type!: FieldType<string, N, R, D>;
  inType!: InFieldType<this['type'], RO>;
  outType!: OutFieldType<this['type'], WO>;

  minLength?: number;
  maxLength?: number;
  allowBlank: boolean;
  regex?: RegExp;
  isURL = false;

  constructor(params: CharFieldParamsType<I, D, N, R, RO, WO> = {}) {
    super(params);

    const isAllowBlankABoolean = typeof params.allowBlank === 'boolean';
    const isMinLengthDefined = typeof params.minLength === 'number';
    const isMaxLengthDefined = typeof params.maxLength === 'number';

    this.allowBlank = isAllowBlankABoolean
      ? (params.allowBlank as boolean)
      : false;
    if (params.isEmail) this.regex = emailRegex;
    if (params.isUUID) this.regex = uuidRegex;

    if (params.isUrl) this.isURL = params.isUrl;
    if (this.regex) this.regex = params.regex;
    if (isMaxLengthDefined) this.maxLength = params.maxLength;
    if (isMinLengthDefined) this.minLength = params.minLength;

    this.errorMessages = {
      invalid: 'Not a valid string',
      invalidRegex: `The string is not valid because it does not match the regex: ${this.regex}`,
      invalidUrl: 'The value provided is not a valid url',
      maxLength: `Make sure this field is not logger than ${this.maxLength} character(s) long.`,
      minLength: `Make sure this field is at least ${this.minLength} character(s) long.`,
      blank: 'The field cannot be blank',
      ...this.errorMessages,
    };
  }

  static new<
    I extends This<typeof StringField>,
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
    return new this(params) as StringField<InstanceType<I>, D, N, R, RO, WO, C>;
  }

  async schema<S extends Schema>(
    isIn = true,
    schema?: S
  ): Promise<ReturnType<S['getString']>> {
    await super.schema(isIn, schema);
    const schemaToUse = this._schema as S;
    return schemaToUse.getString(this);
  }

  async validate(data: any) {
    await super.validate(data);

    const isDataNull = data === null;
    if (isDataNull) return;

    const isDataNotAString = typeof data !== 'string';
    if (isDataNotAString) await this.fail('invalid');

    const isLengthAboveMaxLength =
      this.maxLength && data.length > this.maxLength;
    if (isLengthAboveMaxLength) await this.fail('maxLength');

    const isLengthBelowMinLength =
      this.minLength && data.length < this.minLength;
    if (isLengthBelowMinLength) await this.fail('maxLength');

    const isInvalidBlank = this.allowBlank === false && data === '';
    if (isInvalidBlank) await this.fail('blank');

    const isNotBlank = !(this.allowBlank === true && data === '');
    if (isNotBlank && this.isURL) {
      try {
        new URL(data);
      } catch (e) {
        const error = e as any;
        if (error.code === ERR_INVALID_URL) {
          await this.fail('invalidUrl');
        } else {
          throw e;
        }
      }
    }

    if (isNotBlank && this.regex && !this.regex.test(data))
      await this.fail('invalidRegex');
  }

  async toInternal(data: this['inType']) {
    return super.toInternal(data, (data) => data.toString());
  }

  async toRepresentation(data: this['outType']) {
    return super.toRepresentation(data, (data) => data.toString());
  }
}
