import { CharField, EngineFieldParser, Field, TextField, UUIDField } from '@palmares/databases';
import { ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineAutoFieldParser from './auto';
import SequelizeEngineBigAutoFieldParser from './big-auto';
import SequelizeEngineBigIntegerFieldParser from './big-integer';
import SequelizeEngineCharFieldParser from './char';
import SequelizeEngineDateFieldParser from './date';
import SequelizeEngineDecimalFieldParser from './decimal';
import SequelizeEngineForeignKeyFieldParser from './foreign-key';
import SequelizeEngineIntegerFieldParser from './integer';
import SequelizeEngineTextFieldParser from './text';
import SequelizeEngineUuidFieldParser from './uuid';
import SequelizeEngineEnumFieldParser from './enum';
import SequelizeEngineBooleanFieldParser from './boolean';
import SequelizeEngine from '../engine';

export default class SequelizeEngineFieldParser extends EngineFieldParser {
  auto: SequelizeEngineAutoFieldParser | undefined = undefined;
  bigAuto: SequelizeEngineBigAutoFieldParser | undefined = undefined;
  bigInt: SequelizeEngineBigIntegerFieldParser | undefined = undefined;
  char: SequelizeEngineCharFieldParser | undefined = undefined;
  date: SequelizeEngineDateFieldParser | undefined = undefined;
  decimal: SequelizeEngineDecimalFieldParser | undefined = undefined;
  foreignKey: SequelizeEngineForeignKeyFieldParser | undefined = undefined;
  integer: SequelizeEngineIntegerFieldParser | undefined = undefined;
  text: SequelizeEngineTextFieldParser | undefined = undefined;
  uuid: SequelizeEngineUuidFieldParser | undefined = undefined;
  boolean: SequelizeEngineBooleanFieldParser | undefined = undefined;
  enum: SequelizeEngineEnumFieldParser | undefined = undefined;

  translatable = false;

  async textFieldValidations(field: CharField | TextField) {
    return {
      validate: {
        notEmpty: typeof field.allowBlank === 'boolean' ? !field.allowBlank : false,
      },
    } as ModelAttributeColumnOptions;
  }

  async translate(engine: SequelizeEngine, field: Field): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = {} as ModelAttributeColumnOptions;
    const isFieldAIndexOrIsFieldUnique = field.dbIndex === true || (field.unique as boolean) === true;

    if (isFieldAIndexOrIsFieldUnique) await engine.fields.appendIndexes(field);

    const hasNotYetSetDefaultValueForField = defaultOptions.defaultValue === undefined;
    if (hasNotYetSetDefaultValueForField) defaultOptions.defaultValue = field.defaultValue;

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
      field.typeName === TextField.name || field.typeName === CharField.name || field.typeName === UUIDField.name;
    if (isFieldOfTypeText) this.textFieldValidations(field as TextField);

    return defaultOptions;
  }
}
