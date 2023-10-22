import { DateField, EngineDateFieldParser, Model } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';
import { TranslatedFieldToEvaluateAfterType } from '../types';

export default class SequelizeEngineDateFieldParser extends EngineDateFieldParser {
  async translate(args: {
    engine: SequelizeEngine;
    field: DateField;
    fieldParser: SequelizeEngineFieldParser;
    modelName: string;
    model: InstanceType<ReturnType<typeof Model>>;
    lazyEvaluate: (translatedField: TranslatedFieldToEvaluateAfterType) => void;
  }): Promise<ModelAttributeColumnOptions> {
    const isAutoNow = (args.field.autoNow as boolean) === true;
    const hasAutoNowOrAutoNowAdd = (args.field.autoNowAdd as boolean) === true || isAutoNow;

    const defaultOptions = await args.fieldParser.translate(args);
    defaultOptions.type = DataTypes.DATE;
    if (hasAutoNowOrAutoNowAdd) defaultOptions.defaultValue = DataTypes.NOW;
    if (isAutoNow)
      args.lazyEvaluate({
        fieldAttributes: defaultOptions,
        type: 'date',
      } as TranslatedFieldToEvaluateAfterType);

    return defaultOptions;
  }
}
