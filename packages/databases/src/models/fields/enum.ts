import Field, { UnopinionatedField } from './field';

import type { EnumFieldParamsType, MaybeNull } from './types';
import type { This } from '../../types';
import type { Narrow } from '@palmares/core';

/**
 * Functional approach for the creation of a EnumField. We are not able to call it `enum` because it is a reserved keyword so we chose choices.
 *
 * A EnumField is really a ChoiceField. It is used to store one or more choices of values a column can have. With this field you can limit the values a column can have.
 * A text field will store a string, any string. By using enum you can narrow down the options.
 *
 * @example
 * ```ts
 * const status = choice({ choices: ['active', 'inactive', 'in-progress'] });
 * ```
 */
export function choice<
  TDefaultValue extends MaybeNull<TEnumChoices[number] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
  TEnumChoices extends string[] | Narrow<string[]> = string[],
>(
  params: EnumFieldParamsType<
    EnumField,
    TDefaultValue,
    TUnique,
    TNull,
    TAuto,
    TDatabaseName,
    TCustomAttributes,
    TEnumChoices
  >
) {
  return EnumField.new(params);
}

/**
 * A EnumField is really a ChoiceField. It is used to store one or more choices of values a column can have. With this field you can limit the values a column can have.
 * A text field will store a string, any string. By using enum you can narrow down the options.
 *
 * @example
 * ```ts
 * const status = EnumField.new({ choices: ['active', 'inactive', 'in-progress'] });
 * ```
 */
export default class EnumField<
  TType extends { input: TEnumChoices[number]; output: TEnumChoices[number] } = {
    input: string;
    output: string;
  },
  TField extends Field = any,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
  TEnumChoices extends string[] = string[],
> extends UnopinionatedField<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
  declare _type: TType;
  choices: TEnumChoices;
  typeName: string = EnumField.name;

  constructor(
    params: EnumFieldParamsType<
      TField,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes,
      TEnumChoices
    >
  ) {
    super(params);
    this.choices = params.choices as TEnumChoices;
  }

  static new<
    TField extends This<typeof EnumField>,
    TDefaultValue extends MaybeNull<TEnumChoices[number] | undefined, TNull> = undefined,
    TUnique extends boolean = false,
    TNull extends boolean = false,
    TAuto extends boolean = false,
    TDatabaseName extends string | null | undefined = undefined,
    TCustomAttributes = any,
    TEnumChoices extends string[] | Narrow<string[]> = string[],
  >(
    this: TField,
    params: EnumFieldParamsType<
      InstanceType<TField>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes,
      TEnumChoices
    >
  ) {
    return new this(params as any) as EnumField<
      { input: TEnumChoices[number]; output: TEnumChoices[number] },
      InstanceType<TField>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes,
      TEnumChoices
    >;
  }

  /**
   * This method can be used to override the type of a field. This is useful for library maintainers that want to support the field type but the default type provided by palmares
   * is not the one that the database engine supports.
   *
   * @example
   * ```ts
   * const MyCustomDatabaseEnumField = EnumField.overrideType<string>();
   *
   * // then the user can use as normal:
   *
   * const enumField = MyCustomDatabaseEnumField.new();
   *
   * // now the type inferred for the field will be a BigInt instead of a number.
   * ```
   *
   * @example
   * ```ts
   * class MyCustomDatabaseEngineEnumFieldParser extends EngineEnumFieldParser {
   *    static getFieldClass() {
   *       return EnumField.overrideType<BigInt>();
   *    }
   * }
   *
   * // then the user can use like:
   *
   * const enumField = MyCustomDatabaseEngineEnumFieldParser.getFieldClass().new();
   * ```
   *
   * ### Note
   *
   * Your library should provide documentation of the fields that are supported.
   */
  static overrideType<TNewType extends { input: any; output: any }>() {
    return this as unknown as {
      new: <
        TDefaultValue extends MaybeNull<TNewType['input'] | undefined, TNull> = undefined,
        TUnique extends boolean = false,
        TNull extends boolean = false,
        TAuto extends boolean = false,
        TDatabaseName extends string | null | undefined = undefined,
        TCustomAttributes = any,
        TEnumChoices extends string[] = string[],
      >(
        params: EnumFieldParamsType<
          EnumField,
          TDefaultValue,
          TUnique,
          TNull,
          TAuto,
          TDatabaseName,
          TCustomAttributes,
          TEnumChoices
        >
      ) => EnumField<
        TNewType,
        EnumField,
        TDefaultValue,
        TUnique,
        TNull,
        TAuto,
        TDatabaseName,
        TCustomAttributes,
        TEnumChoices
      >;
    };
  }

  /**
   * Return the string representation of the contents of this field. This is used internally by the framework to generate the migrations.
   *
   * @example
   * ```
   * class CustomEnumField extends EnumField {
   *   aCustomValue: string;
   *
   *   async toString(indentation = 0, customParams: string | undefined = undefined) {
   *    const ident = '  '.repeat(indentation + 1);
   *    const customParamsString = customParams ? `\n${customParams}` : '';
   *    return super.toString(indentation, `${ident}aCustomValue: ${this.aCustomValue},` + `${customParamsString}`);
   *   }
   * }
   * ```
   *
   * On this example, your custom EnumField instance defines a `aCustomValue` property that will be added on the migrations. It is useful if you have created a custom field and wants to
   * implement a custom logic during migrations.
   *
   * @param indentation - The number of spaces to use for indentation.
   * @param _customParams - Custom parameters to add to the string representation.
   *
   * @returns The string representation of the field.
   */
  async toString(indentation = 0, _customParams: string | undefined = undefined) {
    const ident = '  '.repeat(indentation + 1);
    return super.toString(indentation, `${ident}choices: [${this.choices.map((choice) => `'${choice}'`).join(', ')}],`);
  }

  /**
   * This is used internally by the engine to compare if the field is equal to another field. You can override this if you want to extend the EnumField class.
   *
   * @example
   * ```
   * class CustomEnumField extends EnumField {
   *   aCustomValue: string;
   *
   *   async compare(field:Field) {
   *      return (await super.compare(field)) && fieldAsText.aCustomValue === this.aCustomValue;
   *   }
   * }
   * ```
   *
   * @param field - The field to compare.
   *
   * @returns A promise that resolves to a boolean indicating if the field is equal to the other field.
   */
  async compare(field: Field): Promise<boolean> {
    const fieldAsEnum = field as EnumField<any, any, any, any, any, any, any>;
    return (await super.compare(field)) && JSON.stringify(this.choices) === JSON.stringify(fieldAsEnum.choices);
  }

  /**
   * This is used internally by the engine for cloning the field to a new instance. By doing that you are able to get the constructor options of the field.
   *
   * @example
   * ```
   * class CustomEnumField extends EnumField {
   *  aCustomValue: string;
   *
   * async constructorOptions(field?: EnumField) {
   *   if (!field) field = this as EnumField;
   *   const defaultConstructorOptions = await super.constructorOptions(field);
   *   return {
   *     ...defaultConstructorOptions,
   *     aCustomValue: field.aCustomValue,
   *   };
   * }
   * ```
   *
   * @param field - The field to get the constructor options from. If not provided it will use the current field.
   *
   * @returns The constructor options of the field.
   */
  async constructorOptions(field?: Field) {
    if (!field) field = this as Field;
    const defaultConstructorOptions = await super.constructorOptions(field);
    return {
      ...defaultConstructorOptions,
      choices: (field as unknown as EnumField).choices,
    };
  }
}
