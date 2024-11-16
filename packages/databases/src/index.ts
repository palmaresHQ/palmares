import { databasesDomain as DatabasesDomain } from './domain';
import { model as Model, Model as ModelBaseClass } from './models';
import * as fields from './models/fields';
import { Manager } from './models/manager';
import { initialize, model } from './models/model';

import type { DatabaseAdapter } from './engine';
import type { AutoField, BigIntegerField } from './models/fields';
import type {
  ExtractFieldNameOptionsOfModel,
  ExtractFieldOperationTypeForSearch,
  ExtractTypeFromFieldOfAModel,
  FieldWithOperationTypeForSearch
} from './models/fields/types';
import type { ModelType } from './models/model';
import type { ModelFieldsType, ModelOptionsType } from './models/types';
import type { ExtractFieldsFromAbstracts, ExtractManagersFromAbstracts } from './types';

export { Manager };
export { GetQuerySet, QuerySet, RemoveQuerySet, SetQuerySet } from './queries/queryset';
export { ON_DELETE } from './models/fields';
export * from './types';
export { DatabaseAdapter, databaseAdapter } from './engine';
export { AdapterQuery, adapterQuery } from './engine/query';
export { AdapterOrderingQuery, adapterOrderingQuery } from './engine/query/ordering';
export { AdapterSearchQuery, adapterSearchQuery } from './engine/query/search';
export { AdapterGetQuery, adapterGetQuery } from './engine/query/get';
export { AdapterSetQuery, adapterSetQuery } from './engine/query/set';
export { AdapterRemoveQuery, adapterRemoveQuery } from './engine/query/remove';
export { AdapterModels, adapterModels } from './engine/model';
export { AdapterFields, adapterFields } from './engine/fields';
export { AdapterMigrations, adapterMigrations } from './engine/migrations';
export { AdapterAutoFieldParser, adapterAutoFieldParser } from './engine/fields/auto';
export { AdapterBigAutoFieldParser, adapterBigAutoFieldParser } from './engine/fields/big-auto';
export { AdapterBigIntegerFieldParser, adapterBigIntegerFieldParser } from './engine/fields/big-integer';
export { AdapterCharFieldParser, adapterCharFieldParser } from './engine/fields/char';
export { AdapterDateFieldParser, adapterDateFieldParser } from './engine/fields/date';
export { AdapterDecimalFieldParser, adapterDecimalFieldParser } from './engine/fields/decimal';
export { AdapterForeignKeyFieldParser, adapterForeignKeyFieldParser } from './engine/fields/foreign-key';
export { AdapterIntegerFieldParser, adapterIntegerFieldParser } from './engine/fields/integer';
export { AdapterTextFieldParser, adapterTextFieldParser } from './engine/fields/text';
export { AdapterUuidFieldParser, adapterUuidFieldParser } from './engine/fields/uuid';
export { AdapterEnumFieldParser, adapterEnumFieldParser } from './engine/fields/enum';
export { AdapterFieldParser, adapterFieldParser } from './engine/fields/field';
export { AdapterBooleanFieldParser, adapterBooleanFieldParser } from './engine/fields/boolean';
export * from './engine/types';
export {
  model as Model,
  Model as ModelBaseClass,
  initialize as define,
  BaseModel as InternalModelClass_DoNotUse
} from './models';
export * as fields from './models/fields';
export const models = {
  fields,
  Model,
  ModelBaseClass
};
export { AutoField, auto } from './models/fields/auto';
export { BigAutoField, bigAuto } from './models/fields/big-auto';
export { BigIntegerField, bigInt } from './models/fields/big-integer';
export { CharField, char } from './models/fields/char';
export { DateField, date } from './models/fields/date';
export { DecimalField, decimal } from './models/fields/decimal';
export { Field } from './models/fields/field';
export { ForeignKeyField, foreignKey } from './models/fields/foreign-key';
export { IntegerField, int } from './models/fields/integer';
export { TextField, text } from './models/fields/text';
export { UuidField, uuid } from './models/fields/uuid';
export { EnumField, choice } from './models/fields/enum';
export { BooleanField, bool } from './models/fields/boolean';

export * from './models/types';
export * as actions from './migrations/actions';
export { Migration } from './migrations/migrate/migration';
export { Databases } from './databases';
export type { DatabaseDomainInterface } from './interfaces';
export { databaseDomainModifier } from './domain';
export { generateUUID } from './utils/index';
export { queryset } from './queries/utils';

export type { ForeignKeyModelsRelatedName, ForeignKeyModelsRelationName } from './queries/queryset';
export { DatabasesDomain };
export { setDatabaseConfig } from './standalone';
export default DatabasesDomain;

/**
 * Retrieves the model and fields with the default adapter previously assigned.
 *
 * This way you can have typesafety when defining custom attributes for the models and the fields.
 *
 * @returns - An object that you can export and use to create your models and fields.
 */
