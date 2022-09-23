import Field from './field';
import {
  BooleanFieldParamsType,
  InFieldType,
  OutFieldType,
  FieldType,
} from './types';
import { This } from '../types';
import Schema from '../schema';

export default class BooleanField<
  I extends BooleanField = any,
  D extends I['type'] | undefined = undefined,
  N extends boolean = false,
  R extends boolean = true,
  RO extends boolean = boolean,
  WO extends boolean = boolean,
  C = any,
  T extends readonly any[] = ['true', 'True', 1, 'yes'],
  F extends readonly any[] = ['false', 'False', 0, 'no']
> extends Field<I, D, N, R, RO, WO, C> {
  type!: FieldType<
    boolean | typeof this['truthy'][number] | typeof this['falsy'][number],
    N,
    R,
    D
  >;
  inType!: InFieldType<this['type'], RO>;
  outType!: OutFieldType<this['type'], WO>;

  truthy!: T;
  falsy!: F;

  constructor(params: BooleanFieldParamsType<I, T, F, D, N, R, RO, WO> = {}) {
    super(params);

    const isTruthyDefined = Array.isArray(params.truthy);
    if (isTruthyDefined) this.truthy = params.truthy as T;
    else {
      const defaultTruthyValues: readonly any[] = ['true', 'True', 1, 'yes'];
      this.truthy = defaultTruthyValues as T;
    }

    const isFalsyDefined = Array.isArray(params.falsy);
    if (isFalsyDefined) this.falsy = params.falsy as F;
    else {
      const defaultFalsyValues: readonly any[] = ['false', 'False', 0, 'no'];
      this.falsy = defaultFalsyValues as F;
    }

    this.errorMessages = {
      invalid: 'Not a valid boolean, a valid truthy or a valid falsy value.',
      ...this.errorMessages,
    };
  }

  static new<
    I extends This<typeof BooleanField>,
    D extends boolean | undefined = undefined,
    N extends boolean = false,
    R extends boolean = true,
    RO extends boolean = boolean,
    WO extends boolean = boolean,
    C = any,
    T extends readonly any[] = ['true', 'True', 1, 'yes'],
    F extends readonly any[] = ['false', 'False', 0, 'no']
  >(
    this: I,
    params: BooleanFieldParamsType<InstanceType<I>, T, F, D, N, R, RO, WO> = {}
  ) {
    return new this(params) as BooleanField<
      InstanceType<I>,
      D,
      N,
      R,
      RO,
      WO,
      C,
      T,
      F
    >;
  }

  async schema<S extends Schema>(
    isIn = true,
    schema?: S
  ): Promise<ReturnType<S['getNumber']>> {
    await super.schema(isIn, schema);
    const schemaToUse = this._schema as S;
    return schemaToUse.getBool(this);
  }

  async validate(data: any) {
    await super.validate(data);

    const isDataNull = data === null;
    if (isDataNull) return;

    const isDataABoolean = typeof data === 'boolean';
    if (isDataABoolean) return;

    const isDataNotATruthyOrFalsyValue =
      [...this.truthy, ...this.falsy].includes(data) === false;
    if (isDataNotATruthyOrFalsyValue) await this.fail('invalid');
  }

  async toInternal(data: this['inType']) {
    return super.toInternal(data, (data) => {
      const isDataATruthyValue = this.truthy.includes(data);
      if (isDataATruthyValue) return true;

      const isDataAFalsyValue = this.falsy.includes(data);
      if (isDataAFalsyValue) return false;

      return data;
    });
  }

  async toRepresentation(data: this['outType']) {
    return super.toRepresentation(data, (data) => {
      const isDataATruthyValue = this.truthy.includes(data);
      if (isDataATruthyValue) return true;

      const isDataAFalsyValue = this.falsy.includes(data);
      if (isDataAFalsyValue) return false;

      return data;
    });
  }
}
