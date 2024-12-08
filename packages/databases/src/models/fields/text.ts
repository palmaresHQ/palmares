import { Field } from './field';

import type { CustomImportsForFieldType, FieldWithOperationTypeForSearch } from './types';
import type {
  CompareCallback,
  GetArgumentsCallback,
  NewInstanceArgumentsCallback,
  OptionsCallback,
  ToStringCallback
} from './utils';
import type { DatabaseAdapter } from '../../engine';
import type { AdapterFieldParser } from '../../engine/fields/field';

/**
 * Functional approach for the creation of a TextField.
 *
 * A TextField is a field that can hold Text values of any size. On Relational Databases that would be a
 * `TEXT` field.
 *
 * @example
 * ```ts
 * const textField = text();
 * ```
 *
 * @example
 * ```
 * const textField = text().default('test');
 * ```
 */
export function text(): TextField<
  {
    create: string;
    read: string;
    update: string;
  },
  {
    unique: false;
    allowNull: false;
    dbIndex: false;
    underscored: true;
    allowBlank: true;
    isPrimaryKey: false;
    auto: false;
    hasDefaultValue: false;
    defaultValue: undefined;
    typeName: string;
    databaseName: undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
  },
  Pick<FieldWithOperationTypeForSearch<string>, 'like' | 'and' | 'in' | 'or' | 'eq' | 'is'>
> {
  return TextField.new();
}

/**
 * A TextField supports either true or false.
 *
 * @example
 * ```ts
 * const booleanField = TextField.new();
 * ```
 *
 * @example
 * ```
 * const booleanField = TextField.new({ databaseName: 'user_id' });
 * ```
 */
export class TextField<
  out TType extends { create: any; read: any; update: any } = {
    create: string;
    read: string;
    update: string;
  },
  out TDefinitions extends {
    unique: boolean;
    auto: boolean;
    allowNull: boolean;
    allowBlank: boolean;
    dbIndex: boolean;
    isPrimaryKey: boolean;
    defaultValue: undefined;
    underscored: boolean;
    typeName: string;
    databaseName: string | undefined;
    hasDefaultValue: boolean;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
  } = {
    unique: false;
    allowNull: false;
    allowBlank: true;
    dbIndex: false;
    underscored: true;
    isPrimaryKey: false;
    hasDefaultValue: false;
    auto: false;
    defaultValue: undefined;
    typeName: string;
    databaseName: undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
  },
  out TFieldOperationTypes = Pick<FieldWithOperationTypeForSearch<string>, 'like' | 'and' | 'in' | 'or' | 'eq' | 'is'>
