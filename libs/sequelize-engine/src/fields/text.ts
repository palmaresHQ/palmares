import { TextField } from '@palmares/databases';
import { DataTypes } from 'sequelize';

import SequelizeEngineFieldParser from './field';

export default class SequelizeEngineTextFieldParser extends SequelizeEngineFieldParser {
  override async translate(field: TextField) {
    const defaultOptions = await super.translate(field);
    defaultOptions.type = DataTypes.STRING;
    return defaultOptions;
  }
}
