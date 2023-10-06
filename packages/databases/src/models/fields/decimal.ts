import Field from './field';
import type { This } from '../../types';
import type { DecimalFieldParamsType, MaybeNull } from './types';

export default class DecimalField<
  TType extends { input: number; output: number } = {
    input: number;
    output: number;
  },
  TField extends Field = any,
  TDefaultValue extends MaybeNull<Field['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
> extends Field<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
  declare _type: TType;
  typeName: string = DecimalField.name;
  maxDigits: number;
  decimalPlaces: number;

  /**
   * @deprecated Either use the `decimal` function or the `DecimalField.new` static method. Never create an instance of this class directly.
   */
  constructor(
    params: DecimalFieldParamsType<TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>
  ) {
    super(params);
    this.maxDigits = params.maxDigits;
    this.decimalPlaces = params.decimalPlaces;
  }

  static new<
    TField extends This<typeof DecimalField>,
    TDefaultValue extends MaybeNull<InstanceType<TField>['_type']['input'] | undefined, TNull> = undefined,
    TUnique extends boolean = false,
    TNull extends boolean = false,
    TAuto extends boolean = false,
    TDatabaseName extends string | null | undefined = undefined,
    TCustomAttributes = any,
  >(
    this: TField,
    params: DecimalFieldParamsType<
      InstanceType<TField>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes
    >
  ) {
    return new this(params) as DecimalField<
      { input: number; output: number },
      InstanceType<TField>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes
    >;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async toString(indentation = 0, _ = '') {
    const ident = '  '.repeat(indentation + 1);
    return super.toString(
      indentation,
      `${ident}maxDigits: ${this.maxDigits},\n` + `${ident}decimalPlaces: ${this.decimalPlaces},`
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

  async constructorOptions(field?: DecimalField) {
    if (!field) field = this as DecimalField;
    const defaultConstructorOptions = await super.constructorOptions(field);
    return {
      ...defaultConstructorOptions,
      maxDigits: field.maxDigits,
      decimalPlaces: field.decimalPlaces,
    };
  }
}
