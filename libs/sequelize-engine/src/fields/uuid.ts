import { UUIDField } from '@palmares/databases';
import { DataTypes } from 'sequelize';

import SequelizeEngineFieldParser from './field';

export default class SequelizeEngineUuidFieldParser extends SequelizeEngineFieldParser {
  override async translate(field: UUIDField) {
    const defaultOptions = await super.translate(field);
    defaultOptions.type = DataTypes.UUID;
    if (field.autoGenerate) defaultOptions.defaultValue = DataTypes.UUIDV4;
    defaultOptions.validate = defaultOptions.validate || {};
    defaultOptions.validate.isUUID = 4;
    return defaultOptions;
  }
}
