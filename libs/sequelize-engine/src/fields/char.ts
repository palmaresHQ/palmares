import { CharField } from '@palmares/databases';
import { DataTypes } from 'sequelize';

import SequelizeEngineFieldParser from './field';

export default class SequelizeEngineCharFieldParser extends SequelizeEngineFieldParser {
  override async translate(field: CharField) {
    const defaultOptions = await super.translate(field);
    defaultOptions.type = DataTypes.STRING(field.maxLength);
    return defaultOptions;
  }
}
