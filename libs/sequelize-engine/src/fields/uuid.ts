import { EngineUuidFieldParser, Model, UuidField } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';

export default class SequelizeEngineUuidFieldParser extends EngineUuidFieldParser {
  async translate(args: {
    engine: SequelizeEngine;
    field: UuidField;
    fieldParser: SequelizeEngineFieldParser;
    modelName: string;
    model: InstanceType<ReturnType<typeof Model>>;
    lazyEvaluate: (translatedField: ModelAttributeColumnOptions) => void;
  }): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = await args.fieldParser.translate(args);
    defaultOptions.type = DataTypes.UUID;
    if (args.field.autoGenerate) defaultOptions.defaultValue = DataTypes.UUIDV4;
    defaultOptions.validate = defaultOptions.validate || {};
    defaultOptions.validate.isUUID = 4;
    return defaultOptions;
  }
}
