import { Field } from './field';

import type { DateFieldParamsType, MaybeNull } from './types';
import type { This } from '../../types';

/**
 * Functional approach for the creation of a DateField.
 *
 * A DateField is a field is used to store dates. It can be used to store dates and times or
 * just dates. It depends on the database engine.
 * We support both `Date` and `string` as the input and output types.
 *
 * @example
 * ```ts
 * const updatedAt = date({ autoNow: true });
 * ```
 *
 * @example
 * ```
 * const updatedAt = date({ autoNow: true });
 * const createdAt = date({ autoNowAdd: true });
 * ```
 */
export function date<
  TDefaultValue extends MaybeNull<DateField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
  TAutoNow extends boolean = false,
  TAutoNowAdd extends boolean = false
>(
  params: DateFieldParamsType<
    DateField,
    TDefaultValue,
    TUnique,
    TNull,
    TAutoNow extends true ? true : TAutoNowAdd extends true ? true : TAuto,
    TDatabaseName,
    TCustomAttributes,
    TAutoNow,
    TAutoNowAdd
  > = {}
) {
  return DateField.new(params);
}

/**
 * A DateField is a field is used to store dates. It can be used to store dates and times or
 * just dates. It depends on the database engine.
 * We support both `Date` and `string` as the input and output types.
 *
 * @example
 * ```ts
 * const updatedAt = DateField.new({ autoNow: true });
 * ```
 *
 * @example
 * ```
 * const updatedAt = DateField.new({ autoNow: true });
 * const createdAt = DateField.new({ autoNowAdd: true });
 * ```
 */
