import { DecimalField } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';

export default class SequelizeEngineDecimalFieldParser extends SequelizeEngineFieldParser {
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

  translatable = true;

  async translate(engine: SequelizeEngine, field: DecimalField): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = await super.translate(engine, field);
    defaultOptions.type = DataTypes.DECIMAL(field.maxDigits, field.decimalPlaces);
    defaultOptions.validate = defaultOptions.validate || {};
    defaultOptions.validate.isDecimal = true;
    return defaultOptions;
  }
}
