import Field from './field';

import type { FieldDefaultParamsType, MaybeNull } from './types';
import type { This } from '../../types';

/**
 * Functional approach for the creation of an BigAutoField instance. An BigAutoField is a field that is used as the primary key of the database.
 *
 * A bigAuto field is similar to an AutoField, except that it should support bigger numbers.
 *
 * We recommend just using one BigAutoField per model (or BigAutoField) because you might face some issues with certain ORM's. For ALL use cases, this
 * field should be an integer.
 *
 * @example
 * ```ts
 * const bigAutoField = bigAuto();
 * ```
 *
 * @example
 * ```
 * const bigAutoField = bigAuto({ databaseName: 'user_id' });
 * ```
 */
export function bigAuto<
  TDefaultValue extends MaybeNull<BigAutoField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
>(
  params: Omit<
    FieldDefaultParamsType<BigAutoField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>,
    'primaryKey' | 'allowNull' | 'unique' | 'dbIndex' | 'isAuto'
  > = {}
) {
  return BigAutoField.new(params);
}

/**
 * We recommend just using one BigAutoField per model (or AutoField) because you might face some issues with certain ORM's. For ALL use cases, this
 * field should be an integer.
 *
 * A BigAutoField is similar to an AutoField, except that it should support bigger numbers.
 *
 * @example
 * ```ts
 * const bigAutoField = BigAutoField.new();
 * ```
 *
 * @example
 * ```
 * const bigAutoField = BigAutoField.new({ databaseName: 'user_id' });
 * ```
 */
export default class BigAutoField<
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
  TCustomAttributes = any,
> extends Field<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
  declare _type: TType;
  typeName: string = BigAutoField.name;

  /**
   * @deprecated Either use the `bigAuto` function or the `BigAutoField.new` static method. Never create an instance of this class directly.
   */
  constructor(
    params: Omit<
      FieldDefaultParamsType<BigAutoField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>,
      'defaultValue' | 'primaryKey' | 'allowNull' | 'unique' | 'dbIndex' | 'isAuto'
    > = {}
  ) {
    super({
      ...params,
      primaryKey: true,
      allowNull: false as TNull,
      unique: true as TUnique,
      dbIndex: true,
      isAuto: true as TAuto,
    });
  }

  // eslint-disable-next-line ts/require-await
  async toString(indentation = 0, customParams: string | undefined = undefined): Promise<string> {
    const ident = '  '.repeat(indentation);
    const fieldParamsIdent = '  '.repeat(indentation + 1);
    return (
      `${ident}models.fields.${this.constructor.name}.new({` +
      `${customParams ? `\n${customParams}` : ''}\n` +
      `${fieldParamsIdent}databaseName: "${this.databaseName}",\n` +
      `${fieldParamsIdent}underscored: ${this.underscored},\n` +
      `${fieldParamsIdent}customAttributes: ${JSON.stringify(this.customAttributes)}\n` +
      `${ident}})`
    );
  }

  /**
   * This method can be used to override the type of a field. This is useful for library maintainers that want to support the field type but the default type provided by palmares
   * is not the one that the database engine supports.
   *
   * @example
   * ```ts
   * const MyCustomDatabaseAutoField = BigAutoField.overrideType<string>();
   *
   * // then the user can use as normal:
   *
   * const bigAutoField = MyCustomDatabaseAutoField.new();
   *
   * // now the type inferred for the field will be a string instead of a number.
   * ```
   *
   * @example
   * ```ts
   * class MyCustomDatabaseEngineBigAutoFieldParser extends EngineBigAutoFieldParser {
   *    static getFieldClass() {
   *       return BigAutoField.overrideType<string>();
   *    }
   * }
   *
   * // then the user can use like:
   *
   * const bigAutoField = MyCustomDatabaseEngineBigAutoFieldParser.getFieldClass().new();
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
      >(
        params?: Omit<
          FieldDefaultParamsType<BigAutoField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>,
          'defaultValue' | 'primaryKey' | 'allowNull' | 'unique' | 'dbIndex' | 'isAuto'
        >
      ) => BigAutoField<TNewType, BigAutoField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;
    };
  }

  static new<
    TFieldInstance extends This<typeof BigAutoField>,
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
    TCustomAttributes = any,
  >(
    this: TFieldInstance,
    params:
      | Omit<
          FieldDefaultParamsType<
            InstanceType<TFieldInstance>,
            TDefaultValue,
            TUnique,
            TNull,
            TAuto,
            TDatabaseName,
            TCustomAttributes
          >,
          'defaultValue' | 'primaryKey' | 'allowNull' | 'unique' | 'dbIndex' | 'isAuto'
        >
      | FieldDefaultParamsType<
          InstanceType<TFieldInstance>,
          TDefaultValue,
          TUnique,
          TNull,
          TAuto,
          TDatabaseName,
          TCustomAttributes
        > = {}
  ) {
    return new this(params) as BigAutoField<
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
