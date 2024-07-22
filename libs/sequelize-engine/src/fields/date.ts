import { adapterDateFieldParser } from '@palmares/databases';
import { DataTypes } from 'sequelize';

import SequelizeEngine from '../engine';

import type SequelizeEngineFieldParser from './field';
import type { TranslatedFieldToEvaluateAfterType } from '../types';
import type { AdapterFieldParserTranslateArgs} from '@palmares/databases';
import type { ModelAttributeColumnOptions } from 'sequelize';

export default adapterDateFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'date',
      any,
      InstanceType<typeof SequelizeEngineFieldParser>,
      TranslatedFieldToEvaluateAfterType
    >
  ): Promise<ModelAttributeColumnOptions> => {
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
  },
});
