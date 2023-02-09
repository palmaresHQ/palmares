import { Field } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';

export default class SequelizeEngineAutoFieldParser extends SequelizeEngineFieldParser {
  async translate(field: Field): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = await super.translate(field);
    defaultOptions.autoIncrement = true;
    defaultOptions.autoIncrementIdentity = true;
    defaultOptions.type = DataTypes.INTEGER;
    defaultOptions.validate = defaultOptions.validate || {};
    defaultOptions.validate.isNumeric = true;
    defaultOptions.validate.isInt = true;
    return defaultOptions;
  }
}
