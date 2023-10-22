import { Field, Model, EngineBooleanFieldParser } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';

export default class SequelizeEngineBooleanFieldParser extends EngineBooleanFieldParser {
  async translate(args: {
    engine: SequelizeEngine;
    field: Field;
    fieldParser: SequelizeEngineFieldParser;
    modelName: string;
    model: InstanceType<ReturnType<typeof Model>>;
    lazyEvaluate: (translatedField: ModelAttributeColumnOptions) => void;
  }): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = await args.fieldParser.translate(args);
    defaultOptions.type = DataTypes.BOOLEAN;
    return defaultOptions;
  }
}
