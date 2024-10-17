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
 * Functional approach for the creation of a DecimalField.
 *
 * A DecimalField is a field is used to store decimal values. WHY DON'T WE JUST USE NUMBERS?
 * Because of floating point precision. We need to guarantee floating point precision
 * when a user uses this field.
 *
 * @example
 * ```ts
 * const updatedAt = decimal();
 * ```
 *
 * @example
 * ```
 * const updatedAt = decimal().autoNow();
 * const createdAt = decimal().autoNowAdd();
 * ```
 */
export function decimal<const TMaxDigits extends number, const TDecimalPlaces extends number>(params: {
  maxDigits: TMaxDigits;
  decimalPlaces: TDecimalPlaces;
}): DecimalField<
  {
    create: string | number;
    read: string | number;
    update: string | number;
  },
  {
    unique: false;
    allowNull: false;
    dbIndex: false;
    underscored: true;
    isPrimaryKey: false;
    auto: false;
    hasDefaultValue: false;
    defaultValue: undefined;
    typeName: string;
    databaseName: undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
    maxDigits: TMaxDigits;
    decimalPlaces: TDecimalPlaces;
  },
  Pick<
    FieldWithOperationTypeForSearch<string | number>,
    'greaterThan' | 'lessThan' | 'between' | 'and' | 'in' | 'or' | 'eq' | 'is'
  >
> {
  return DecimalField.new(params);
}

/**
 * A DecimalField supports either true or false.
 *
 * @example
 * ```ts
 * const decimalField = DecimalField.new();
 * ```
 *
 * @example
 * ```
 * const decimalField = DecimalField.new().databaseName('user_id');
 * ```
 */
export class DecimalField<
  TType extends { create: any; read: any; update: any } = {
    create: number | string;
    read: number | string;
    update: number | string;
  },
  TDefinitions extends {
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
    maxDigits: number;
    decimalPlaces: number;
  } = {
    unique: false;
    allowNull: false;
    dbIndex: false;
    underscored: true;
    isPrimaryKey: false;
    auto: false;
    hasDefaultValue: false;
    defaultValue: undefined;
    typeName: string;
    databaseName: undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
    maxDigits: number;
    decimalPlaces: number;
  },
  TFieldOperationTypes = Pick<
    FieldWithOperationTypeForSearch<number | string>,
    'greaterThan' | 'lessThan' | 'between' | 'and' | 'in' | 'or' | 'eq' | 'is'
  >
