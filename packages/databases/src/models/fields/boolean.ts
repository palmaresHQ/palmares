import { Field } from './field';

import type { FieldDefaultParamsType, MaybeNull } from './types';
import type { This } from '../../types';

/**
 * Functional approach for the creation of an Boolean field.
 *
 * A BooleanField is a field that can hold boolean values like true or false. Yeah, nothing special.
 *
 * @example
 * ```ts
 * const booleanField = bool();
 * ```
 *
 * @example
 * ```
 * const booleanField = bool({ defaultValue: false });
 * ```
 */
export function bool<
  TDefaultValue extends MaybeNull<BooleanField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any
>(
  params: FieldDefaultParamsType<
    BooleanField,
    TDefaultValue,
    TUnique,
    TNull,
    TAuto,
    TDatabaseName,
    TCustomAttributes
  > = {}
) {
  return BooleanField.new(params);
}

/**
 * A BooleanField is a field that can hold boolean values like true or false. Yeah, nothing special.
 *
 * @example
 * ```ts
 * const booleanField = BooleanField.new();
 * ```
 *
 * @example
 * ```
 * const booleanField = BooleanField.new({ defaultValue: false });
 * ```
 */
export class BooleanField<
  TType extends { input: boolean; output: boolean } = { input: boolean; output: boolean },
  TField extends Field = any,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any
> extends Field<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
  protected $$type = '$PBooleanField';
  declare _type: TType;
  typeName: string = BooleanField.name;

  /**
   * @deprecated Either use the `bool` function or the `BooleanField.new` static method.
   * Never create an instance of this class directly.
   */
  constructor(
    params: FieldDefaultParamsType<TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> = {}
  ) {
    super(params);
  }

  /**
   * This method can be used to override the type of a field. This is useful for library maintainers
   * that want to support the field type but the default type provided by palmares
   * is not the one that the database engine supports.
   *
   * @example
   * ```ts
   * const MyCustomDatabaseAutoField = BooleanField.overrideType<string>();
   *
   * // then the user can use as normal:
   *
   * const booleanField = MyCustomDatabaseAutoField.new();
   *
   * // now the type inferred for the field will be a BigInt instead of a number.
   * ```
   *
   * @example
   * ```ts
   * class MyCustomDatabaseEngineBooleanFieldParser extends EngineBooleanFieldParser {
   *    static getFieldClass() {
   *       return BooleanField.overrideType<BigInt>();
   *    }
   * }
   *
   * // then the user can use like:
   *
   * const booleanField = MyCustomDatabaseEngineBooleanFieldParser.getFieldClass().new();
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
        TDefaultValue extends MaybeNull<TNewType['input'], TNull> = undefined,
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
        params?: FieldDefaultParamsType<
          BooleanField,
          TDefaultValue,
          TUnique,
          TNull,
          TAuto,
          TDatabaseName,
          TCustomAttributes
        >
      ) => BooleanField<TNewType, BooleanField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;
    };
  }

  static new<
    TFieldInstance extends This<typeof BooleanField>,
    // eslint-disable-next-line no-shadow
    TDefaultValue extends MaybeNull<InstanceType<TFieldInstance>['_type']['input'] | undefined, TNull> = undefined,
    // eslint-disable-next-line no-shadow
    TUnique extends boolean = true,
    // eslint-disable-next-line no-shadow
    TNull extends boolean = false,
    // eslint-disable-next-line no-shadow
    TAuto extends boolean = true,
    // eslint-disable-next-line no-shadow
    TDatabaseName extends string | null | undefined = undefined,
    // eslint-disable-next-line no-shadow
    TCustomAttributes = any
  >(
    this: TFieldInstance,
    params: FieldDefaultParamsType<
      InstanceType<TFieldInstance>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes
    > = {}
  ) {
    return new this(params) as BooleanField<
      { input: boolean; output: boolean },
      InstanceType<TFieldInstance>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes
    >;
  }
}
