import Field from './field';

import type { FieldDefaultParamsType, MaybeNull } from './types';
import type { This } from '../../types';

/**
 * Functional approach for the creation of an BigInt field.
 *
 * A BigInt field is a field that is used to store big integers. On your database it should store only big numbers.
 *
 * @example
 * ```ts
 * const bigIntField = bigInt();
 * ```
 *
 * @example
 * ```
 * const bigIntField = bigInt({ defaultValue: 2 });
 * ```
 */
export function bigInt<
  TDefaultValue extends MaybeNull<BigIntegerField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any
>(
  params: FieldDefaultParamsType<
    BigIntegerField,
    TDefaultValue,
    TUnique,
    TNull,
    TAuto,
    TDatabaseName,
    TCustomAttributes
  > = {}
) {
  return BigIntegerField.new(params);
}

/**
 * A BigIntegerField is similar to an IntegerField, except that it should support bigger numbers.
 *
 * @example
 * ```ts
 * const bigIntegerField = BigIntegerField.new();
 * ```
 *
 * @example
 * ```
 * const bigIntegerField = BigIntegerField.new({ databaseName: 'user_id' });
 * ```
 */
export default class BigIntegerField<
  TType extends { input: bigint | number; output: bigint | number } = {
    input: bigint | number;
    output: bigint | number;
  },
  TField extends Field = any,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any
> extends Field<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
  declare _type: TType;
  typeName: string = BigIntegerField.name;

  /**
   * @deprecated Either use the `bigInt` function or the `BigInteger.new` static method.
   * Never create an instance of this class directly.
   */
  constructor(
    params: FieldDefaultParamsType<
      BigIntegerField,
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
   * This method can be used to override the type of a field. This is useful for library maintainers
   * that want to support the field type but the default type provided by palmares
   * is not the one that the database engine supports.
   *
   * @example
   * ```ts
   * const MyCustomDatabaseAutoField = BigIntegerField.overrideType<string>();
   *
   * // then the user can use as normal:
   *
   * const bigIntegerField = MyCustomDatabaseAutoField.new();
   *
   * // now the type inferred for the field will be a BigInt instead of a number.
   * ```
   *
   * @example
   * ```ts
   * class MyCustomDatabaseEngineBigIntegerFieldParser extends EngineBigIntegerFieldParser {
   *    static getFieldClass() {
   *       return BigIntegerField.overrideType<BigInt>();
   *    }
   * }
   *
   * // then the user can use like:
   *
   * const bigIntegerField = MyCustomDatabaseEngineBigIntegerFieldParser.getFieldClass().new();
   * ```
   *
   * ### Note
   *
   * Your library should provide documentation of the fields that are supported.
   */
  static overrideType<TNewType extends { input: number | bigint; output: number | bigint }>() {
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
          BigIntegerField,
          TDefaultValue,
          TUnique,
          TNull,
          TAuto,
          TDatabaseName,
          TCustomAttributes
        >
      ) => BigIntegerField<
        TNewType,
        BigIntegerField,
        TDefaultValue,
        TUnique,
        TNull,
        TAuto,
        TDatabaseName,
        TCustomAttributes
      >;
    };
  }

  /**
   * @param params - The parameters that will be used to create the BigIntegerField instance.
   * @param params.primaryKey - Specifies if this field should be considered the primary key of
   * the model. (default: false)
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
   * @param params.databaseName - The name of the field on the database. If this is not set, we
   * will use either the field name or the underscored version of the field name.
   * @param params.customAttributes - Custom attributes that will be passed to the field for the engine to use.
   */
  static new<
    TFieldInstance extends This<typeof BigIntegerField>,
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
    return new this(params) as BigIntegerField<
      { input: bigint | number; output: bigint | number },
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
