import {
  CharField,
  EngineFieldParser,
  Field,
  TextField,
  UUIDField,
} from '@palmares/databases';
import { ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFields from '.';

export default class SequelizeEngineFieldParser extends EngineFieldParser {
  engineFields!: SequelizeEngineFields;

  async textFieldValidations(field: CharField | TextField) {
    return {
      validate: {
        notEmpty:
          typeof field.allowBlank === 'boolean' ? !field.allowBlank : false,
      },
    } as ModelAttributeColumnOptions;
  }

  async translate(field: Field): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = {} as ModelAttributeColumnOptions;
    const isFieldAIndexOrIsFieldUnique =
      field.dbIndex === true || (field.unique as boolean) === true;

    if (isFieldAIndexOrIsFieldUnique)
      await this.engineFields.appendIndexes(field);

    const hasNotYetSetDefaultValueForField =
      defaultOptions.defaultValue === undefined;
    if (hasNotYetSetDefaultValueForField)
      defaultOptions.defaultValue = field.defaultValue;

    defaultOptions.primaryKey = field.primaryKey;
    defaultOptions.allowNull = field.allowNull;
    defaultOptions.unique = field.unique;
    defaultOptions.validate = {};
    defaultOptions.validate.notNull = !field.allowNull;
    defaultOptions.field = field.databaseName;

    const customAttributesOfFieldEntries = Object.entries(
      field.customAttributes
    );
    for (const [key, value] of customAttributesOfFieldEntries) {
      const keyAsTypeofModelColumnOption =
        key as keyof ModelAttributeColumnOptions;
      defaultOptions[keyAsTypeofModelColumnOption] = value as never;
    }

    const isFieldOfTypeText =
      field.typeName === TextField.name ||
      field.typeName === CharField.name ||
      field.typeName === UUIDField.name;
    if (isFieldOfTypeText) this.textFieldValidations(field as TextField);

    return defaultOptions;
  }
}
