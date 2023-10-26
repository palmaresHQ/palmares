import { AdapterFieldParserTranslateArgs, adapterBigAutoFieldParser } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';
import { TranslatedFieldToEvaluateAfterType } from '../types';

export default adapterBigAutoFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'big-auto',
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
