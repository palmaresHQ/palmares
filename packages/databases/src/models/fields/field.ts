import { utils } from '@palmares/core';

import {
  defaultCompareCallback,
  defaultGetArgumentsCallback,
  defaultNewInstanceArgumentsCallback,
  defaultOptionsCallback,
  defaultToStringCallback
} from './utils';

import type { CustomImportsForFieldType, FieldWithOperationTypeForSearch, ON_DELETE } from './types';
import type {
  CompareCallback,
  GetArgumentsCallback,
  NewInstanceArgumentsCallback,
  OptionsCallback,
  ToStringCallback
} from './utils';
import type { DatabaseAdapter } from '../../engine';
import type { AdapterFieldParser } from '../../engine/fields/field';
import type { BaseModel, Model, ModelType } from '../model';
import { ForeignKeyField } from '.';

/**
 * This is the default field of the model, every other field type should override this
 * one but this one SHOULDN't be called directly.
 * Generally we do not offer any translation to this type of field.
 */
export class Field<
  TType extends { create: any; read: any; update: any } = { create: any; read: any; update: any },
  TDefinitions extends {
    unique: boolean;
    auto: boolean;
    allowNull: boolean;
    dbIndex: boolean;
    isPrimaryKey: boolean;
    hasDefaultValue: boolean;
    defaultValue: any;
    underscored: boolean;
    typeName: string;
    databaseName: string | undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
  } & Record<string, any> = {
    unique: false;
    allowNull: false;
    dbIndex: false;
    underscored: true;
    hasDefaultValue: false;
    isPrimaryKey: false;
    auto: false;
    defaultValue: undefined;
    typeName: string;
    databaseName: undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
  },
  TFieldOperationTypes = FieldWithOperationTypeForSearch<any>
