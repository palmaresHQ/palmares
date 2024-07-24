import { CharField, TextField, UuidField, adapterFieldParser } from '@palmares/databases';

import { appendIndexes } from '../utils';

import type { TranslatedFieldToEvaluateAfterType } from '../types';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';
import type { ModelAttributeColumnOptions } from 'sequelize';

// eslint-disable-next-line ts/require-await
async function textFieldValidations(field: CharField | TextField) {
  return {
    validate: {
      notEmpty: typeof field.allowBlank === 'boolean' ? !field.allowBlank : false
    }
  } as ModelAttributeColumnOptions;
}

export default adapterFieldParser({
  translate: async ({
    engine,
    field,
    modelName
  }: AdapterFieldParserTranslateArgs<
    any,
    any,
    any,
    TranslatedFieldToEvaluateAfterType
  >): Promise<ModelAttributeColumnOptions> => {
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
    if (isFieldOfTypeText) await textFieldValidations(field as TextField);

    return defaultOptions;
  }
});