export function getDatabasesWithDefaultAdapter<TAdapter extends typeof DatabaseAdapter<any>>() {
  return {
    define: <
      TTypeName extends string,
      const TCustomOptions extends Parameters<InstanceType<TAdapter>['models']['translate']>[5],
      const TFields extends ModelFieldsType,
      const TAbstracts extends readonly {
        new (): {
          fields: any;
          options?: any;
        };
      }[],
      const TOptions extends ModelOptionsType<{ fields: TFields; abstracts: TAbstracts }, TCustomOptions>,
      TManagers extends {
        [managerName: string]:
          | Manager<any, { customOptions: TCustomOptions; engineInstance: InstanceType<TAdapter> }>
          | {
              [functionName: string]: (
                this: Manager<
                  ReturnType<
                    typeof model<{
                      fields: ExtractFieldsFromAbstracts<TFields, TAbstracts>;
                      options: TOptions;
                    }>
                  > & {
                    fields: ExtractFieldsFromAbstracts<TFields, TAbstracts>;
                    options: TOptions;
                    // eslint-disable-next-line no-shadow
                  },
                  { customOptions: TCustomOptions; engineInstance: InstanceType<TAdapter> }
                >,
                ...args: any
              ) => any;
            };
      }
    >(
      modelName: TTypeName,
      args: {
        fields: TFields;
        options?: TOptions;
        abstracts?: TAbstracts;
        managers?: TManagers;
      }
    ): (TManagers extends undefined
      ? unknown
      : ExtractManagersFromAbstracts<TAbstracts> & {
          [TManagerName in keyof TManagers]: Manager<
            any,
            { customOptions: TCustomOptions; engineInstance: InstanceType<TAdapter> }
          > & {
            [TFunctionName in keyof TManagers[TManagerName]]: TManagers[TManagerName][TFunctionName];
          };
        }) &
      ModelType<
        { fields: ExtractFieldsFromAbstracts<TFields, TAbstracts>; options: TOptions },
        { engineInstance: InstanceType<TAdapter>; customOptions: TCustomOptions }
      > => {
      return initialize(modelName, args) as any;
    },
    Model: <
      TModel,
      TDefinitions extends {
        engineInstance: InstanceType<TAdapter>;
        customOptions: any;
      } = {
        engineInstance: InstanceType<TAdapter>;
        customOptions: any;
      }
    >(): ModelType<TModel, TDefinitions> => model() as any,
    fields: {
      auto: (
        ..._args: any[]
      ): AutoField<
        {
          create: number | undefined;
          read: number;
          update: number | undefined;
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
          engineInstance: InstanceType<TAdapter>;
          customAttributes: any;
        },
        Pick<
          FieldWithOperationTypeForSearch<number>,
          'lessThan' | 'greaterThan' | 'and' | 'in' | 'or' | 'eq' | 'is' | 'between'
        >
      > => fields.AutoField.new(..._args) as any,
      bigAuto: (
        ..._args: any[]
      ): fields.BigAutoField<
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
          engineInstance: InstanceType<TAdapter>;
          customAttributes: any;
        },
        Pick<
          FieldWithOperationTypeForSearch<number | bigint>,
          'lessThan' | 'greaterThan' | 'and' | 'in' | 'or' | 'eq' | 'is' | 'between'
        >
      > => fields.BigAutoField.new(..._args) as any,
      bigInt: (
        ..._args: any[]
      ): BigIntegerField<
        {
          create: bigint | number;
          read: bigint | number;
          update: bigint | number;
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
          engineInstance: InstanceType<TAdapter>;
          customAttributes: any;
        },
        Pick<
          FieldWithOperationTypeForSearch<bigint | number>,
          'lessThan' | 'greaterThan' | 'and' | 'in' | 'or' | 'eq' | 'is' | 'between'
        >
      > => fields.BigIntegerField.new(..._args) as any,
      int: (
        ..._args: any[]
      ): fields.IntegerField<
        {
          create: number;
          read: number;
          update: number;
        },
        {
          unique: false;
          allowNull: false;
          dbIndex: false;
          underscored: true;
          isPrimaryKey: false;
          auto: false;
          defaultValue: undefined;
          hasDefaultValue: false;
          typeName: string;
          databaseName: undefined;
          engineInstance: InstanceType<TAdapter>;
          customAttributes: any;
        },
        Pick<
          FieldWithOperationTypeForSearch<number>,
          'eq' | 'is' | 'greaterThan' | 'lessThan' | 'between' | 'and' | 'or'
        >
      > => fields.IntegerField.new(..._args) as any,
      text: (
        ..._args: any[]
      ): fields.TextField<
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
          engineInstance: InstanceType<TAdapter>;
          customAttributes: any;
        },
        Pick<FieldWithOperationTypeForSearch<string>, 'like' | 'and' | 'in' | 'or' | 'eq' | 'is'>
      > => fields.TextField.new(..._args) as any,
      char: <const TMaxCharLength extends number>(args: {
        maxLen: TMaxCharLength;
      }): fields.CharField<
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
          defaultValue: undefined;
          typeName: string;
          hasDefaultValue: false;
          databaseName: undefined;
          engineInstance: InstanceType<TAdapter>;
          customAttributes: any;
          maxLength: TMaxCharLength;
        },
        Pick<FieldWithOperationTypeForSearch<string>, 'like' | 'and' | 'in' | 'or' | 'eq' | 'is'>
      > => fields.CharField.new(args) as any,
      uuid: (
        ..._args: any[]
      ): fields.UuidField<
        {
          create: string;
          read: string;
          update: string;
        },
        {
          unique: false;
          allowNull: false;
          allowBlank: true;
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
        },
        Pick<FieldWithOperationTypeForSearch<string>, 'like' | 'and' | 'in' | 'or' | 'eq' | 'is'>
      > => fields.UuidField.new(..._args) as any,
      date: (
        ..._args: any[]
      ): fields.DateField<
        {
          create: string | Date;
          read: string | Date;
          update: string | Date;
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
          engineInstance: InstanceType<TAdapter>;
          customAttributes: any;
          autoNow: false;
          autoNowAdd: false;
        },
        Pick<
          FieldWithOperationTypeForSearch<string | Date>,
          'eq' | 'is' | 'greaterThan' | 'lessThan' | 'between' | 'and' | 'or'
        >
      > => fields.DateField.new(..._args) as any,
      decimal: <const TMaxDigits extends number, const TDecimalPlaces extends number>(params: {
        maxDigits: TMaxDigits;
        decimalPlaces: TDecimalPlaces;
      }): fields.DecimalField<
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
          engineInstance: InstanceType<TAdapter>;
          customAttributes: any;
          maxDigits: TMaxDigits;
          decimalPlaces: TDecimalPlaces;
        },
        Pick<
          FieldWithOperationTypeForSearch<string | number>,
          'greaterThan' | 'lessThan' | 'between' | 'and' | 'in' | 'or' | 'eq' | 'is'
        >
      > => fields.DecimalField.new(params) as any,
      boolean: (
        ...args: any[]
      ): fields.BooleanField<
        {
          create: boolean;
          read: boolean;
          update: boolean;
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
          engineInstance: InstanceType<TAdapter>;
          customAttributes: any;
        },
        Pick<FieldWithOperationTypeForSearch<boolean>, 'and' | 'in' | 'or' | 'eq' | 'is'>
      > => fields.BooleanField.new(...args) as any,
      enum: <const TChoices extends string[]>(args: {
        choices: TChoices;
      }): fields.EnumField<
        {
          create: TChoices[number];
          read: TChoices[number];
          update: TChoices[number];
        },
        {
          unique: false;
          allowNull: false;
          dbIndex: false;
          underscored: true;
          isPrimaryKey: false;
          auto: false;
          defaultValue: undefined;
          typeName: string;
          hasDefaultValue: false;
          databaseName: undefined;
          engineInstance: InstanceType<TAdapter>;
          customAttributes: any;
          choices: TChoices;
        },
        Pick<FieldWithOperationTypeForSearch<TChoices[number]>, 'and' | 'in' | 'or' | 'eq' | 'is'>
      > => fields.EnumField.new(args) as any,
      foreignKey: <
        const TRelatedTo extends any | (() => any) | ((_: { create: any; read: any; update: any }) => any),
        const TForeignKeyParams extends {
          toField: ExtractFieldNameOptionsOfModel<TRelatedTo>;
          onDelete: fields.ON_DELETE;
          relatedName: string;
          relationName: string;
        }
      >(
        params: TForeignKeyParams & {
          relatedTo: TRelatedTo;
        }
      ): fields.ForeignKeyField<
        {
          create: TRelatedTo extends () => any
            ? ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'create'>
            : TRelatedTo extends (_: { create: any; read: any; update: any }) => any
              ? TRelatedTo extends (_: { create: infer TCreate; read: any; update: any }) => any
                ? TCreate
                : never
              : ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'create'>;
          read: TRelatedTo extends () => any
            ? ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'read'>
            : TRelatedTo extends (_: { create: any; read: any; update: any }) => any
              ? TRelatedTo extends (_: { create: any; read: infer TRead; update: any }) => any
                ? TRead
                : never
              : ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'read'>;
          update: TRelatedTo extends () => any
            ? ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'update'>
            : TRelatedTo extends (_: { create: any; read: any; update: any }) => any
              ? TRelatedTo extends (_: { create: any; read: any; update: infer TUpdate }) => any
                ? TUpdate
                : never
              : ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'update'>;
        },
        {
          onDelete: TForeignKeyParams['onDelete'];
          relatedName: TForeignKeyParams['relatedName'];
          relationName: TForeignKeyParams['relationName'];
          toField: TForeignKeyParams['toField'];
          unique: false;
          auto: false;
          allowNull: false;
          dbIndex: false;
          isPrimaryKey: false;
          defaultValue: any;
          hasDefaultValue: false;
          underscored: true;
          typeName: string;
          databaseName: string | undefined;
          engineInstance: InstanceType<TAdapter>;
          customAttributes: any;
          relatedTo: TRelatedTo;
        },
        ExtractFieldOperationTypeForSearch<TRelatedTo, TForeignKeyParams['toField']>
      > => fields.ForeignKeyField.new(params) as any
    }
  };
}
