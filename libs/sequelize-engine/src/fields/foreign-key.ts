import { EngineForeignKeyFieldParser, ForeignKeyField, Model } from '@palmares/databases';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';
import { TranslatedFieldToEvaluateAfterType } from '../types';

export default class SequelizeEngineForeignKeyFieldParser extends EngineForeignKeyFieldParser {
  async translate(args: {
    engine: SequelizeEngine;
    field: ForeignKeyField;
    fieldParser: SequelizeEngineFieldParser;
    modelName: string;
    model: InstanceType<ReturnType<typeof Model>>;
    lazyEvaluate: (translatedField: TranslatedFieldToEvaluateAfterType) => void;
  }): Promise<undefined> {
    const defaultOptions = await args.fieldParser.translate(args);

    args.lazyEvaluate({
      fieldAttributes: defaultOptions,
      type: 'foreign-key',
    } as TranslatedFieldToEvaluateAfterType);
  }
}
