import Field from './field';
import type { This } from '../../types';
import type { TextFieldParamsType } from './types';

export default class TextField<
  TType extends { input: any; output: any } = { input: string; output: string },
  TField extends Field = any,
  TDefaultValue extends TNull extends true
    ? TField['_type']['input'] | undefined | null
    : TField['_type']['input'] | undefined = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
> extends Field<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
  declare _type: TType;
  typeName: string = TextField.name;
  allowBlank: boolean;

  constructor(
    params: TextFieldParamsType<TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>
  ) {
    super(params);
    this.allowBlank = typeof params.allowBlank === 'boolean' ? params.allowBlank : true;
  }

  static new<
    TField extends This<typeof TextField>,
    TDefaultValue extends TNull extends true
      ? InstanceType<TField>['_type']['input'] | undefined | null
      : InstanceType<TField>['_type']['input'] | undefined = undefined,
    TUnique extends boolean = false,
    TNull extends boolean = false,
    TAuto extends boolean = false,
    TDatabaseName extends string | null | undefined = undefined,
    TCustomAttributes = any,
  >(
    this: TField,
    params: TextFieldParamsType<
      InstanceType<TField>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes
    > = {}
  ) {
    return new this(params) as TextField<
      { input: string; output: string },
      InstanceType<TField>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes
    >;
  }

  async toString(indentation = 0, customParams: string | undefined = undefined) {
    const ident = '  '.repeat(indentation + 1);
    const customParamsString = customParams ? `\n${customParams}` : '';
    return super.toString(indentation, `${ident}allowBlank: ${this.allowBlank},` + customParamsString);
  }

  async compare(field: Field): Promise<boolean> {
    const fieldAsText = field as TextField;
    return (await super.compare(field)) && fieldAsText.allowBlank === this.allowBlank;
  }

  async constructorOptions(field?: TextField) {
    if (!field) field = this as TextField;
    const defaultConstructorOptions = await super.constructorOptions(field);
    return {
      ...defaultConstructorOptions,
      allowBlank: field.allowBlank,
    };
  }
}
