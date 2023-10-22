import { CharField, EngineFieldParser, Field, TextField, UuidField, Model, Engine } from '@palmares/databases';
import { ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngine from '../engine';
import { appendIndexes } from '../utils';

export default class SequelizeEngineFieldParser extends EngineFieldParser {
  async textFieldValidations(field: CharField | TextField) {
    return {
      validate: {
        notEmpty: typeof field.allowBlank === 'boolean' ? !field.allowBlank : false,
      },
    } as ModelAttributeColumnOptions;
  }

  async translate({
    engine,
    field,
    modelName,
  }: {
    engine: SequelizeEngine;
    field: Field;
    fieldParser: SequelizeEngineFieldParser;
    modelName: string;
    model: InstanceType<ReturnType<typeof Model>>;
    lazyEvaluate: (translatedField: any) => void;
  }): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = {} as ModelAttributeColumnOptions;
    const isFieldAIndexOrIsFieldUnique = field.dbIndex === true || (field.unique as boolean) === true;

    if (isFieldAIndexOrIsFieldUnique) appendIndexes(engine.connectionName, modelName, field);

    const hasNotYetSetDefaultValueForField = defaultOptions.defaultValue === undefined;
    if (hasNotYetSetDefaultValueForField) defaultOptions.defaultValue = field.defaultValue;

    defaultOptions.autoIncrement = field.isAuto;
    defaultOptions.autoIncrementIdentity = field.isAuto;
    defaultOptions.primaryKey = field.primaryKey;
    defaultOptions.allowNull = field.allowNull;
    defaultOptions.unique = field.unique;
    defaultOptions.validate = {};
    defaultOptions.validate.notNull = !field.allowNull;
    defaultOptions.field = field.databaseName;

    const customAttributesOfFieldEntries = Object.entries(field.customAttributes);
    for (const [key, value] of customAttributesOfFieldEntries) {
      const keyAsTypeofModelColumnOption = key as keyof ModelAttributeColumnOptions;
      defaultOptions[keyAsTypeofModelColumnOption] = value as never;
    }

    const isFieldOfTypeText =
      field.typeName === TextField.name || field.typeName === CharField.name || field.typeName === UuidField.name;
    if (isFieldOfTypeText) this.textFieldValidations(field as TextField);

    return defaultOptions;
  }
}
