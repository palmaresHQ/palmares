import { TextField } from './text';

import type { Field } from './field';
import type { CharFieldParamsType, MaybeNull } from './types';
import type { This } from '../../types';

/**
 * Functional approach for the creation of a CharField.
 *
 * A CharField is a field that can hold Character values. On Relational Databases that would be a `VARCHAR` field.
 * A varchar should have a maximum length, so you should always define a `maxLength` for this field.
 *
 * @example
 * ```ts
 * const charField = char();
 * ```
 *
 * @example
 * ```
 * const charField = char({ defaultValue: false });
 * ```
 */
export function char<
  TDefaultValue extends MaybeNull<TextField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any
>(
  params: CharFieldParamsType<CharField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> = {
    maxLength: 255,
    allowBlank: true
  }
) {
  return CharField.new(params);
}

/**
 * A CharField is a field that can hold Character values. On Relational Databases that would be a `VARCHAR` field.
 * A varchar should have a maximum length, so you should always define a `maxLength` for this field.
 *
 * @example
 * ```ts
 * const charField = CharField.new({ maxLength: 255 });
 * ```
 *
 * @example
 * ```
 * const charField = CharField.new({ maxLength: 140, defaultValue: false });
 * ```
 */
export class CharField<
  TType extends { input: string; output: string } = { input: string; output: string },
  TField extends Field = any,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any
> extends TextField<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
  protected $$type = '$PCharField';
  declare _type: TType;
  typeName: string = CharField.name;
  maxLength: number;

  /**
   * @deprecated Either use the `char` function or the `CharField.new` static method.
   * Never create an instance of this class directly.
   */
  constructor(
    params: CharFieldParamsType<TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> = {
      maxLength: 255,
      allowBlank: true
    }
  ) {
    super(params);

    const maxLength = typeof params.maxLength === 'number' ? params.maxLength : 255;
    const defaultValueAsString = params.defaultValue as string;
    const defaultValueAsNull = params.defaultValue as string | null;
    const isDefaultValueDefined: boolean =
      (defaultValueAsString === 'string' && defaultValueAsString.length <= maxLength) || defaultValueAsNull === null;

    this.defaultValue = isDefaultValueDefined ? params.defaultValue : undefined;
    this.maxLength = maxLength;
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
    params: CharFieldParamsType<
      InstanceType<TField>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes
    > = {
      maxLength: 255,
      allowBlank: true
    }
  ) {
    return new this(params) as CharField<
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
   * This method can be used to override the type of a field. This is useful for library maintainers
   * that want to support the field type but the default type provided by palmares
   * is not the one that the database engine supports.
   *
   * @example
   * ```ts
   * const MyCustomDatabaseCharField = CharField.overrideType<string>();
   *
   * // then the user can use as normal:
   *
   * constcCharField = MyCustomDatabaseCharField.new();
   *
   * // now the type inferred for the field will be a BigInt instead of a number.
   * ```
   *
   * @example
   * ```ts
   * class MyCustomDatabaseEngineCharFieldParser extends EngineCharFieldParser {
   *    static getFieldClass() {
   *       return CharField.overrideType<BigInt>();
   *    }
   * }
   *
   * // then the user can use like:
   *
   * const charField = MyCustomDatabaseEngineCharFieldParser.getFieldClass().new();
   * ```
   *
   * ### Note
   *
   * Your library should provide documentation of the fields that are supported.
   */
  static overrideType<TNewType extends { input: any; output: any }>() {
    return this as unknown as {
      new: <
        TFieldInstance extends This<typeof CharField>,
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
        params?: CharFieldParamsType<CharField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>
      ) => CharField<TNewType, CharField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;
    };
  }

  /**
   * This is mostly used internally by the engine to stringify the contents of the field on
   * migrations. But you can override this if you want to extend the CharField class.
   *
   * @example
   * ```
   * class CustomCharField extends CharField {
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
   * On this example, your custom CharField instance defines a `aCustomValue` property that will
   * be added on the migrations. It is useful if you have created a custom field and wants to
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
    return super.toString(indentation, `${ident}maxLength: ${this.maxLength},` + `${customParamsString}`);
  }

  /**
   * This is used internally by the engine to compare if the field is equal to another field.
   * You can override this if you want to extend the CharField class.
   *
   * @example
   * ```
   * class CustomCharField extends CharField {
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
    const fieldAsText = field as CharField;
    const isMaxLengthEqual = fieldAsText.maxLength === this.maxLength;
    const [isEqual, changedAttributes] = await super.compare(field);

    if (!isMaxLengthEqual) changedAttributes.push('maxLength');
    return [isMaxLengthEqual && isEqual, changedAttributes];
  }

  /**
   * This is used internally by the engine for cloning the field to a new instance. By doing
   * that you are able to get the constructor options of the field.
   *
   * @example
   * ```
   * class CustomCharField extends CharField {
   *  aCustomValue: string;
   *
   * async constructorOptions(field?: CharField) {
   *   if (!field) field = this as CharField;
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
  async constructorOptions(field?: CharField) {
    if (!field) field = this as CharField;
    const defaultConstructorOptions = await super.constructorOptions(field);
    return {
      ...defaultConstructorOptions,
      allowBlank: field.allowBlank
    };
  }
}
