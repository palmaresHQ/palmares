import { utils } from '@palmares/core';

import {
  defaultCompareCallback,
  defaultNewInstanceArgumentsCallback,
  defaultOptionsCallback,
  defaultToStringCallback
} from './utils';

import type { CustomImportsForFieldType, FieldDefaultParamsType, MaybeNull } from './types';
import type { NewInstanceArgumentsCallback, TCompareCallback, TOptionsCallback, ToStringCallback } from './utils';
import type { DatabaseAdapter } from '../../engine';
import type { AdapterFieldParser as EngineFieldParser } from '../../engine/fields/field';
import type { This } from '../../types';
import type { ModelType } from '../types';
/*
/**
 * This is the default field of the model, every other field type should override this
 * one but this one SHOULDN't be called directly.
 * Generally we do not offer any translation to this type of field.
 * /
export class Field<
  TType extends { input: any; output: any } = { input: any; output: any },
  TField extends Field = any,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any
> {
  protected $$type = '$PField';
  inputParsers = new Map<string, Required<EngineFieldParser>['inputParser']>();
  outputParsers = new Map<string, Required<EngineFieldParser>['outputParser']>();
  isAuto!: TAuto;
  hasDefaultValue!: TDefaultValue extends undefined ? false : true;
  _type!: TType;
  primaryKey: boolean;
  defaultValue?: TDefaultValue;
  allowNull: TNull;
  unique: TUnique;
  dbIndex: boolean;
  databaseName: TDatabaseName;
  underscored: boolean;
  typeName: string = Field.name;
  customAttributes: TCustomAttributes;
  model!: ModelType;
  fieldName!: string;

  constructor(
    params: FieldDefaultParamsType<TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> = {}
  ) {
    this.primaryKey = typeof params.primaryKey === 'boolean' ? params.primaryKey : false;
    this.defaultValue = params.defaultValue as TDefaultValue;
    this.allowNull = typeof params.allowNull === 'boolean' ? params.allowNull : (false as TNull);
    this.unique = typeof params.unique === 'boolean' ? params.unique : (false as TUnique);
    this.isAuto = typeof params.isAuto === 'boolean' ? params.isAuto : (false as TAuto);
    this.dbIndex = typeof params.dbIndex === 'boolean' ? params.dbIndex : false;
    this.databaseName = params.databaseName || ('' as TDatabaseName);
    this.underscored = params.underscored || false;
    this.customAttributes = params.customAttributes || ({} as TCustomAttributes);
  }

  static new<
    TFieldInstance extends This<typeof Field>,
    // eslint-disable-next-line no-shadow
    TDefaultValue extends TNull extends true
      ? InstanceType<TFieldInstance>['_type']['input'] | undefined | null
      : InstanceType<TFieldInstance>['_type']['input'] | undefined = undefined,
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
    return new this(params);
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
   * /
  static overrideType<TNewType extends { input: any; output: any }, TCustomAttributes>() {
    return this as unknown as {
      new: <
        // eslint-disable-next-line no-shadow
        TDefaultValue extends MaybeNull<Field['_type']['input'] | undefined, TNull> = undefined,
        // eslint-disable-next-line no-shadow
        TUnique extends boolean = false,
        // eslint-disable-next-line no-shadow
        TNull extends boolean = false,
        // eslint-disable-next-line no-shadow
        TAuto extends boolean = false,
        // eslint-disable-next-line no-shadow
        TDatabaseName extends string | null | undefined = undefined
      >(
        params?: FieldDefaultParamsType<Field, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>
      ) => Field<TNewType, Field, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;
    };
  }

  /**
   * This method enables the framework to automatically import the files when generating the migrations.
   *
   * This is generally useful for custom field types.
   *
   * @return - Returns a list of packages that we want to import in the migration file.
   * /
  // eslint-disable-next-line ts/require-await
  async customImports(): Promise<CustomImportsForFieldType[]> {
    return [];
  }

  init(fieldName: string, model: ModelType) {
    const isAlreadyInitialized = (this.model as any) !== undefined && typeof this.fieldName === 'string';
    if (isAlreadyInitialized) return;

    const isUnderscored: boolean = (this.underscored || (model as any).__cachedOptions?.underscored) === true;
    this.fieldName = fieldName;
    this.model = model;

    if (this.primaryKey) model.primaryKeys.push(this.fieldName);
    if (isUnderscored) this.databaseName = utils.camelCaseToHyphenOrSnakeCase(this.fieldName) as TDatabaseName;
    else this.databaseName = this.fieldName as TDatabaseName;
  }

  // eslint-disable-next-line ts/require-await
  async toString(indentation = 0, customParams: string | undefined = undefined): Promise<string> {
    const ident = '  '.repeat(indentation);
    const fieldParamsIdent = '  '.repeat(indentation + 1);
    return (
      `${ident}models.fields.${this.constructor.name}.new({` +
      `${customParams ? `\n${customParams}` : ''}\n` +
      `${fieldParamsIdent}primaryKey: ${this.primaryKey},\n` +
      `${fieldParamsIdent}defaultValue: ${JSON.stringify(this.defaultValue)},\n` +
      `${fieldParamsIdent}allowNull: ${this.allowNull},\n` +
      `${fieldParamsIdent}unique: ${this.unique},\n` +
      `${fieldParamsIdent}dbIndex: ${this.dbIndex},\n` +
      `${fieldParamsIdent}databaseName: "${this.databaseName}",\n` +
      `${fieldParamsIdent}underscored: ${this.underscored},\n` +
      `${fieldParamsIdent}customAttributes: ${JSON.stringify(this.customAttributes)}\n` +
      `${ident}})`
    );
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
   * /
  // eslint-disable-next-line ts/require-await
  async compare(field: Field): Promise<[boolean, string[]]> {
    const isTypeNameEqual = field.typeName === this.typeName;
    const isAllowNullEqual = field.allowNull === this.allowNull;
    const isCustomAttributesEqual = JSON.stringify(field.customAttributes) === JSON.stringify(this.customAttributes);
    const isPrimaryKeyEqual = field.primaryKey === this.primaryKey;
    const isDefaultValueEqual = field.defaultValue === this.defaultValue;
    const isUniqueEqual = field.unique === this.unique;
    const isDbIndexEqual = field.dbIndex === this.dbIndex;
    const isDatabaseNameEqual = field.databaseName === this.databaseName;
    const isUnderscoredEqual = field.underscored === this.underscored;
    const changedAttributes = [
      !isTypeNameEqual && 'typeName',
      !isAllowNullEqual && 'allowNull',
      !isCustomAttributesEqual && 'customAttributes',
      !isPrimaryKeyEqual && 'primaryKey',
      !isDefaultValueEqual && 'defaultValue',
      !isUniqueEqual && 'unique',
      !isDbIndexEqual && 'dbIndex',
      !isDatabaseNameEqual && 'databaseName',
      !isUnderscoredEqual && 'underscored'
    ].filter((attr) => typeof attr === 'string');

    return [changedAttributes.length === 0, changedAttributes];
  }

  /**
   * Gets the options passed on the constructor of the field so that we are able to clone it to a new field.
   *
   * @param field - The field to get the options from. If not provided it will use the current field.
   *
   * @returns - Returns the options passed on the constructor of the field.
   * /
  // eslint-disable-next-line ts/require-await
  async constructorOptions(field?: Field) {
    if (!field) field = this as Field;
    return {
      allowNull: field.allowNull,
      customAttributes: field.customAttributes,
      defaultValue: field.defaultValue,
      dbIndex: field.dbIndex,
      databaseName: field.databaseName,
      isAuto: field.isAuto,
      primaryKey: field.primaryKey,
      underscored: field.underscored,
      unique: field.unique
    };
  }

  /**
   * Used for cloning the field to a new field.
   *
   * @param field - The field to clone. If not provided it will use the current field.
   *
   * @returns - Returns the cloned field.
   * /
  async clone(field?: Field): Promise<Field> {
    if (!field) field = this as Field;
    const constructorOptions = await this.constructorOptions(field);
    return (field.constructor as typeof Field).new(constructorOptions);
  }
}*/

