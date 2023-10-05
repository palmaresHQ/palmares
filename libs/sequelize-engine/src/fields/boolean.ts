import { BooleanField } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';

export default class SequelizeEngineBooleanFieldParser extends SequelizeEngineFieldParser {
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

  async translate(engine: SequelizeEngine, field: BooleanField): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = await super.translate(engine, field);
    defaultOptions.type = DataTypes.BOOLEAN;
    return defaultOptions;
  }
}
