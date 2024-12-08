import { Field, type FieldWithOperationType, TextField } from '@palmares/databases';
import { blob as dSqliteBlob } from 'drizzle-orm/sqlite-core';

import { DefaultBuilder } from './utils';

import type { integer as dSqliteInteger, text as dSqliteText } from 'drizzle-orm/sqlite-core';

export function real() {
  const RealField = Field._overrideType<
    {
      create: number;
      update: number;
      read: number;
    },
    {
      customAttributes: any;
      unique: any;
      auto: any;
      allowNull: any;
      dbIndex: any;
      isPrimaryKey: any;
      defaultValue: any;
      typeName: any;
      engineInstance: any;
    },
    Pick<FieldWithOperationType<number>, 'lessThan' | 'greaterThan' | 'and' | 'in' | 'or' | 'eq' | 'is' | 'between'>
  >({
    typeName: 'real'
  });

  const instance = RealField.new({}).allowNull(false);

  return instance._setNewBuilderMethods<DefaultBuilder<typeof instance>>();
}

export function integer(args: Parameters<typeof dSqliteInteger>[1]) {
  const IntegerField = Field._overrideType<
    {
      create: number;
      update: number;
      read: number;
    },
    {
      customAttributes: any;
      unique: any;
      auto: any;
      allowNull: any;
      dbIndex: any;
      isPrimaryKey: any;
      defaultValue: any;
      typeName: any;
      engineInstance: any;
    },
    Pick<FieldWithOperationType<number>, 'lessThan' | 'greaterThan' | 'and' | 'in' | 'or' | 'eq' | 'is' | 'between'>
  >({
    typeName: 'integer'
  });

  const instance = IntegerField.new({}).allowNull(false);
  instance['__customAttributes'] = {
    args: args
  };

  return instance._setNewBuilderMethods<DefaultBuilder<typeof instance>>();
}

export function text<const TParams extends Parameters<typeof dSqliteText>[1]>(args: TParams) {
  const CustomTextField = TextField._overrideType<
    {
      create: TParams extends { enum: infer TEnum extends readonly any[] } ? TEnum[number] : string;
      update: TParams extends { enum: infer TEnum extends readonly any[] } ? TEnum[number] : string;
      read: TParams extends { enum: infer TEnum extends readonly any[] } ? TEnum[number] : string;
    },
    {
      allowBlank: true;
      customAttributes: any;
      unique: any;
      auto: any;
      allowNull: true;
      hasDefaultValue: any;
      dbIndex: any;
      isPrimaryKey: any;
      defaultValue: any;
      typeName: any;
      engineInstance: any;
    },
    Pick<
      FieldWithOperationType<TParams extends { enum: infer TEnum extends readonly any[] } ? TEnum[number] : string>,
      'and' | 'in' | 'or' | 'eq' | 'is'
    >
  >({
    typeName: 'text'
  });

  const instance = CustomTextField.new({}).allowNull(false).allowBlank(true);
  instance['__customAttributes'] = {
    args: args
  };
  return instance._setNewBuilderMethods<DefaultBuilder<typeof instance>>(new DefaultBuilder(instance, 'text'));
}

export function blob(args?: Parameters<typeof dSqliteText>[1]) {
  const CustomTextField = Field._overrideType<
    {
      create: any;
      update: any;
      read: any;
    },
    {
      customAttributes: any;
      unique: any;
      auto: any;
      allowNull: true;
      hasDefaultValue: any;
      dbIndex: any;
      isPrimaryKey: any;
      defaultValue: any;
      typeName: any;
      engineInstance: any;
    },
    Pick<FieldWithOperationType<any>, 'and' | 'in' | 'or' | 'eq' | 'is'>
  >({
    typeName: 'text'
  });

  const instance = CustomTextField.new({}).allowNull(false);
  instance['__customAttributes'] = {
    args: args
  };
  return instance._setNewBuilderMethods<DefaultBuilder<typeof instance>>();
}
