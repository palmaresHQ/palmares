import { Field } from './field';
import {
  defaultCompareCallback,
  defaultNewInstanceArgumentsCallback,
  defaultOptionsCallback,
  defaultToStringCallback
} from './utils';

import type { CustomImportsForFieldType, FieldDefaultParamsType, MaybeNull } from './types';
import type { NewInstanceArgumentsCallback, TCompareCallback, TOptionsCallback, ToStringCallback } from './utils';
import type { DatabaseAdapter } from '../..';
import type { This } from '../../types';

type Test = Exclude<keyof AutoField, 'new' | 'overrideType'>;
/**
 * Functional approach for the creation of an AutoField instance. An AutoField is a field that
 * is used as the primary key of the database.
 *
 * We recommend just using one AutoField per model (or BigAutoField) because you might face some
 * issues with certain ORM's. For ALL use cases, this
 * field should be an integer.
 *
 * @example
 * ```ts
 * const autoField = auto();
 * ```
 *
 * @example
 * ```
 * const autoField = auto();
 * ```
 */
export function auto(): AutoField<
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
    defaultValue: undefined;
    typeName: string;
    databaseName: undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
  }
> {
  return AutoField.new();
}

/**
 * We recommend just using one AutoField per model (or BigAutoField) because you might face some
 * issues with certain ORM's. For ALL use cases, this field should be an integer.
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
export class AutoField<
  TType extends { create: any; read: any; update: any } = {
    create: number | undefined | null;
    read: number;
    update: number | undefined | null;
  },
  TDefinitions extends {
    unique: boolean;
    auto: boolean;
    allowNull: boolean;
    dbIndex: boolean;
    isPrimaryKey: boolean;
    defaultValue: undefined;
    underscored: boolean;
    typeName: string;
    databaseName: string | null | undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
  } & Record<string, any> = {
    unique: true;
    allowNull: true;
    dbIndex: true;
    underscored: true;
    isPrimaryKey: true;
    auto: true;
    defaultValue: undefined;
    typeName: string;
    databaseName: undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
  }
> extends Field<TType, TDefinitions> {
  protected $$type = '$PAutoField';
  protected static __typeName = 'AutoField';
  protected __isAuto = true;
  protected __hasDefaultValue = false;
  protected __primaryKey = true;
  protected __defaultValue = undefined;
  protected __allowNull = true;
  protected __unique = true;
  protected __dbIndex = true;

  unique!: never;
  auto!: never;
  allowNull!: never;
  primaryKey!: never;
  dbIndex!: never;
  default!: never;

  setCustomAttributes<
    const TCustomAttributes extends Parameters<
      TDefinitions['engineInstance']['fields']['autoFieldParser']['translate']
    >[0]['customAttributes']
  >(customAttributes: TCustomAttributes) {
    return super.setCustomAttributes(customAttributes) as unknown as AutoField<
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

  underscored<TUnderscored extends boolean = true>(
    isUnderscored?: TUnderscored
  ): AutoField<
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
    return super.underscored(isUnderscored) as unknown as AutoField<
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

  databaseName<TDatabaseName extends string>(
    databaseName: TDatabaseName
  ): AutoField<
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
    return super.databaseName(databaseName) as unknown as AutoField<
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
        new: () => AutoField<
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
        new: (params: TDefinitions['customAttributes']) => AutoField<
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
    return super.overrideType(args) as unknown as TDefinitions['customAttributes'] extends undefined
      ? {
          new: () => AutoField<
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
          new: (params: TDefinitions['customAttributes']) => AutoField<
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

  static new(..._args: any[]): AutoField<
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
      defaultValue: undefined;
      typeName: string;
      databaseName: undefined;
      engineInstance: DatabaseAdapter;
      customAttributes: any;
    }
  > {
    return new this(..._args) as unknown as AutoField<
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
        defaultValue: undefined;
        typeName: string;
        databaseName: undefined;
        engineInstance: DatabaseAdapter;
        customAttributes: any;
      }
    >;
  }
}

const test = auto().underscored(false).setCustomAttributes({ user: 'aqui' });