> {
  protected $$type = '$PField';
  protected __typeName = 'Field';
  protected __isAuto: TDefinitions['auto'] = false as boolean;
  protected __hasDefaultValue = false as boolean;
  protected __primaryKey: TDefinitions['isPrimaryKey'] = false as boolean;
  protected __defaultValue: TDefinitions['defaultValue'] = undefined;
  protected __allowNull: TDefinitions['allowNull'] = false as boolean;
  protected __unique: TDefinitions['unique'] = false as boolean;
  protected __dbIndex: TDefinitions['dbIndex'] = false as boolean;
  protected __databaseName: TDefinitions['databaseName'] = undefined as string | undefined;
  protected __underscored: TDefinitions['underscored'] = true as boolean;
  protected __customAttributes!: Parameters<
    TDefinitions['engineInstance']['fields']['autoFieldParser']['translate']
  >[0]['customAttributes'];
  protected __allowedQueryOperations: Set<keyof Required<any>> = new Set([
    'eq',
    'is',
    'greaterThan',
    'lessThan',
    'like',
    'between'
  ]);
  // eslint-disable-next-line ts/require-await
  protected __toStringCallback = defaultToStringCallback satisfies ToStringCallback;
  // eslint-disable-next-line ts/require-await
  protected __compareCallback = defaultCompareCallback satisfies CompareCallback;
  protected __optionsCallback = defaultOptionsCallback satisfies OptionsCallback;
  protected __newInstanceCallback = defaultNewInstanceArgumentsCallback satisfies NewInstanceArgumentsCallback;
  protected __customImports: CustomImportsForFieldType[] = [];
  protected __getArgumentsCallback = defaultGetArgumentsCallback satisfies GetArgumentsCallback;
  protected __inputParsers = new Map<string, Required<AdapterFieldParser>['inputParser']>();
  protected __outputParsers = new Map<string, Required<AdapterFieldParser>['outputParser']>();
  protected __model?: ModelType<any, any> & typeof Model & typeof BaseModel;
  protected __fieldName!: string;

  constructor(..._args: any[]) {}

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
  ): Field<
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
        | 'hasDefaultValue'
        | 'allowedQueryOperations'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      hasDefaultValue: TDefinitions['hasDefaultValue'];
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
    > = FieldWithOperationTypeForSearch<
      TActions['read'] extends 'merge'
        ? TType['read'] & TNewType['read']
        : TActions['read'] extends 'union'
          ? TType['read'] | TNewType['read']
          : TActions['read'] extends 'replace'
            ? TNewType['read']
            : TType['read']
    >
  >(): <const TCustomPartialAttributes>(partialCustomAttributes: TCustomPartialAttributes) => Field<
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
        | 'hasDefaultValue'
        | 'allowedQueryOperations'
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
      TDefinitions['engineInstance']['fields']['fieldsParser']['translate']
    >[0]['customAttributes']
  >(
    customAttributes: TCustomAttributes
  ): Field<
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
        | 'hasDefaultValue'
        | 'allowedQueryOperations'
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
  ): Field<
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
        | 'hasDefaultValue'
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
    if (typeof isUnique !== 'boolean') isUnique = true as TUnique;
    this.__unique = isUnique;

    return this as unknown as any;
  }

  allowNull<TNull extends boolean = true>(
    isNull?: TNull
  ): Field<
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
        | 'hasDefaultValue'
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
      allowedQueryOperations: FieldWithOperationTypeForSearch<TType['read'] | null | undefined>;
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    },
    TFieldOperationTypes
  > {
    if (typeof isNull !== 'boolean') isNull = true as TNull;
    this.__allowNull = isNull;

    return this as unknown as any;
  }

  /**
   * This method is used to create an index on the database for this field.
   */
  dbIndex<TDbIndex extends boolean = true>(
    dbIndex?: TDbIndex
  ): Field<
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
        | 'hasDefaultValue'
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
    if (typeof dbIndex !== 'boolean') dbIndex = true as TDbIndex;
    this.__dbIndex = dbIndex;

    return this as unknown as any;
  }

  underscored<TUnderscored extends boolean = true>(
    isUnderscored?: TUnderscored
  ): Field<
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
        | 'hasDefaultValue'
        | 'allowedQueryOperations'
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
    if (typeof isUnderscored !== 'boolean') isUnderscored = true as TUnderscored;
    this.__underscored = isUnderscored;

    return this as unknown as any;
  }

  primaryKey<TIsPrimaryKey extends boolean = true>(
    isPrimaryKey?: TIsPrimaryKey
  ): Field<
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
        | 'hasDefaultValue'
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
    if (typeof isPrimaryKey !== 'boolean') isPrimaryKey = true as TIsPrimaryKey;
    this.__primaryKey = isPrimaryKey;

    return this as unknown as any;
  }

  auto<TIsAuto extends boolean = true>(
    isAuto?: TIsAuto
  ): Field<
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
        | 'hasDefaultValue'
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
    if (typeof isAuto !== 'boolean') isAuto = true as TIsAuto;
    this.__isAuto = isAuto;

    return this as unknown as any;
  }

  default<TDefault extends TType['create']>(
    defaultValue: TDefault
  ): Field<
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
        | 'hasDefaultValue'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefault;
      hasDefaultValue: true;
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    },
    TFieldOperationTypes
  > {
    this.__defaultValue = defaultValue;

    return this as unknown as any;
  }

  databaseName<TDatabaseName extends string>(
    databaseName: TDatabaseName
  ): Field<
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
        | 'hasDefaultValue'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      databaseName: TDatabaseName;
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    },
    TFieldOperationTypes
  > {
    this.__databaseName = databaseName;

    return this as unknown as any;
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
      engineInstance: DatabaseAdapter;
    } & Record<string, any>,
    const TFieldOperationTypes extends FieldWithOperationTypeForSearch<any> | Pick<FieldWithOperationTypeForSearch<any>, any>
  >(args: {
    typeName: string;
    toStringCallback?: ToStringCallback;
    compareCallback?: CompareCallback;
    optionsCallback?: OptionsCallback;
    allowedQueryOperations?: (keyof TFieldOperationTypes)[];
    newInstanceCallback?: NewInstanceArgumentsCallback;
    customImports?: CustomImportsForFieldType[];
  }): TDefinitions['customAttributes'] extends undefined
    ? {
        new: (...args: any[]) => Field<
          TNewType,
          {
            unique: TDefinitions['unique'];
            auto: TDefinitions['auto'];
            allowNull: TDefinitions['allowNull'];
            dbIndex: TDefinitions['dbIndex'];
            isPrimaryKey: TDefinitions['isPrimaryKey'];
            defaultValue: TDefinitions['defaultValue'];
            hasDefaultValue: TDefinitions['hasDefaultValue'];
            underscored: boolean;
            databaseName: string | undefined;
            engineInstance: TDefinitions['engineInstance'];
            customAttributes: TDefinitions['customAttributes'];
            typeName: TDefinitions['typeName'];
          },
          TFieldOperationTypes
        >
      }
    : {
        new: (params: TDefinitions['customAttributes']) => Field<
          TNewType,
          {
            unique: TDefinitions['unique'];
            auto: TDefinitions['auto'];
            allowNull: TDefinitions['allowNull'];
            dbIndex: TDefinitions['dbIndex'];
            isPrimaryKey: TDefinitions['isPrimaryKey'];
            defaultValue: TDefinitions['defaultValue'];
            hasDefaultValue: TDefinitions['hasDefaultValue'];
            underscored: boolean;
            databaseName: string | undefined;
            engineInstance: TDefinitions['engineInstance'];
            customAttributes: TDefinitions['customAttributes'];
            typeName: TDefinitions['typeName'];
          },
          TFieldOperationTypes
        >
      } {
    (this as any).new = (params: any) => {
      const newInstance = new this(params);
      newInstance.__customImports = args.customImports || [];
      newInstance.__toStringCallback = args.toStringCallback || defaultToStringCallback;
      newInstance.__compareCallback = args.compareCallback || defaultCompareCallback;
      newInstance.__optionsCallback = args.optionsCallback || defaultOptionsCallback;
      newInstance.__newInstanceCallback = args.newInstanceCallback || defaultNewInstanceArgumentsCallback;
      newInstance.__typeName = args.typeName;
      newInstance.__allowedQueryOperations = new Set(['is', 'eq', 'greaterThan', 'lessThan', 'like', 'between']);
      (newInstance as any)['__customAttributes'] = params;
      return newInstance
    };

    return this as unknown as any;
  }

  /**
   * This method enables the framework to automatically import the files when generating the migrations.
   *
   * This is generally useful for custom field types.
   *
   * @return - Returns a list of packages that we want to import in the migration file.
   */
  // eslint-disable-next-line ts/require-await
  protected async __getCustomImports(): Promise<CustomImportsForFieldType[]> {
    return this['__customImports'];
  }

  protected __init(fieldName: string, model: ModelType<any, any> & typeof Model & typeof BaseModel) {
    const isAlreadyInitialized = (this.__model as any) !== undefined && typeof this.__fieldName === 'string';
    if (isAlreadyInitialized) return;

    const isUnderscored: boolean = (this.__underscored || (model as any).__cachedOptions?.underscored) === true;
    this.__fieldName = fieldName;
    this.__model = model;

    if (this.__primaryKey) model['__primaryKeys'].push(this.__fieldName);
    if (isUnderscored)
      this.__databaseName = utils.camelCaseToHyphenOrSnakeCase(this.__fieldName) as TDefinitions['databaseName'];
    else this.__databaseName = this.__fieldName as TDefinitions['databaseName'];
  }

  /**
   * Gets all of the arguments to pass to the field during migration, translation, etc.
   *
   * Everything in the field is protected, this way end users don't access the internal implementation.
   */
  protected __getArguments(): ReturnType<Field<any, any, any>['__getArgumentsCallback']> {
    return this.__getArgumentsCallback(this, defaultGetArgumentsCallback);
  }

  // eslint-disable-next-line ts/require-await
  protected async __toString(indentation = 0, customParams: string | undefined = undefined): Promise<string> {
    return this.__toStringCallback(this, defaultToStringCallback, indentation, customParams);
  }

  /**
   * Used for comparing one field with the other so we are able to tell if they are different or not.
   *
   * This is obligatory to add if you create any custom fields.
   *
   * For custom fields you will call this super method before continuing, we first check if they are the same type.
   *
   * @param field - The field to compare to.
   *
   * @return - Returns true if the fields are equal and false otherwise
   */
  // eslint-disable-next-line ts/require-await
  protected __compare(field: Field<any, any, any>): [boolean, string[]] {
    return this.__compareCallback(this, field, defaultCompareCallback);
  }

  /**
   * Used for cloning the field to a new field.
   *
   * @param oldField - The field to clone. If not provided it will use the current field.
   *
   * @returns - Returns the cloned field.
   */
  protected __clone(
    oldField: Field<any, any, any>,
    args?: {
      newInstanceOverrideCallback?: (args: any[]) => any[];
      optionsOverrideCallback?: Partial<Record<keyof ReturnType<Field['__getArguments']>, (oldValue: any) => any>>;
    }
  ): Field<any, any, any> {
    const argumentsToPass = oldField.__newInstanceCallback(oldField, defaultNewInstanceArgumentsCallback);
    const overridenArguments = args?.newInstanceOverrideCallback?.(argumentsToPass) || argumentsToPass;
    const newInstanceOfField = (oldField.constructor as typeof Field).new(
      ...(Array.isArray(overridenArguments) ? overridenArguments : [])
    );

    oldField.__optionsCallback(
      (hiddenAttributeName, getAttributesAttributeName, value) => {
        let actualValueToSet = value;
        if (
          getAttributesAttributeName &&
          (args?.optionsOverrideCallback as any)?.[getAttributesAttributeName] !== undefined
        )
          actualValueToSet = (args?.optionsOverrideCallback as any)[getAttributesAttributeName](value);

        (newInstanceOfField as any)[hiddenAttributeName] = actualValueToSet;
      },
      oldField,
      defaultOptionsCallback
    );

    return newInstanceOfField;
  }

  /**
   * You should not use this method directly, it is used internally by the framework.
   *
   * This method is used to create a new instance of the field with the same options as the old field.
   */
  static new<
    TType extends { create: any; read: any; update: any },
    TDefinitions extends {
      unique: boolean;
      auto: boolean;
      allowNull: boolean;
      dbIndex: boolean;
      isPrimaryKey: boolean;
      defaultValue: any;
      underscored: boolean;
      typeName: string;
      databaseName: string | undefined;
      engineInstance: DatabaseAdapter;
      customAttributes: any;
      hasDefaultValue: boolean;
    } & Record<string, any>,
    TFieldOperationTypes extends FieldWithOperationTypeForSearch<any>
  >(..._args: any[]): Field<TType, TDefinitions, TFieldOperationTypes> {
    return new this(..._args) as unknown as any
  }
}

