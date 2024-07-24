import { UnopinionatedField } from './field';

import type Field from './field';
import type { DecimalFieldParamsType, MaybeNull } from './types';
import type { This } from '../../types';

/**
 * Functional approach for the creation of a DecimalField.
 *
 * A DecimalField is a field is used to store decimal values. WHY DON'T WE JUST USE NUMBERS?
 * Because of floating point precision. We need to guarantee floating point precision
 * when a user uses this field.
 *
 * @example
 * ```ts
 * const amount = decimal({ maxDigits: 10, decimalPlaces: 2 });
 * ```
 */
export function decimal<
  TDefaultValue extends MaybeNull<DecimalField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any
>(
  params: DecimalFieldParamsType<DecimalField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>
) {
  return DecimalField.new(params);
}

/**
 * A DecimalField is a field is used to store decimal values. WHY DON'T WE JUST USE NUMBERS?
 * Because of floating point precision. We need to guarantee floating point precision
 * when a user uses this field.
 *
 * @example
 * ```ts
 * const amount = DecimalField.new({ maxDigits: 10, decimalPlaces: 2 });
 * ```
 */
export default class DecimalField<
  TType extends { input: number; output: number } = {
    input: number;
    output: number;
  },
  TField extends Field = any,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any
> extends UnopinionatedField<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
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

  /**
   * This method can be used to override the type of a field. This is useful for library maintainers that want to support the field type but the default type provided by palmares
   * is not the one that the database engine supports.
   *
   * @example
   * ```ts
   * const MyCustomDatabaseDecimalField = DecimalField.overrideType<string>();
   *
   * // then the user can use as normal:
   *
   * const decimalField = MyCustomDatabaseDecimalField.new();
   *
   * // now the type inferred for the field will be a BigInt instead of a number.
   * ```
   *
   * @example
   * ```ts
   * class MyCustomDatabaseEngineDecimalFieldParser extends EngineDecimalFieldParser {
   *    static getFieldClass() {
   *       return DecimalField.overrideType<BigInt>();
   *    }
   * }
   *
   * // then the user can use like:
   *
   * const decimalField = MyCustomDatabaseEngineDecimalFieldParser.getFieldClass().new();
   * ```
   *
   * ### Note
   *
   * Your library should provide documentation of the fields that are supported.
   */
  static overrideType<TNewType extends { input: any; output: any }>() {
    return this as unknown as {
      new: <
        // eslint-disable-next-line no-shadow
        TDefaultValue extends MaybeNull<TNewType['input'] | undefined, TNull> = undefined,
        // eslint-disable-next-line no-shadow
        TUnique extends boolean = false,
        // eslint-disable-next-line no-shadow
        TNull extends boolean = false,
        // eslint-disable-next-line no-shadow
        TAuto extends boolean = false,
        // eslint-disable-next-line no-shadow
        TDatabaseName extends string | null | undefined = undefined,
        // eslint-disable-next-line no-shadow
        TCustomAttributes = any
      >(
        params: DecimalFieldParamsType<
          DecimalField,
          TDefaultValue,
          TUnique,
          TNull,
          TAuto,
          TDatabaseName,
          TCustomAttributes
        >
      ) => DecimalField<TNewType, DecimalField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;
    };
  }

  static new<
    // eslint-disable-next-line no-shadow
    TField extends This<typeof DecimalField>,
    // eslint-disable-next-line no-shadow
    TDefaultValue extends MaybeNull<InstanceType<TField>['_type']['input'] | undefined, TNull> = undefined,
    // eslint-disable-next-line no-shadow
    TUnique extends boolean = false,
    // eslint-disable-next-line no-shadow
    TNull extends boolean = false,
    // eslint-disable-next-line no-shadow
    TAuto extends boolean = false,
    // eslint-disable-next-line no-shadow
    TDatabaseName extends string | null | undefined = undefined,
    // eslint-disable-next-line no-shadow
    TCustomAttributes = any
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

  /**
   * This is mostly used internally by the engine to stringify the contents of the field on migrations. But you can override this if you want to extend the DecimalField class.
   *
   * @example
   * ```
   * class CustomDecimalField extends DecimalField {
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
   * On this example, your custom DecimalField instance defines a `aCustomValue` property that will be added on the migrations. It is useful if
   * you have created a custom field and wants to implement a custom logic during migrations.
   *
   * @param indentation - The number of spaces to use for indentation. Use `'  '.repeat(indentation + 1);`
   * @param customParams - Custom parameters to append to the stringified field.
   *
   * @returns The stringified field.
   */
  async toString(indentation = 0, _ = '') {
    const ident = '  '.repeat(indentation + 1);
    return super.toString(
      indentation,
      `${ident}maxDigits: ${this.maxDigits},\n` + `${ident}decimalPlaces: ${this.decimalPlaces},`
    );
  }

  /**
   * This is used internally by the engine to compare if the field is equal to another field. You can override this if you want to extend the DecimalField class.
   *
   * @example
   * ```
   * class CustomDecimalField extends DecimalField {
   *   aCustomValue: string;
   *
   *   compare(field:Field) {
   *      const fieldAsText = field as TextField;
   *      const isCustomValueEqual = fieldAsText.aCustomValue === this.aCustomValue;
   *      const [isEqual, changedAttributes] = super.compare(field);
   *      if (!isCustomValueEqual) changedAttributes.push('aCustomValue');
   *      return [isCustomValueEqual && isEqual, changedAttributes]
   *   }
   * }
   * ```
   *
   * @param field - The field to compare.
   *
   * @returns A promise that resolves to a boolean indicating if the field is equal to the other field.
   */
  compare(field: Field): [boolean, string[]] {
    const fieldAsDate = field as DecimalField;
    const isMaxDigitsEqual = fieldAsDate.maxDigits === this.maxDigits;
    const isDecimalPlacesEqual = fieldAsDate.decimalPlaces === this.decimalPlaces;
    const [isEqual, changedAttributes] = super.compare(field);

    if (!isMaxDigitsEqual) changedAttributes.push('maxDigits');
    if (!isDecimalPlacesEqual) changedAttributes.push('decimalPlaces');
    return [isMaxDigitsEqual && isDecimalPlacesEqual && isEqual, changedAttributes];
  }

  /**
   * This is used internally by the engine for cloning the field to a new instance. By doing that you are able to get the constructor options of the field.
   *
   * @example
   * ```
   * class CustomDecimalField extends DecimalField {
   *  aCustomValue: string;
   *
   * async constructorOptions(field?: DecimalField) {
   *   if (!field) field = this as DecimalField;
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
  async constructorOptions(field?: DecimalField) {
    if (!field) field = this as DecimalField;
    const defaultConstructorOptions = await super.constructorOptions(field);
    return {
      ...defaultConstructorOptions,
      maxDigits: field.maxDigits,
      decimalPlaces: field.decimalPlaces
    };
  }
}
