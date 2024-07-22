import Field from './field';

import type { FieldDefaultParamsType, MaybeNull } from './types';
import type { This } from '../../types';

/**
 * Functional approach for the creation of an AutoField instance. An AutoField is a field that is used as the primary key of the database.
 *
 * We recommend just using one AutoField per model (or BigAutoField) because you might face some issues with certain ORM's. For ALL use cases, this
 * field should be an integer.
 *
 * @example
 * ```ts
 * const autoField = auto();
 * ```
 *
 * @example
 * ```
 * const autoField = auto({ databaseName: 'user_id' });
 * ```
 */
export function auto<
  TDefaultValue extends TNull extends true
    ? AutoField['_type']['input'] | undefined | null
    : AutoField['_type']['input'] | undefined = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
>(
  params: Omit<
    FieldDefaultParamsType<AutoField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>,
    'primaryKey' | 'allowNull' | 'unique' | 'dbIndex' | 'isAuto'
  > = {}
) {
  return AutoField.new(params);
}

/**
 * We recommend just using one AutoField per model (or BigAutoField) because you might face some issues with certain ORM's. For ALL use cases, this
 * field should be an integer.
 *
 * @example
 * ```ts
 * const autoField = AutoField.new();
 * ```
 *
 * @example
 * ```
 * const autoField = AutoField.new({ databaseName: 'user_id' });
 * ```
 */
export default class AutoField<
  TType extends { input: number; output: number } = { input: number; output: number },
  TField extends Field = any,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
> extends Field<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
  declare _type: TType;
  typeName: string = AutoField.name;

  /**
   * @deprecated Either use the `auto` function or the `AutoField.new` static method. Never create an instance of this class directly.
   */
  constructor(
    params: Omit<
      FieldDefaultParamsType<AutoField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>,
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

  /**
   * This method can be used to override the type of a field. This is useful for library maintainers that want to support the field type but the default type provided by palmares
   * is not the one that the user want to use.
   *
   * @example
   * ```ts
   * const MyCustomDatabaseAutoField = AutoField.overrideType<string>();
   *
   * // then the user can use as normal:
   *
   * const autoField = MyCustomDatabaseAutoField.new();
   *
   * // now the type inferred for the field will be a string instead of a number.
   * ```
   *
   * @example
   * ```ts
   * class MyCustomDatabaseEngineAutoFieldParser extends EngineAutoFieldParser {
   *    getFieldClass() {
   *       return AutoField.overrideType<string>();
   *    }
   * }
   *
   * // then the user can use like:
   *
   * const autoField = MyCustomDatabaseEngineAutoFieldParser.getFieldClass().new();
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
      >(
        params?: Omit<
          FieldDefaultParamsType<AutoField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>,
          'defaultValue' | 'primaryKey' | 'allowNull' | 'unique' | 'dbIndex' | 'isAuto'
        >
      ) => AutoField<TNewType, AutoField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;
    };
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

  static new<
    TFieldInstance extends This<typeof AutoField>,
    TDefaultValue extends TNull extends true
      ? InstanceType<TFieldInstance>['_type']['input'] | undefined | null
      : InstanceType<TFieldInstance>['_type']['input'] | undefined = undefined,
    TUnique extends boolean = true,
    TNull extends boolean = false,
    TAuto extends boolean = true,
    TDatabaseName extends string | null | undefined = undefined,
    TCustomAttributes = any,
  >(
    this: TFieldInstance,
    params: Omit<
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
    > = {}
  ) {
    return new this(params) as AutoField<
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