export class DateField<
  TType extends { input: string | Date; output: string | Date } = {
    input: string | Date;
    output: string | Date;
  },
  TField extends Field = any,
  TDefaultValue extends MaybeNull<Field['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
  TAutoNow extends boolean = false,
  TAutoNowAdd extends boolean = false
> extends Field<
  TType,
  TField,
  TDefaultValue,
  TUnique,
  TNull,
  TAutoNow extends true ? true : TAutoNowAdd extends true ? true : TAuto,
  TDatabaseName,
  TCustomAttributes
> {
  declare _type: TType;
  typeName: string = DateField.name;
  autoNow: TAutoNow;
  autoNowAdd: TAutoNowAdd;

  /**
   * @deprecated Either use the `date` function or the `DateField.new` static method.
   * Never create an instance of this class directly.
   */
  constructor(
    params: DateFieldParamsType<
      TField,
      TDefaultValue,
      TUnique,
      TNull,
      TAutoNow extends true ? true : TAutoNowAdd extends true ? true : TAuto,
      TDatabaseName,
      TCustomAttributes,
      TAutoNow,
      TAutoNowAdd
    > = {}
  ) {
    super(params);
    this.autoNow = params.autoNow || (false as TAutoNow);
    this.autoNowAdd = params.autoNowAdd || (false as TAutoNowAdd);
  }

  static new<
    // eslint-disable-next-line no-shadow
    TField extends This<typeof DateField>,
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
    TCustomAttributes = any,
    // eslint-disable-next-line no-shadow
    TAutoNow extends boolean = false,
    // eslint-disable-next-line no-shadow
    TAutoNowAdd extends boolean = false
  >(
    this: TField,
    params?: DateFieldParamsType<
      InstanceType<TField>,
      TDefaultValue,
      TUnique,
      TNull,
      TAutoNow extends true ? true : TAutoNowAdd extends true ? true : TAuto,
      TDatabaseName,
      TCustomAttributes,
      TAutoNow,
      TAutoNowAdd
    >
  ) {
    return new this(params) as DateField<
      {
        input: string | Date;
        output: string | Date;
      },
      InstanceType<TField>,
      TDefaultValue,
      TUnique,
      TNull,
      TAutoNow extends true ? true : TAutoNowAdd extends true ? true : TAuto,
      TDatabaseName,
      TCustomAttributes,
      TAutoNow,
      TAutoNowAdd
    >;
  }

  /**
   * This method can be used to override the type of a field. This is useful for library
   * maintainers that want to support the field type but the default type provided by palmares
   * is not the one that the database engine supports.
   *
   * @example
   * ```ts
   * const MyCustomDatabaseDateField = DateField.overrideType<string>();
   *
   * // then the user can use as normal:
   *
   * const DateField = MyCustomDatabaseDateField.new();
   *
   * // now the type inferred for the field will be a BigInt instead of a number.
   * ```
   *
   * @example
   * ```ts
   * class MyCustomDatabaseEngineDateFieldParser extends EngineDateFieldParser {
   *    static getFieldClass() {
   *       return DateField.overrideType<BigInt>();
   *    }
   * }
   *
   * // then the user can use like:
   *
   * const dateField = MyCustomDatabaseEngineDateFieldParser.getFieldClass().new();
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
        TCustomAttributes = any,
        // eslint-disable-next-line no-shadow
        TAutoNow extends boolean = false,
        // eslint-disable-next-line no-shadow
        TAutoNowAdd extends boolean = false
      >(
        params?: DateFieldParamsType<
          DateField,
          TDefaultValue,
          TUnique,
          TNull,
          TAutoNow extends true ? true : TAutoNowAdd extends true ? true : TAuto,
          TDatabaseName,
          TCustomAttributes
        >
      ) => DateField<
        TNewType,
        DateField,
        TDefaultValue,
        TUnique,
        TNull,
        TAutoNow extends true ? true : TAutoNowAdd extends true ? true : TAuto,
        TDatabaseName,
        TCustomAttributes,
        TAutoNow,
        TAutoNowAdd
      >;
    };
  }

  /**
   * This is mostly used internally by the engine to stringify the contents of the field
   * on migrations. But you can override this if you want to extend the DateField class.
   *
   * @example
   * ```
   * class CustomDateField extends DateField {
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
   * On this example, your custom DateField instance defines a `aCustomValue` property that will
   * be added on the migrations. It is useful if you have created a custom field and wants to
   * implement a custom logic during migrations.
   *
   * @param indentation - The number of spaces to use for indentation. Use `'  '.repeat(indentation + 1);`
   * @param customParams - Custom parameters to append to the stringified field.
   *
   * @returns The stringified field.
   */
  async toString(indentation = 0, _customParams: string | undefined = undefined) {
    const ident = '  '.repeat(indentation + 1);
    return super.toString(indentation, `${ident}autoNow: ${this.autoNow},\n${ident}autoNowAdd: ${this.autoNowAdd},`);
  }

  /**
   * This is used internally by the engine to compare if the field is equal to another field.
   * You can override this if you want to extend the DateField class.
   *
   * @example
   * ```
   * class CustomDateField extends DateField {
   *   aCustomValue: string;
   *
   *   async compare(field:Field) {
   *      const fieldAsText = field as TextField;
   *      const isCustomValueEqual = fieldAsText.aCustomValue === this.aCustomValue;
   *      const [isEqual, changedAttributes] = await super.compare(field);
   *      if (!isCustomValueEqual) changedAttributes.push('aCustomValue');
   *      return [isCustomValueEqual && isEqual, changedAttributes]
   *   }
   * }
   * ```
   *
   * @param field - The field to compare.
   *
   * @returns A promise that resolves to a tuple containing a boolean and the changed attributes.
   */
  async compare(field: Field): Promise<[boolean, string[]]> {
    const fieldAsDate = field as DateField;
    const isAutoNowEqual = fieldAsDate.autoNow === this.autoNow;
    const isAutoNowAddEqual = fieldAsDate.autoNowAdd === this.autoNowAdd;
    const [isEqual, changedAttributes] = await super.compare(field);

    if (!isAutoNowEqual) changedAttributes.push('autoNow');
    if (!isAutoNowAddEqual) changedAttributes.push('autoNowAdd');
    return [isAutoNowEqual && isAutoNowAddEqual && isEqual, changedAttributes];
  }

  /**
   * This is used internally by the engine for cloning the field to a new instance. By doing that
   * you are able to get the constructor options of the field.
   *
   * @example
   * ```
   * class CustomDateField extends DateField {
   *  aCustomValue: string;
   *
   * async constructorOptions(field?: DateField) {
   *   if (!field) field = this as DateField;
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
  async constructorOptions(field?: DateField) {
    if (!field) field = this as DateField;
    const defaultConstructorOptions = await super.constructorOptions(field);
    return {
      ...defaultConstructorOptions,
      autoNow: field.autoNow,
      autoNowAdd: field.autoNowAdd
    };
  }
}