> extends Field<TType, TDefinitions, TFieldOperationTypes> {
  protected $$type = '$PTextField';
  protected __typeName = 'TextField';
  protected __allowedQueryOperations: Set<any> = new Set([
    'and',
    'in',
    'or',
    'eq',
    'is',
    'like'
  ] as (keyof Required<TFieldOperationTypes>)[]);
  protected __allowBlank: TDefinitions['allowBlank'] = false;

  protected __inputParsers = new Map<string, Required<AdapterFieldParser>['inputParser']>();
  protected __outputParsers = new Map<string, Required<AdapterFieldParser>['outputParser']>();

  protected __compareCallback = ((engine, oldField, newField, defaultCompareCallback) => {
    const oldFieldAsTextField = oldField as TextField<any, any, any>;
    const newFieldAsTextField = newField as TextField<any, any, any>;
    const isAllowBlankEqual = oldFieldAsTextField['__allowBlank'] === newFieldAsTextField['__allowBlank'];
    const [isEqual, changedAttributes] = defaultCompareCallback(engine, oldField, newField, defaultCompareCallback);

    if (!isAllowBlankEqual) changedAttributes.push('allowBlank');
    return [isAllowBlankEqual && isEqual, changedAttributes];
  }) satisfies CompareCallback;

  protected __optionsCallback = ((setFieldValue, oldField, defaultOptionsCallback) => {
    const oldFieldAsTextField = oldField as TextField<any, any, any>;
    defaultOptionsCallback(setFieldValue, oldField, defaultOptionsCallback);
    setFieldValue('__allowBlank', 'allowBlank', oldFieldAsTextField['__allowBlank']);
  }) satisfies OptionsCallback;

  protected __getArgumentsCallback = ((field, defaultGetArgumentsCallback) => {
    const fieldAsTextField = field as TextField<any, any, any>;
    const defaultData = defaultGetArgumentsCallback(field, defaultGetArgumentsCallback);
    return {
      ...defaultData,
      allowBlank: fieldAsTextField['__allowBlank'] as boolean
    };
  }) satisfies GetArgumentsCallback;

  /**
   * This is used internally by the engine to convert the field to string.
   * You can override this if you want to extend the ForeignKeyField class.
   */
  protected __toStringCallback = (async (engine, field, defaultToStringCallback, _customParams = undefined) => {
    const fieldAsTextField = field as TextField<any, any, any>;
    return await defaultToStringCallback(engine, field, defaultToStringCallback, {
      builderParams: `${
        typeof fieldAsTextField['__allowBlank'] === 'boolean' ? `.allowBlank(${fieldAsTextField['__allowBlank']})` : ''
      }`
    });
  }) satisfies ToStringCallback;

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
   * const customBuilder = <TParams extends { name: string }>(params: TParams) => {
   *   const field = customBigInt.new(params);
   *   return field._setNewBuilderMethods({
   *     test: <TTest extends { age: number }>(param: TTest) =>
   *        // This will union the type `string` with what already exists in the field 'create' type
   *        field._setPartialAttributes<{ create: string }, { create: 'union' }>(param)
   *   });
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
  ): TextField<
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
      (this as any)[key] = (functions as any)[key].bind(functions);
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
      'like' | 'and' | 'in' | 'or' | 'eq' | 'is'
    >
  >(): <const TCustomPartialAttributes>(partialCustomAttributes: TCustomPartialAttributes) => TextField<
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
    const TCustomAttributes extends Parameters<
      TDefinitions['engineInstance']['fields']['textFieldParser']['translate']
    >[0]['customAttributes']
  >(
    customAttributes: TCustomAttributes
  ): TextField<
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
  > {
    (this.__customAttributes as any) = customAttributes as any;

    return this as unknown as any;
  }

  unique<TUnique extends boolean = true>(
    isUnique?: TUnique
  ): TextField<
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
      unique: TUnique extends false ? false : true;
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
  > {
    return super.unique(isUnique) as unknown as any;
  }

  allowNull<TNull extends boolean = true>(
    isNull?: TNull
  ): TextField<
    {
      create: TType['create'] | null | undefined;
      read: TType['read'] | null | undefined;
      update: TType['update'] | null | undefined;
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
      allowNull: TNull extends false ? false : true;
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
    Pick<FieldWithOperationTypeForSearch<TType['read'] | null>, 'like' | 'and' | 'in' | 'or' | 'eq' | 'is'>
  > {
    return super.allowNull(isNull) as unknown as any;
  }

  allowBlank<TBlank extends boolean = true>(
    isBlank?: TBlank
  ): TextField<
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
      allowBlank: TBlank extends false ? false : true;
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    },
    TFieldOperationTypes
  > {
    if (isBlank === undefined) (isBlank as any) = true;
    this.__allowBlank = isBlank as TBlank;
    return this as unknown as any;
  }

  /**
   * This method is used to create an index on the database for this field.
   */
  dbIndex<TDbIndex extends boolean = true>(
    isDbIndex?: TDbIndex
  ): TextField<
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
      dbIndex: TDbIndex extends false ? false : true;
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    },
    TFieldOperationTypes
  > {
    return super.dbIndex(isDbIndex) as unknown as any;
  }

  underscored<TUnderscored extends boolean = true>(
    isUnderscored?: TUnderscored
  ): TextField<
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

  primaryKey<TIsPrimaryKey extends boolean = true>(
    isPrimaryKey?: TIsPrimaryKey
  ): TextField<
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
      isPrimaryKey: TIsPrimaryKey extends false ? false : true;
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    },
    TFieldOperationTypes
  > {
    return super.primaryKey(isPrimaryKey) as unknown as any;
  }

  auto<TIsAuto extends boolean = true>(
    isAuto?: TIsAuto
  ): TextField<
    {
      create: TType['create'] | undefined;
      read: TType['read'];
      update: TType['update'] | undefined;
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
      auto: TIsAuto extends false ? false : true;
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    },
    TFieldOperationTypes
  > {
    return super.auto(isAuto) as any;
  }

  default<TDefault extends TType['create']>(
    defaultValue: TDefault
  ): TextField<
    {
      create: TType['create'] | TDefault | undefined;
      read: TType['read'];
      update: TType['update'] | undefined;
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
      hasDefaultValue: true;
      defaultValue: TDefault;
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    },
    TFieldOperationTypes
  > {
    return super.default(defaultValue) as unknown as any;
  }

  databaseName<TDatabaseName extends string>(
    databaseName: TDatabaseName
  ): TextField<
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
   * maintainers that want to support a custom field type not supported by palmares.
   *
   * ### Note
   * - Your library should provide documentation of the fields that are supported.
   * - This should be used alongside the `_setPartialAttributes` method and `_setNewBuilderMethods`.
   * Instead of making users type NameOfYourField.new(), you should create a function that calls .new and creates
   * a new instance of the field for them.
   * - TDefinitions exists on type-level only, in runtime, it's not a guarantee of nothing. If TDefinitions
   * sets unique to true, it's up to you to do `NameOfYourField.new().unique()`, because otherwise it will be false
   */
  static _overrideType<
    const TNewType extends { create: any; update: any; read: any },
    const TDefinitions extends {
      customAttributes: any;
      unique: boolean;
      auto: boolean;
      allowNull: boolean;
      dbIndex: boolean;
      isPrimaryKey: boolean;
      defaultValue: any;
      typeName: string;
      hasDefaultValue: boolean;
      engineInstance: DatabaseAdapter;
      allowBlank: boolean;
    } & Record<string, any>,
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
  }): TDefinitions['customAttributes'] extends undefined
    ? {
        new: (...args: any[]) => TextField<
          TNewType,
          {
            unique: TDefinitions['unique'];
            auto: TDefinitions['auto'];
            allowNull: TDefinitions['allowNull'];
            dbIndex: TDefinitions['dbIndex'];
            isPrimaryKey: TDefinitions['isPrimaryKey'];
            defaultValue: TDefinitions['defaultValue'];
            underscored: boolean;
            databaseName: string | undefined;
            hasDefaultValue: boolean;
            engineInstance: TDefinitions['engineInstance'];
            customAttributes: TDefinitions['customAttributes'];
            typeName: TDefinitions['typeName'];
            allowBlank: TDefinitions['allowBlank'];
          },
          TFieldOperationTypes
        >;
      }
    : {
        new: (params: TDefinitions['customAttributes']) => TextField<
          TNewType,
          {
            unique: TDefinitions['unique'];
            auto: TDefinitions['auto'];
            allowNull: TDefinitions['allowNull'];
            dbIndex: TDefinitions['dbIndex'];
            isPrimaryKey: TDefinitions['isPrimaryKey'];
            defaultValue: TDefinitions['defaultValue'];
            underscored: boolean;
            databaseName: string | undefined;
            hasDefaultValue: boolean;
            engineInstance: TDefinitions['engineInstance'];
            customAttributes: TDefinitions['customAttributes'];
            typeName: TDefinitions['typeName'];
            allowBlank: TDefinitions['allowBlank'];
          },
          TFieldOperationTypes
        >;
      } {
    return super._overrideType(args) as unknown as any;
  }

  static new(..._args: any[]): TextField<
    {
      create: string;
      read: string;
      update: string;
    },
    {
      unique: false;
      allowNull: false;
      dbIndex: false;
      underscored: true;
      allowBlank: true;
      isPrimaryKey: false;
      auto: false;
      hasDefaultValue: false;
      defaultValue: undefined;
      typeName: string;
      databaseName: undefined;
      engineInstance: DatabaseAdapter;
      customAttributes: any;
    },
    Pick<FieldWithOperationTypeForSearch<string>, 'like' | 'and' | 'in' | 'or' | 'eq' | 'is'>
  > {
    return new this(..._args);
  }
}
