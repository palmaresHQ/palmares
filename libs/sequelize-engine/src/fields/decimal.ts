import { DecimalField } from '@palmares/databases';
import { DataTypes } from 'sequelize';

import SequelizeEngineFieldParser from './field';

export default class SequelizeEngineDecimalFieldParser extends SequelizeEngineFieldParser {
  override async translate(field: DecimalField) {
    const defaultOptions = await super.translate(field);
    defaultOptions.type = DataTypes.DECIMAL(
      field.maxDigits,
      field.decimalPlaces
    );
    defaultOptions.validate = defaultOptions.validate || {};
    defaultOptions.validate.isDecimal = true;
    return defaultOptions;
  }
}
