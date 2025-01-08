import { Field } from './field';

import type { CustomImportsForFieldType, FieldWithOperationTypeForSearch } from './types';
import type { CompareCallback, NewInstanceArgumentsCallback, OptionsCallback, ToStringCallback } from './utils';
import type { AdapterBigAutoFieldParser, AdapterFieldParser, DatabaseAdapter } from '../..';

/**
 * Functional approach for the creation of an BigAutoField instance. An BigAutoField is a field that
 * is used as the primary key of the database.
 *
 * We recommend just using one BigAutoField per model (or AutoField) because you might face some
 * issues with certain ORM's. For ALL use cases, this
 * field should be an integer.
 *
 * @example
 * ```ts
 * const bigAutoField = bigAuto();
 * ```
 *
 * @example
 * ```
 * const bigAutoField = bigAuto();
 * ```
 */
export function bigAuto(): BigAutoField<
  {
    create: number | bigint | undefined | null;
    read: number | bigint;
    update: number | bigint | undefined | null;
  },
  {
    unique: true;
    allowNull: true;
    dbIndex: true;
    underscored: true;
    isPrimaryKey: true;
    auto: true;
    hasDefaultValue: false;
    defaultValue: undefined;
    typeName: string;
    databaseName: undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
  },
  Pick<
    FieldWithOperationTypeForSearch<number | bigint>,
    'lessThan' | 'greaterThan' | 'and' | 'in' | 'or' | 'eq' | 'is' | 'between'
  >
> {
  return BigAutoField.new();
}

