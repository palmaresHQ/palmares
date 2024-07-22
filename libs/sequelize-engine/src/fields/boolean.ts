import { adapterBooleanFieldParser } from '@palmares/databases';
import { DataTypes } from 'sequelize';

import SequelizeEngine from '../engine';

import type SequelizeEngineFieldParser from './field';
import type { TranslatedFieldToEvaluateAfterType } from '../types';
import type { AdapterFieldParserTranslateArgs} from '@palmares/databases';
import type { ModelAttributeColumnOptions } from 'sequelize';

export default adapterBooleanFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'boolean',
      any,
      InstanceType<typeof SequelizeEngineFieldParser>,
      TranslatedFieldToEvaluateAfterType
    >
  ): Promise<ModelAttributeColumnOptions> => {
    const defaultOptions = await args.fieldParser.translate(args);
    defaultOptions.type = DataTypes.BOOLEAN;
    return defaultOptions;
  },
});
