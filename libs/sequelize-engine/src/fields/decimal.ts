import { DecimalField, EngineDecimalFieldParser, Model } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';

export default class SequelizeEngineDecimalFieldParser extends EngineDecimalFieldParser {
  async translate(args: {
    engine: SequelizeEngine;
    field: DecimalField;
    fieldParser: SequelizeEngineFieldParser;
    modelName: string;
    model: InstanceType<ReturnType<typeof Model>>;
    lazyEvaluate: (translatedField: ModelAttributeColumnOptions) => void;
  }): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = await args.fieldParser.translate(args);
    defaultOptions.type = DataTypes.DECIMAL(args.field.maxDigits, args.field.decimalPlaces);
    defaultOptions.validate = defaultOptions.validate || {};
    defaultOptions.validate.isDecimal = true;
    return defaultOptions;
  }
}
