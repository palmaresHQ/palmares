import { UUIDField } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';

export default class SequelizeEngineUuidFieldParser extends SequelizeEngineFieldParser {
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

  async translate(engine: SequelizeEngine, field: UUIDField): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = await super.translate(engine, field);
    defaultOptions.type = DataTypes.UUID;
    if (field.autoGenerate) defaultOptions.defaultValue = DataTypes.UUIDV4;
    defaultOptions.validate = defaultOptions.validate || {};
    defaultOptions.validate.isUUID = 4;
    return defaultOptions;
  }
}