/**
 * Used internally so we can override the internal behavior of Field when extending this field.
 *
 * **THIS SHOULD NOT BE USED DIRECTLY. IT DOES NOT OFFER ANY REAL FUNCTIONALITY, TYPESCRIPT ONLY.**
 * /
export class UnopinionatedField<
  TType extends { input: any; output: any } = { input: any; output: any },
  TField extends Field = any,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any
> extends Field<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
  constructor(params: any) {
    super(params);
  }

  static overrideType<TNewType extends { input: any; output: any }, TCustomAttributes = any>() {
    return this as unknown as {
      new: <
        // eslint-disable-next-line no-shadow
        TDefaultValue extends MaybeNull<Field['_type']['input'] | undefined, TNull> = undefined,
        // eslint-disable-next-line no-shadow
        TUnique extends boolean = false,
        // eslint-disable-next-line no-shadow
        TNull extends boolean = false,
        // eslint-disable-next-line no-shadow
        TAuto extends boolean = false,
        // eslint-disable-next-line no-shadow
        TDatabaseName extends string | null | undefined = undefined
      >(
        params?: any
      ) => UnopinionatedField<TNewType, Field, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;
    };
  }
}
*/

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
    defaultValue: any;
    underscored: boolean;
    typeName: string;
    databaseName: string | null | undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
  } & Record<string, any> = {
    unique: false;
    allowNull: false;
    dbIndex: false;
    underscored: true;
    isPrimaryKey: false;
    auto: false;
    defaultValue: undefined;
    typeName: string;
    databaseName: undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
  }
