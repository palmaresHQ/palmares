import { Field } from './field';

import type { FieldDefaultParamsType, MaybeNull } from './types';
import type { This } from '../../types';

/**
 * Functional approach for the creation of an Integer field.
 *
 * A integer field is a field that is used to store integers. On your database it should store
 * only INTEGER numbers. For decimals/float use Decimal.
 *
 * @example
 * ```ts
 * const integerField = integer();
 * ```
 *
 * @example
 * ```
 * const integerField = integer({ defaultValue: 2 });
 * ```
 */
export function integer<
  TDefaultValue extends MaybeNull<IntegerField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any
>(
  params: FieldDefaultParamsType<
    IntegerField,
    TDefaultValue,
    TUnique,
    TNull,
    TAuto,
    TDatabaseName,
    TCustomAttributes
  > = {}
) {
  return IntegerField.new(params);
}

/**
 * A IntegerField is similar to an IntegerField, except that it should support bigger numbers.
 *
 * @example
 * ```ts
 * const IntegerField = IntegerField.new();
 * ```
 *
 * @example
 * ```
 * const IntegerField = IntegerField.new({ databaseName: 'user_id' });
 * ```
 */
export class IntegerField<
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
> extends Field<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
  protected $$type = '$PIntegerField';
  declare _type: TType;
  typeName: string = IntegerField.name;

  /**
   * @deprecated Either use the `integer` function or the `IntegerField.new` static method.
   * Never create an instance of this class directly.
   */
  constructor(
    params: FieldDefaultParamsType<
      IntegerField,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes
    > = {}
  ) {
    super(params);
  }

  /**
   * This method can be used to override the type of a field. This is useful for library
   * maintainers that want to support the field type but the default type provided by palmares
   * is not the one that the database engine supports.
   *
   * @example
   * ```ts
   * const MyCustomDatabaseIntegerField = IntegerField.overrideType<string>();
   *
   * // then the user can use as normal:
   *
   * const integerField = MyCustomDatabaseIntegerField.new();
   *
   * // now the type inferred for the field will be a string instead of a number.
   * ```
   *
   * @example
   * ```ts
   * class MyCustomDatabaseEngineIntegerFieldParser extends EngineIntegerFieldParser {
   *    static getFieldClass() {
   *       return IntegerField.overrideType<BigInt>();
   *    }
   * }
   *
   * // then the user can use like:
   *
   * const integerField = MyCustomDatabaseEngineIntegerFieldParser.getFieldClass().new();
   * ```
   *
   * ### Note
   *
   * Your library should provide documentation of the fields that are supported.
   */
  static overrideType<TNewType extends { input: number; output: number }>() {
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
        params?: FieldDefaultParamsType<
          IntegerField,
          TDefaultValue,
          TUnique,
          TNull,
          TAuto,
          TDatabaseName,
          TCustomAttributes
        >
      ) => IntegerField<TNewType, IntegerField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;
    };
  }

  /**
   * @param params - The parameters that will be used to create the IntegerField instance.
   * @param params.primaryKey - Specifies if this field should be considered the primary key of the
   * model. (default: false)
   * @param params.defaultValue - The default value for this field. (default: undefined)
   * @param params.allowNull - If this field can be null or not. (default: false)
   * @param params.unique - If this field should be unique or not. (default: false)
   * @param params.isAuto - An auto field is automatically incremented by the database engine. (default: false)
   * @param params.dbIndex - On relational database we can create an index. This specifies if we
   * should create an index for this field on the database (default: false).
   * Be aware, this is mostly for relational databases.
   * @param params.underscored - If the field name should be underscored on the database or not.
   * Like `firstName` will be converted to `first_name` on the database.
   * This is ignored if `databaseName` is set. (default: true)
   * @param params.databaseName - The name of the field on the database. If this is not set, we will
   * use either the field name or the underscored version of the field name.
   * @param params.customAttributes - Custom attributes that will be passed to the field for the engine to use.
   */
  static new<
    TFieldInstance extends This<typeof IntegerField>,
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
    return new this(params) as IntegerField<
      { input: number; output: number },
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
