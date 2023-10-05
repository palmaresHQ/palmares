import Field from './field';

import type { Narrow } from '@palmares/core';
import type { EnumFieldParamsType } from './types';
import type { This } from '../../types';

export default class EnumField<
  TField extends Field = any,
  TDefaultValue extends TNull extends true
    ? TField['_type'] | undefined | null
    : TField['_type'] | undefined = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  CA = any,
  TEnumChoices extends string[] = string[]
> extends Field<TField, TDefaultValue, TUnique, TNull, TAuto, CA> {
  declare _type: TEnumChoices extends string[] | readonly string[] | Narrow<string[]> ? TEnumChoices[number] : never;
  choices: TEnumChoices;
  typeName: string = EnumField.name;

  constructor(params: EnumFieldParamsType<TField, TDefaultValue, TUnique, TNull, TAuto, CA, TEnumChoices>) {
    super(params);
    this.choices = params.choices as any;
  }

  async toString(indentation = 0, _customParams: string | undefined = undefined) {
    const ident = '  '.repeat(indentation + 1);
    return super.toString(indentation, `${ident}choices: [${this.choices.map((choice) => `'${choice}'`).join(', ')}],`);
  }

  async compare(field: Field): Promise<boolean> {
    const fieldAsEnum = field as EnumField<any, any, any, any, any, any, any>;
    return (await super.compare(field)) && JSON.stringify(this.choices) === JSON.stringify(fieldAsEnum.choices);
  }

  async constructorOptions(field?: Field) {
    if (!field) field = this as Field;
    const defaultConstructorOptions = await super.constructorOptions(field);
    return {
      ...defaultConstructorOptions,
      choices: (field as unknown as EnumField).choices,
    };
  }

  static new<
    TFieldInstance extends This<typeof EnumField>,
    TDefaultValue extends TNull extends true
      ? InstanceType<TFieldInstance>['_type'] | undefined | null
      : InstanceType<TFieldInstance>['_type'] | undefined = undefined,
    TUnique extends boolean = false,
    TNull extends boolean = false,
    TAuto extends boolean = false,
    CA = any,
    TEnumChoices extends string[] = string[]
  >(
    this: TFieldInstance,
    params: EnumFieldParamsType<InstanceType<TFieldInstance>, TDefaultValue, TUnique, TNull, TAuto, CA, TEnumChoices>
  ) {
    return new this(params) as EnumField<
      InstanceType<TFieldInstance>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      CA,
      TEnumChoices
    >;
  }
}
