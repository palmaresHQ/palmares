import { EngineEnumFieldParser, EnumField, Model } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';

export default class SequelizeEngineEnumFieldParser extends EngineEnumFieldParser {
  async translate(args: {
    engine: SequelizeEngine;
    field: EnumField;
    fieldParser: SequelizeEngineFieldParser;
    modelName: string;
    model: InstanceType<ReturnType<typeof Model>>;
    lazyEvaluate: (translatedField: ModelAttributeColumnOptions) => void;
  }): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = await args.fieldParser.translate(args);
    defaultOptions.type = DataTypes.ENUM(...(args.field as EnumField).choices);
    return defaultOptions;
  }
}
