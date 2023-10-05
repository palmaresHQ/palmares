import { TextField } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';

export default class SequelizeEngineTextFieldParser extends SequelizeEngineFieldParser {
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

  async translate(engine: SequelizeEngine, field: TextField): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = await super.translate(engine, field);
    defaultOptions.type = DataTypes.STRING;
    return defaultOptions;
  }
}