const field = Field._overrideType<
  { create: string; read: string; update: string },
  {
    customAttributes: { name: string };
    unique: boolean;
    auto: boolean;
    allowNull: boolean;
    dbIndex: boolean;
    isPrimaryKey: boolean;
    defaultValue: any;
    typeName: string;
    allowedQueryOperations: FieldWithOperationTypeForSearch<string> & {
      notIn: string;
    };
    engineInstance: any;
  },
  any
>({
  typeName: 'Field'
});
/*
const newField = Field.new({ name: 'hey' })._setPartialAttributes<
  { create: string; read: string; update: string },
  { create: 'replace'; read: 'replace'; update: 'replace' },
  FieldWithOperationTypeForSearch<string> & {
    notIn: string;
  }
>()({});

type AllowedQuery =
  typeof newField extends Field<
    any,
    {
      unique: any;
      auto: any;
      allowNull: any;
      dbIndex: any;
      isPrimaryKey: any;
      defaultValue: any;
      hasDefaultValue: any;
      underscored: any;
      databaseName: any;
      engineInstance: any;
      customAttributes: any;
      typeName: any;
      allowedQueryOperations: infer TAllowedQueryOperations extends FieldWithOperationTypeForSearch<any>;
    }
  >
    ? TAllowedQueryOperations
    : 'no';
*/
