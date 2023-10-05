import { DateField } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';

export default class SequelizeEngineDateFieldParser extends SequelizeEngineFieldParser {
  auto = undefined;
  bigAuto = undefined;
  bigInt = undefined;
  char = undefined;
  date = undefined;
  decimal = undefined;
  foreignKey = undefined;
  integer = undefined;
  text = undefined;
  uuid = undefined;
  enum = undefined;
  boolean = undefined;

  translatable = true;

  async translate(engine: SequelizeEngine, field: DateField): Promise<ModelAttributeColumnOptions> {
    const isAutoNow = (field.autoNow as boolean) === true;
    const hasAutoNowOrAutoNowAdd = (field.autoNowAdd as boolean) === true || isAutoNow;

    const defaultOptions = await super.translate(engine, field);
    defaultOptions.type = DataTypes.DATE;
    if (hasAutoNowOrAutoNowAdd) defaultOptions.defaultValue = DataTypes.NOW;
    if (isAutoNow) await engine.fields.addHooksToUpdateDateFields(field.model.name, field.fieldName);
    return defaultOptions;
  }
}
