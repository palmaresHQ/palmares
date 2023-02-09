import { Field } from '@palmares/databases';
import { DataTypes } from 'sequelize';

import SequelizeEngineFieldParser from './field';

export default class SequelizeEngineBigIntegerFieldParser extends SequelizeEngineFieldParser {
  override async translate(field: Field) {
    const defaultOptions = await super.translate(field);
    defaultOptions.type = DataTypes.BIGINT;
    defaultOptions.validate = defaultOptions.validate || {};
    defaultOptions.validate.isNumeric = true;
    defaultOptions.validate.isInt = true;
    return defaultOptions;
  }
}
