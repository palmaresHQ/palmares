import { EngineTextFieldParser, Model, TextField } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';

export default class SequelizeEngineTextFieldParser extends EngineTextFieldParser {
  async translate(args: {
    engine: SequelizeEngine;
    field: TextField;
    fieldParser: SequelizeEngineFieldParser;
    modelName: string;
    model: InstanceType<ReturnType<typeof Model>>;
    lazyEvaluate: (translatedField: ModelAttributeColumnOptions) => void;
  }): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = await args.fieldParser.translate(args);
    defaultOptions.type = DataTypes.STRING;
    return defaultOptions;
  }
}