> extends Field<TType, TDefinitions, TFieldOperationTypes> {
  protected $$type = '$PDecimalField';
  protected __typeName = 'DecimalField';
  protected __maxDigits: TDefinitions['maxDigits'];
  protected __decimalPlaces: TDefinitions['decimalPlaces'];
  protected __allowedQueryOperations: Set<any> = new Set([
    'lessThan',
    'greaterThan',
    'between',
    'and',
    'in',
    'or',
    'eq',
    'is'
  ] as (keyof Required<TFieldOperationTypes>)[]);

  protected __inputParsers = new Map<string, Required<AdapterFieldParser>['inputParser']>();
  protected __outputParsers = new Map<string, Required<AdapterFieldParser>['outputParser']>();

  protected __compareCallback = ((engine, oldField, newField, defaultCompareCallback) => {
    const oldFieldAsTextField = oldField as DecimalField<any, any>;
    const newFieldAsTextField = newField as DecimalField<any, any>;
    const isMaxDigitsEqual = oldFieldAsTextField['__maxDigits'] === newFieldAsTextField['__maxDigits'];
    const isDecimalPlacesEqual = oldFieldAsTextField['__decimalPlaces'] === newFieldAsTextField['__decimalPlaces'];

    const [isEqual, changedAttributes] = defaultCompareCallback(engine, oldField, newField, defaultCompareCallback);

    if (!isMaxDigitsEqual) changedAttributes.push('maxDigits');
    if (!isDecimalPlacesEqual) changedAttributes.push('decimalPlaces');

    return [isMaxDigitsEqual && isDecimalPlacesEqual && isEqual, changedAttributes];
  }) satisfies CompareCallback;

  /**
   * This is used internally by the engine to convert the field to string.
   * You can override this if you want to extend the ForeignKeyField class.
   */
  protected __toStringCallback = (async (engine, field, defaultToStringCallback, _customParams = undefined) => {
    const fieldAsDecimalField = field as DecimalField<any, any, any>;
    return await defaultToStringCallback(engine, field, defaultToStringCallback, {
      constructorParams:
        `{ ` +
        `maxDigits: ${fieldAsDecimalField['__maxDigits']}, ` +
        `decimalPlaces: ${fieldAsDecimalField['__decimalPlaces']} ` +
        `}`
    });
  }) satisfies ToStringCallback;

  /**
   * This is used internally by the engine for cloning the field to a new instance.
   * By doing that you are able to get the constructor options of the field when using Field.new(<instanceArguments>)
   */
  protected __newInstanceCallback = ((oldField, defaultNewInstanceArgumentsCallback) => {
    const defaultData = defaultNewInstanceArgumentsCallback(oldField, defaultNewInstanceArgumentsCallback);
    const position0 = defaultData[0] || {};
    const otherPositions = defaultData.slice(1);
    const asDecimalField = oldField as DecimalField<any, any>;
    return [
      {
        ...position0,
        maxDigits: asDecimalField['__maxDigits'],
        decimalPlaces: asDecimalField['__decimalPlaces']
      },
      ...otherPositions
    ];
  }) satisfies NewInstanceArgumentsCallback;

  protected __getArgumentsCallback = ((field, defaultCallback) => {
    const fieldAsDateField = field as DecimalField<any, any>;
    const maxDigits = fieldAsDateField['__maxDigits'];
    const decimalPlaces = fieldAsDateField['__decimalPlaces'];
    return {
      ...defaultCallback(field, defaultCallback),
      decimalPlaces,
      maxDigits
    };
  }) satisfies GetArgumentsCallback;

  constructor(params: { maxDigits: number; decimalPlaces: number }) {
    super(params);
    this.__maxDigits = params.maxDigits;
    this.__decimalPlaces = params.decimalPlaces;
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
   * const customBigInt = DecimalField.overrideType<
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
  ): DecimalField<
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
      'greaterThan' | 'lessThan' | 'between' | 'and' | 'in' | 'or' | 'eq' | 'is'
    >
  >(): <const TCustomPartialAttributes>(partialCustomAttributes: TCustomPartialAttributes) => DecimalField<
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
      TDefinitions['engineInstance']['fields']['decimalFieldParser']['translate']
    >[0]['customAttributes']
  >(
    customAttributes: TCustomAttributes
  ): DecimalField<
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
  ): DecimalField<
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
  ): DecimalField<
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
    Pick<
      FieldWithOperationTypeForSearch<TType['read'] | null>,
      'greaterThan' | 'lessThan' | 'between' | 'and' | 'in' | 'or' | 'eq' | 'is'
    >
  > {
    return super.allowNull(isNull) as unknown as any;
  }

  /**
   * This method is used to create an index on the database for this field.
   */
  dbIndex<TDbIndex extends boolean = true>(
    isDbIndex?: TDbIndex
  ): DecimalField<
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
      hasDefaultValue: TDefinitions['hasDefaultValue'];
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
  ): DecimalField<
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
  ): DecimalField<
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
      hasDefaultValue: TDefinitions['hasDefaultValue'];
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
  ): DecimalField<
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
    return super.auto(isAuto) as unknown as any;
  }

  default<TDefault extends TType['create']>(
    defaultValue: TDefault
  ): DecimalField<
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
  ): DecimalField<
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
      hasDefaultValue: boolean;
      defaultValue: any;
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
  }): TDefinitions['customAttributes'] extends undefined
    ? {
        new: <const TMaxDigits extends number, const TDecimalPlaces extends number>(params: {
          maxDigits: TMaxDigits;
          decimalPlaces: TDecimalPlaces;
        }) => DecimalField<
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
            maxDigits: TMaxDigits;
            decimalPlaces: TDecimalPlaces;
          },
          TFieldOperationTypes
        >;
      }
    : {
        new: <const TMaxDigits extends number, const TDecimalPlaces extends number>(
          params: {
            maxDigits: TMaxDigits;
            decimalPlaces: TDecimalPlaces;
          } & TDefinitions['customAttributes']
        ) => DecimalField<
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
            maxDigits: TMaxDigits;
            decimalPlaces: TDecimalPlaces;
          },
          TFieldOperationTypes
        >;
      } {
    return super._overrideType(args) as any;
  }

  static new<const TMaxDigits extends number, const TDecimalPlaces extends number>(params: {
    maxDigits: TMaxDigits;
    decimalPlaces: TDecimalPlaces;
  }): DecimalField<
    {
      create: number | string;
      read: number | string;
      update: number | string;
    },
    {
      unique: false;
      allowNull: false;
      dbIndex: false;
      underscored: true;
      isPrimaryKey: false;
      auto: false;
      hasDefaultValue: false;
      defaultValue: undefined;
      typeName: string;
      databaseName: undefined;
      engineInstance: DatabaseAdapter;
      customAttributes: any;
      maxDigits: TMaxDigits;
      decimalPlaces: TDecimalPlaces;
    },
    Pick<
      FieldWithOperationTypeForSearch<string | number>,
      'greaterThan' | 'lessThan' | 'between' | 'and' | 'in' | 'or' | 'eq' | 'is'
    >
  > {
    return new this(params);
  }
}