> {
  protected $$type = '$PField';
  protected static __typeName = 'Field';
  protected __isAuto!: TDefinitions['auto'];
  protected __hasDefaultValue!: boolean;
  protected __primaryKey!: boolean;
  protected __defaultValue?: TDefinitions['defaultValue'];
  protected __allowNull!: TDefinitions['allowNull'];
  protected __unique!: TDefinitions['unique'];
  protected __dbIndex!: TDefinitions['dbIndex'];
  protected __databaseName!: TDefinitions['databaseName'];
  protected __underscored!: TDefinitions['underscored'];
  protected __customAttributes!: Parameters<
    TDefinitions['engineInstance']['fields']['autoFieldParser']['translate']
  >[0]['customAttributes'];
  // eslint-disable-next-line ts/require-await
  protected static __toStringCallback: ToStringCallback = defaultToStringCallback;
  // eslint-disable-next-line ts/require-await
  protected static __compareCallback: TCompareCallback = defaultCompareCallback;
  protected static __optionsCallback: TOptionsCallback = defaultOptionsCallback;
  protected static __newInstanceCallback: NewInstanceArgumentsCallback = defaultNewInstanceArgumentsCallback;
  protected static __customImports: CustomImportsForFieldType[] = [];
  protected __inputParsers = new Map<string, Required<EngineFieldParser>['inputParser']>();
  protected __outputParsers = new Map<string, Required<EngineFieldParser>['outputParser']>();
  protected __model?: ModelType;
  protected __fieldName!: string;

  constructor(..._args: any[]) {}

  setCustomAttributes<
    const TCustomAttributes extends Parameters<
      TDefinitions['engineInstance']['fields']['autoFieldParser']['translate']
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
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TCustomAttributes;
    }
  > {
    (this.__customAttributes as any) = customAttributes as any;

    return this as unknown as Field<
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
        databaseName: TDefinitions['databaseName'];
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TCustomAttributes;
      }
    >;
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
      >]: TDefinitions[TKey];
    } & {
      unique: TUnique;
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    }
  > {
    if (typeof isUnique !== 'boolean') isUnique = true as TUnique;
    this.__unique = isUnique;

    return this as unknown as Field<
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
        unique: TUnique;
        allowNull: TDefinitions['allowNull'];
        dbIndex: TDefinitions['dbIndex'];
        underscored: TDefinitions['underscored'];
        isPrimaryKey: TDefinitions['isPrimaryKey'];
        auto: TDefinitions['auto'];
        defaultValue: TDefinitions['defaultValue'];
        databaseName: TDefinitions['databaseName'];
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TDefinitions['customAttributes'];
      }
    >;
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
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TNull;
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    }
  > {
    if (typeof isNull !== 'boolean') isNull = true as TNull;
    this.__allowNull = isNull;

    return this as unknown as Field<
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
        allowNull: TNull;
        dbIndex: TDefinitions['dbIndex'];
        underscored: TDefinitions['underscored'];
        isPrimaryKey: TDefinitions['isPrimaryKey'];
        auto: TDefinitions['auto'];
        defaultValue: TDefinitions['defaultValue'];
        databaseName: TDefinitions['databaseName'];
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TDefinitions['customAttributes'];
      }
    >;
  }

  /**
   * This method is used to create an index on the database for this field.
   */
  dbIndex<TDbIndex extends boolean = true>(
    dbIndex: TDbIndex
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
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDbIndex;
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    }
  > {
    if (typeof dbIndex !== 'boolean') dbIndex = true as TDbIndex;
    this.__dbIndex = dbIndex;

    return this as unknown as Field<
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
        dbIndex: TDbIndex;
        underscored: TDefinitions['underscored'];
        isPrimaryKey: TDefinitions['isPrimaryKey'];
        auto: TDefinitions['auto'];
        defaultValue: TDefinitions['defaultValue'];
        databaseName: TDefinitions['databaseName'];
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TDefinitions['customAttributes'];
      }
    >;
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
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TUnderscored;
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    }
  > {
    if (typeof isUnderscored !== 'boolean') isUnderscored = true as TUnderscored;
    this.__underscored = isUnderscored;

    return this as unknown as Field<
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
        underscored: TUnderscored;
        isPrimaryKey: TDefinitions['isPrimaryKey'];
        auto: TDefinitions['auto'];
        defaultValue: TDefinitions['defaultValue'];
        databaseName: TDefinitions['databaseName'];
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TDefinitions['customAttributes'];
      }
    >;
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
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TIsPrimaryKey;
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    }
  > {
    if (typeof isPrimaryKey !== 'boolean') isPrimaryKey = true as TIsPrimaryKey;
    this.__primaryKey = isPrimaryKey;

    return this as unknown as Field<
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
        isPrimaryKey: TIsPrimaryKey;
        auto: TDefinitions['auto'];
        defaultValue: TDefinitions['defaultValue'];
        databaseName: TDefinitions['databaseName'];
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TDefinitions['customAttributes'];
      }
    >;
  }

  auto<TIsAuto extends boolean = true>(
    isAuto?: TIsAuto
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
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TIsAuto;
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    }
  > {
    if (typeof isAuto !== 'boolean') isAuto = true as TIsAuto;
    this.__isAuto = isAuto;

    return this as unknown as Field<
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
        auto: TIsAuto;
        defaultValue: TDefinitions['defaultValue'];
        typeName: TDefinitions['typeName'];
        databaseName: TDefinitions['databaseName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TDefinitions['customAttributes'];
      }
    >;
  }

  default<TDefault extends TType['create']>(
    defaultValue: TDefault
  ): Field<
    {
      create: TDefault | null | undefined;
      read: TType['read'];
      update: TType['update'];
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
      defaultValue: TDefault;
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    }
  > {
    this.__defaultValue = defaultValue;

    return this as unknown as Field<
      {
        create: TDefault | null | undefined;
        read: TType['read'];
        update: TType['update'];
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
        defaultValue: TDefault;
        databaseName: TDefinitions['databaseName'];
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TDefinitions['customAttributes'];
      }
    >;
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
    }
  > {
    this.__databaseName = databaseName;

    return this as unknown as Field<
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
      }
    >;
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
  static overrideType<
    TNewType extends { create: any; update: any; read: any },
    TDefinitions extends {
      customAttributes: any;
      unique: boolean;
      auto: boolean;
      allowNull: boolean;
      dbIndex: boolean;
      isPrimaryKey: boolean;
      defaultValue: any;
      typeName: string;
      engineInstance: DatabaseAdapter;
    }
  >(args?: {
    typeName: string;
    toStringCallback?: ToStringCallback;
    compareCallback?: TCompareCallback;
    optionsCallback?: TOptionsCallback;
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
            underscored: boolean;
            databaseName: string | undefined;
            engineInstance: TDefinitions['engineInstance'];
            customAttributes: TDefinitions['customAttributes'];
            typeName: TDefinitions['typeName'];
          }
        >;
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
            underscored: boolean;
            databaseName: string | undefined;
            engineInstance: TDefinitions['engineInstance'];
            customAttributes: TDefinitions['customAttributes'];
            typeName: TDefinitions['typeName'];
          }
        >;
      } {
    this.__customImports = args?.customImports || [];
    this.__toStringCallback = args?.toStringCallback || defaultToStringCallback;
    this.__compareCallback = args?.compareCallback || defaultCompareCallback;
    this.__optionsCallback = args?.optionsCallback || defaultOptionsCallback;
    this.__newInstanceCallback = args?.newInstanceCallback || defaultNewInstanceArgumentsCallback;
    this.__typeName = args?.typeName || this.__typeName;
    (this as any).new = (params: any) => {
      const newInstance = new this(params);
      (newInstance as any)['__customAttributes'] = params;
      return newInstance;
    };

    return this as unknown as TDefinitions['customAttributes'] extends undefined
      ? {
          new: () => Field<
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
              engineInstance: TDefinitions['engineInstance'];
              typeName: TDefinitions['typeName'];
              customAttributes: TDefinitions['customAttributes'];
            }
          >;
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
              underscored: boolean;
              databaseName: string | undefined;
              engineInstance: TDefinitions['engineInstance'];
              typeName: TDefinitions['typeName'];
              customAttributes: TDefinitions['customAttributes'];
            }
          >;
        };
  }

  /**
   * This method enables the framework to automatically import the files when generating the migrations.
   *
   * This is generally useful for custom field types.
   *
   * @return - Returns a list of packages that we want to import in the migration file.
   */
  // eslint-disable-next-line ts/require-await
  protected async customImports(): Promise<CustomImportsForFieldType[]> {
    return (this.constructor as typeof Field<any, any>)['__customImports'];
  }

  protected init(fieldName: string, model: ModelType) {
    const isAlreadyInitialized = (this.__model as any) !== undefined && typeof this.__fieldName === 'string';
    if (isAlreadyInitialized) return;

    const isUnderscored: boolean = (this.__underscored || (model as any).__cachedOptions?.underscored) === true;
    this.__fieldName = fieldName;
    this.__model = model;

    if (this.__primaryKey) model.primaryKeys.push(this.__fieldName);
    if (isUnderscored)
      this.__databaseName = utils.camelCaseToHyphenOrSnakeCase(this.__fieldName) as TDefinitions['databaseName'];
    else this.__databaseName = this.__fieldName as TDefinitions['databaseName'];
  }

  // eslint-disable-next-line ts/require-await
  protected async toString(indentation = 0, customParams: string | undefined = undefined): Promise<string> {
    return (this.constructor as typeof Field<any, any>).__toStringCallback(
      this,
      defaultToStringCallback,
      indentation,
      customParams
    );
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
  protected async compare(field: Field<any, any>): Promise<[boolean, string[]]> {
    return (this.constructor as typeof Field<any, any>).__compareCallback(this, field, defaultCompareCallback);
  }

  /**
   * Used for cloning the field to a new field.
   *
   * @param oldField - The field to clone. If not provided it will use the current field.
   *
   * @returns - Returns the cloned field.
   */
  protected async clone(oldField: Field<any, any>): Promise<Field<any, any>> {
    const argumentsToPass = await (oldField.constructor as typeof Field<any, any>).__newInstanceCallback(
      oldField,
      defaultNewInstanceArgumentsCallback
    );
    const newInstanceOfField = (oldField.constructor as typeof Field).new(
      ...(Array.isArray(argumentsToPass) ? argumentsToPass : [])
    );
    await (oldField.constructor as typeof Field<any, any>).__optionsCallback(
      oldField,
      newInstanceOfField,
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
      databaseName: string | null | undefined;
      engineInstance: DatabaseAdapter;
      customAttributes: any;
    } & Record<string, any>
  >(..._args: any[]) {
    return new this(..._args) as unknown as Field<TType, TDefinitions>;
  }
}
