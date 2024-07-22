import { adapterBigIntegerFieldParser } from '@palmares/databases';
import { DataTypes } from 'sequelize';

import SequelizeEngine from '../engine';

import type SequelizeEngineFieldParser from './field';
import type { TranslatedFieldToEvaluateAfterType } from '../types';
import type { AdapterFieldParserTranslateArgs} from '@palmares/databases';
import type { ModelAttributeColumnOptions } from 'sequelize';

export default adapterBigIntegerFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'big-integer',
      any,
      InstanceType<typeof SequelizeEngineFieldParser>,
      TranslatedFieldToEvaluateAfterType
    >
  ): Promise<ModelAttributeColumnOptions> => {
    const defaultOptions = await args.fieldParser.translate(args);
    defaultOptions.autoIncrement = true;
    defaultOptions.autoIncrementIdentity = true;
    defaultOptions.type = DataTypes.BIGINT;
    defaultOptions.validate = defaultOptions.validate || {};
    defaultOptions.validate.isNumeric = true;
    defaultOptions.validate.isInt = true;
    return defaultOptions;
  },
});
