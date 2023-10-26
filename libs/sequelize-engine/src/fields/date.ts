import { AdapterFieldParserTranslateArgs, adapterDateFieldParser } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';
import { TranslatedFieldToEvaluateAfterType } from '../types';

export default adapterDateFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'date',
      any,
      InstanceType<typeof SequelizeEngineFieldParser>,
      TranslatedFieldToEvaluateAfterType
    >
  ): Promise<ModelAttributeColumnOptions> => {
    const isAutoNow = (args.field?.autoNow as boolean) === true;
    const hasAutoNowOrAutoNowAdd = (args.field?.autoNowAdd as boolean) === true || isAutoNow;

    const defaultOptions = await args.fieldParser.translate(args);
    defaultOptions.type = DataTypes.DATE;
    if (hasAutoNowOrAutoNowAdd) defaultOptions.defaultValue = DataTypes.NOW;
    if (isAutoNow)
      args.lazyEvaluate({
        fieldAttributes: defaultOptions,
        type: 'date',
      } as TranslatedFieldToEvaluateAfterType);

    return defaultOptions;
  },
});