/**
 * We recommend just using one AutoField per model (or BigAutoField) because you might face some
 * issues with certain ORM's. For ALL use cases, this field should be an integer.
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
export class BigAutoField<
  out TType extends { create: any; read: any; update: any } = {
    create: bigint | number | undefined;
    read: bigint | number;
    update: bigint | number | undefined;
  },
  out TDefinitions extends {
    unique: boolean;
    auto: boolean;
    allowNull: boolean;
    dbIndex: boolean;
    isPrimaryKey: boolean;
    hasDefaultValue: boolean;
    defaultValue: undefined;
    underscored: boolean;
    typeName: string;
    databaseName: string | undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
  } & Record<string, any> = {
    unique: true;
    allowNull: true;
    dbIndex: true;
    underscored: true;
    isPrimaryKey: true;
    auto: true;
    hasDefaultValue: false;
    defaultValue: undefined;
    typeName: string;
    databaseName: undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
  },
  out TFieldOperationTypes = Pick<
    FieldWithOperationTypeForSearch<number | bigint>,
    'lessThan' | 'greaterThan' | 'and' | 'in' | 'or' | 'eq' | 'is' | 'between'
  >
> extends Field<TType, TDefinitions, TFieldOperationTypes> {
  protected $$type = '$PBigAutoField';
  protected __typeName = 'BigAutoField';
  protected __allowedQueryOperations: Set<any> = new Set([
    'lessThan',
    'greaterThan',
    'and',
    'in',
    'or',
    'eq',
    'is',
    'between'
  ] as (keyof NonNullable<TFieldOperationTypes>)[]);
  protected __isAuto = true;
  protected __hasDefaultValue = false;
  protected __primaryKey = true;
  protected __defaultValue = undefined;
  protected __allowNull = true;
  protected __unique = true;
  protected __dbIndex = true;
  protected __inputParsers = new Map<string, NonNullable<AdapterFieldParser>['inputParser']>();
  protected __outputParsers = new Map<string, NonNullable<AdapterFieldParser>['outputParser']>();

  unique: never = (() => this) as never;
  auto: never = (() => this) as never;
  allowNull: never = (() => this) as never;
  primaryKey: never = (() => this) as never;
  dbIndex: never = (() => this) as never;
  default: never = (() => this) as never;

  constructor(...args: any[]) {
    super(...args);
    this.__isAuto = true;
    this.__hasDefaultValue = false;
    this.__primaryKey = true;
    this.__defaultValue = undefined;
    this.__allowNull = true;
    this.__unique = true;
    this.__dbIndex = true;
  }

  /**
   * Supposed to be used by library maintainers.
   *
   * When you custom create a field, you might want to take advantage of the builder pattern we already support.
   * This let's you create functions that can be chained together to create a new field. It should be used
   * alongside the `_setPartialAttributes` method like
   *
   * @example
   * ```ts
   * const customBigInt = TextField.overrideType<
   *   { create: bigint; read: bigint; update: bigint },
   *   {
   *       customAttributes: { name: string };
   *       unique: boolean;
   *       auto: boolean;
   *       allowNull: true;
   *       dbIndex: boolean;
   *       isPrimaryKey: boolean;
   *       defaultValue: any;
   *       typeName: string;
   *       engineInstance: DatabaseAdapter;
   *   }
   * >({
   *   typeName: 'CustomBigInt'
   * });
   *
   * const customBuilder = () => {
   *   const field = textField.new();
   *   class Builder {
   *     test<TTest extends { age: number }>(param: TTest) {
   *       return field
   *         ._setPartialAttributes<{ create: TTest }, { create: 'union' }>()(param)
   *         ._setNewBuilderMethods<Builder>();
   *     }
   *     value<const TValue extends string>(value: TValue) {
   *       return field
   *         ._setPartialAttributes<{ create: TValue }, { create: 'replace' }>()(value)
   *         ._setNewBuilderMethods<Builder>();
   *     }
   *   }
   *
   *   const builder = new Builder();
   *   return field._setNewBuilderMethods(builder);
   * };
   *
   * // Then your user can use it like:
   *
   * const field = customBuilder({ name: 'test' }).test({ age: 2 });
   * ```
   *
   * **Important**: `customBuilder` will be used by the end user and you are responsible for documenting it.
   */
  _setNewBuilderMethods<const TFunctions extends InstanceType<any>>(
    functions?: TFunctions
  ): BigAutoField<
    TType,
    {
      [TKey in Exclude<
        keyof TDefinitions,
        | 'underscored'
        | 'allowNull'
        | 'dbIndex'
        | 'unique'
        | 'isPrimaryKey'
        | 'auto'
        | 'defaultValue'
        | 'databaseName'
        | 'typeName'
        | 'engineInstance'
        | 'customAttributes'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    },
    TFieldOperationTypes
  > &
    TFunctions {
    if (functions === undefined) return this as any;
    const propertiesOfBase = Object.getOwnPropertyNames(Object.getPrototypeOf(functions));
    for (const key of propertiesOfBase) {
      if (key === 'constructor') continue;
      (this as any)[key] = (functions as any)[key].bind(this);
    }

    return this as any;
  }

  /**
   * FOR LIBRARY MAINTAINERS ONLY
   *
   * Focused for library maintainers that want to support a custom field type not supported by palmares.
   * This let's them partially update the custom attributes of the field. By default setCustomAttributes
   * will override the custom attributes entirely.
   */
  _setPartialAttributes<
    TNewType extends { create?: any; read?: any; update?: any },
    TActions extends {
      create?: 'merge' | 'union' | 'replace';
      read?: 'merge' | 'union' | 'replace';
      update?: 'merge' | 'union' | 'replace';
    },
    TNewAllowedQueryOperations extends FieldWithOperationTypeForSearch<
      TActions['read'] extends 'merge'
        ? TType['read'] & TNewType['read']
        : TActions['read'] extends 'union'
          ? TType['read'] | TNewType['read']
          : TActions['read'] extends 'replace'
            ? TNewType['read']
            : TType['read']
    > = Pick<
      FieldWithOperationTypeForSearch<
        TActions['read'] extends 'merge'
          ? TType['read'] & TNewType['read']
          : TActions['read'] extends 'union'
            ? TType['read'] | TNewType['read']
            : TActions['read'] extends 'replace'
              ? TNewType['read']
              : TType['read']
      >,
      'lessThan' | 'greaterThan' | 'and' | 'in' | 'or' | 'eq' | 'is' | 'between'
    >
  >(): <const TCustomPartialAttributes>(partialCustomAttributes: TCustomPartialAttributes) => BigAutoField<
    {
      create: TActions['create'] extends 'merge'
        ? TType['create'] & TNewType['create']
        : TActions['create'] extends 'union'
          ? TType['create'] | TNewType['create']
          : TActions['create'] extends 'replace'
            ? TNewType['create']
            : TType['create'];
      read: TActions['read'] extends 'merge'
        ? TType['read'] & TNewType['read']
        : TActions['read'] extends 'union'
          ? TType['read'] | TNewType['read']
          : TActions['read'] extends 'replace'
            ? TNewType['read']
            : TType['read'];
      update: TActions['update'] extends 'merge'
        ? TType['update'] & TNewType['update']
        : TActions['update'] extends 'union'
          ? TType['update'] | TNewType['update']
          : TActions['update'] extends 'replace'
            ? TNewType['update']
            : TType['update'];
    },
    {
      [TKey in Exclude<
        keyof TDefinitions,
        | 'underscored'
        | 'allowNull'
        | 'dbIndex'
        | 'unique'
        | 'isPrimaryKey'
        | 'auto'
        | 'defaultValue'
        | 'databaseName'
        | 'typeName'
        | 'engineInstance'
        | 'customAttributes'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'] & TCustomPartialAttributes;
    },
    TNewAllowedQueryOperations
  > {
    return (partialCustomAttributes) => {
      if (partialCustomAttributes !== undefined) {
        if ((this.__customAttributes as any) === undefined) this.__customAttributes = {} as any;
        this.__customAttributes = { ...this.__customAttributes, ...partialCustomAttributes };
      }
      return this as any;
    };
  }

  setCustomAttributes<
    const TCustomAttributes extends
      TDefinitions['engineInstance']['fields']['bigAutoFieldParser'] extends AdapterBigAutoFieldParser
        ? Parameters<TDefinitions['engineInstance']['fields']['bigAutoFieldParser']['translate']>[0]['customAttributes']
        : Parameters<
            TDefinitions['engineInstance']['fields']['bigIntegerFieldParser']['translate']
          >[0]['customAttributes']
  >(customAttributes: TCustomAttributes) {
    return super.setCustomAttributes(customAttributes) as unknown as BigAutoField<
      TType,
      {
        [TKey in Exclude<
          keyof TDefinitions,
          | 'underscored'
          | 'allowNull'
          | 'dbIndex'
          | 'unique'
          | 'isPrimaryKey'
          | 'auto'
          | 'defaultValue'
          | 'databaseName'
          | 'typeName'
          | 'engineInstance'
          | 'customAttributes'
        >]: TDefinitions[TKey];
      } & {
        unique: TDefinitions['unique'];
        allowNull: TDefinitions['allowNull'];
        dbIndex: TDefinitions['dbIndex'];
        underscored: TDefinitions['underscored'];
        isPrimaryKey: TDefinitions['isPrimaryKey'];
        auto: TDefinitions['auto'];
        hasDefaultValue: TDefinitions['hasDefaultValue'];
        defaultValue: TDefinitions['defaultValue'];
        databaseName: TDefinitions['databaseName'];
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TCustomAttributes;
      },
      TFieldOperationTypes
    >;
  }

  underscored<TUnderscored extends boolean = true>(
    isUnderscored?: TUnderscored
  ): BigAutoField<
    TType,
    {
      [TKey in Exclude<
        keyof TDefinitions,
        | 'underscored'
        | 'allowNull'
        | 'dbIndex'
        | 'unique'
        | 'isPrimaryKey'
        | 'auto'
        | 'defaultValue'
        | 'databaseName'
        | 'typeName'
        | 'engineInstance'
        | 'customAttributes'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TUnderscored extends false ? false : true;
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    },
    TFieldOperationTypes
  > {
    return super.underscored(isUnderscored) as unknown as any;
  }

  databaseName<TDatabaseName extends string>(
    databaseName: TDatabaseName
  ): BigAutoField<
    TType,
    {
      [TKey in Exclude<
        keyof TDefinitions,
        | 'underscored'
        | 'allowNull'
        | 'dbIndex'
        | 'unique'
        | 'isPrimaryKey'
        | 'auto'
        | 'defaultValue'
        | 'databaseName'
        | 'typeName'
        | 'engineInstance'
        | 'customAttributes'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDatabaseName;
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    },
    TFieldOperationTypes
  > {
    return super.databaseName(databaseName) as unknown as any;
  }

  /**
   * This method can be used to override the type of a field. This is useful for library
   * maintainers that want to support the field type but the default type provided by palmares
   * is not the one that the user want to use.
   *
   * ### Note
   *
   * Your library should provide documentation of the fields that are supported.
   */
  static _overrideType<
    TNewType extends { create: any; update: any; read: any },
    TDefinitions extends {
      customAttributes: any;
      unique: boolean;
      auto: boolean;
      allowNull: boolean;
      dbIndex: boolean;
      isPrimaryKey: boolean;
      defaultValue: any;
      hasDefaultValue: boolean;
      typeName: string;
      engineInstance: DatabaseAdapter;
    },
    const TFieldOperationTypes extends
      | FieldWithOperationTypeForSearch<any>
      | Pick<FieldWithOperationTypeForSearch<any>, any>
  >(args: {
    typeName: string;
    toStringCallback?: ToStringCallback;
    compareCallback?: CompareCallback;
    optionsCallback?: OptionsCallback;
    newInstanceCallback?: NewInstanceArgumentsCallback;
    allowedQueryOperations?: (keyof TFieldOperationTypes)[];
    customImports?: CustomImportsForFieldType[];
    definitions?: Omit<TDefinitions, 'typeName' | 'engineInstance' | 'customAttributes'>;
  }): TDefinitions['customAttributes'] extends undefined
    ? {
        new: () => BigAutoField<
          TNewType,
          {
            unique: TDefinitions['unique'];
            auto: TDefinitions['auto'];
            allowNull: TDefinitions['allowNull'];
            dbIndex: TDefinitions['dbIndex'];
            isPrimaryKey: TDefinitions['isPrimaryKey'];
            hasDefaultValue: TDefinitions['hasDefaultValue'];
            defaultValue: TDefinitions['defaultValue'];
            underscored: boolean;
            databaseName: string | undefined;
            engineInstance: TDefinitions['engineInstance'];
            customAttributes: TDefinitions['customAttributes'];
            typeName: TDefinitions['typeName'];
          },
          TFieldOperationTypes
        >;
      }
    : {
        new: (params: TDefinitions['customAttributes']) => BigAutoField<
          TNewType,
          {
            unique: TDefinitions['unique'];
            auto: TDefinitions['auto'];
            allowNull: TDefinitions['allowNull'];
            dbIndex: TDefinitions['dbIndex'];
            isPrimaryKey: TDefinitions['isPrimaryKey'];
            hasDefaultValue: TDefinitions['hasDefaultValue'];
            defaultValue: TDefinitions['defaultValue'];
            underscored: boolean;
            databaseName: string | undefined;
            engineInstance: TDefinitions['engineInstance'];
            customAttributes: TDefinitions['customAttributes'];
            typeName: TDefinitions['typeName'];
          },
          TFieldOperationTypes
        >;
      } {
    return super._overrideType(args) as unknown as any;
  }

  static new(..._args: any[]): BigAutoField<
    {
      create: number | undefined | null;
      read: number;
      update: number | undefined | null;
    },
    {
      unique: true;
      allowNull: true;
      dbIndex: true;
      underscored: true;
      isPrimaryKey: true;
      auto: true;
      hasDefaultValue: false;
      defaultValue: undefined;
      typeName: string;
      databaseName: undefined;
      engineInstance: DatabaseAdapter;
      customAttributes: any;
    },
    Pick<
      FieldWithOperationTypeForSearch<number | bigint>,
      'lessThan' | 'greaterThan' | 'and' | 'in' | 'or' | 'eq' | 'is' | 'between'
    >
  > {
    return new this(..._args) as any;
  }
}
