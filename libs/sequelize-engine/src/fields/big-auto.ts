import { EngineBigAutoFieldParser, Field, Model } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';

export default class SequelizeEngineBigAutoFieldParser extends EngineBigAutoFieldParser {
  async translate(args: {
    engine: SequelizeEngine;
    field: Field;
    fieldParser: SequelizeEngineFieldParser;
    modelName: string;
    model: InstanceType<ReturnType<typeof Model>>;
    lazyEvaluate: (translatedField: ModelAttributeColumnOptions) => void;
  }): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = await args.fieldParser.translate(args);
    defaultOptions.autoIncrement = true;
    defaultOptions.autoIncrementIdentity = true;
    defaultOptions.type = DataTypes.BIGINT;
    defaultOptions.validate = defaultOptions.validate || {};
    defaultOptions.validate.isNumeric = true;
    defaultOptions.validate.isInt = true;
    return defaultOptions;
  }
}
