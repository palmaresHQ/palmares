import { Field } from './field';

import type { MaybeNull, TextFieldParamsType } from './types';
import type { This } from '../../types';

/**
 * Functional approach for the creation of a TextField.
 *
 * A TextField is a field that is used to hold string. On Relational Databases that would be
 * a `TEXT` field. Different from CharField it does not have a maximum length.
 *
 * @example
 * ```ts
 * const charField = text();
 * ```
 *
 * @example
 * ```
 * const charField = char({ defaultValue: false });
 * ```
 */
export function text<
  TDefaultValue extends MaybeNull<TextField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any
>(params: TextFieldParamsType<TextField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> = {}) {
  return TextField.new(params);
}

/**
 * A TextField is a field that is used to hold string. On Relational Databases that would be
 * a `TEXT` field. Different from CharField it does not have a maximum length.
 *
 * @example
 * ```ts
 * const textField = TextField.new();
 * ```
 *
 * @example
 * ```
 * const textField = TextField.new({ defaultValue: false });
 * ```
 */
export class TextField<
  TType extends { input: string; output: string } = { input: string; output: string },
  TField extends Field = any,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any
> extends Field<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
  protected $$type = '$PTextField';
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
    // eslint-disable-next-line no-shadow
    TField extends This<typeof TextField>,
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

  /**
   * This is mostly used internally by the engine to stringify the contents of the field
   * on migrations. But you can override this if you want to extend the TextField class.
   *
   * @example
   * ```
   * class CustomTextField extends TextField {
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
   * On this example, your custom TextField instance defines a `aCustomValue` property that
   * will be added on the migrations. It is useful if you have created a custom field and wants to
   * implement a custom logic during migrations.
   *
   * @param indentation - The number of spaces to use for indentation. Use `'  '.repeat(indentation + 1);`
   * @param customParams - Custom parameters to append to the stringified field.
   *
   * @returns The stringified field.
   */
  async toString(indentation = 0, customParams: string | undefined = undefined) {
    const ident = '  '.repeat(indentation + 1);
    const customParamsString = customParams ? `\n${customParams}` : '';
    return super.toString(indentation, `${ident}allowBlank: ${this.allowBlank},` + customParamsString);
  }

  /**
   * This is used internally by the engine to compare if the field is equal to another field.
   * You can override this if you want to extend the TextField class.
   *
   * @example
   * ```
   * class CustomTextField extends TextField {
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
    const fieldAsText = field as TextField;
    const isAllowBlankEqual = fieldAsText.allowBlank === this.allowBlank;
    const [isEqual, changedAttributes] = await super.compare(field);

    if (!isAllowBlankEqual) changedAttributes.push('allowBlank');
    return [isAllowBlankEqual && isEqual, changedAttributes];
  }

  /**
   * This is used internally by the engine for cloning the field to a new instance. By doing that
   * you are able to get the constructor options of the field.
   *
   * @example
   * ```
   * class CustomTextField extends TextField {
   *  aCustomValue: string;
   *
   * async constructorOptions(field?: TextField) {
   *   if (!field) field = this as TextField;
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
  async constructorOptions(field?: TextField) {
    if (!field) field = this as TextField;
    const defaultConstructorOptions = await super.constructorOptions(field);
    return {
      ...defaultConstructorOptions,
      allowBlank: field.allowBlank
    };
  }

  /**
   * This method can be used to override the type of a field. This is useful for library
   * maintainers that want to support the field type but the default type provided by palmares
   * is not the one that the user want to use.
   *
   * @example
   * ```ts
   * const MyCustomDatabaseAutoField = AutoField.overrideType<{ input: string; output: string }>();
   *
   * // then the user can use as normal:
   *
   * const autoField = MyCustomDatabaseAutoField.new();
   *
   * // now the type inferred for the field will be a string instead of a number.
   * ```
   *
   * ### Note
   *
   * Your library should provide documentation of the fields that are supported.
   */
  static overrideType<TNewType extends { input: any; output: any }, TCustomAttributes>() {
    return this as unknown as {
      new: <
        // eslint-disable-next-line no-shadow
        TDefaultValue extends MaybeNull<TextField['_type']['input'] | undefined, TNull> = undefined,
        // eslint-disable-next-line no-shadow
        TUnique extends boolean = false,
        // eslint-disable-next-line no-shadow
        TNull extends boolean = false,
        // eslint-disable-next-line no-shadow
        TAuto extends boolean = false,
        // eslint-disable-next-line no-shadow
        TDatabaseName extends string | null | undefined = undefined
      >(
        params?: TextFieldParamsType<Field, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>
      ) => TextField<TNewType, Field, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;
    };
  }
}
