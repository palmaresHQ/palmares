import { EnumField, Field } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';

export default class SequelizeEngineEnumFieldParser extends SequelizeEngineFieldParser {
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

  async translate(engine: SequelizeEngine, field: Field): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = await super.translate(engine, field);
    defaultOptions.type = DataTypes.ENUM(...(field as any).choices);
    return defaultOptions;
  }
}
