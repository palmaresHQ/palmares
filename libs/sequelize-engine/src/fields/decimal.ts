import { AdapterFieldParserTranslateArgs, adapterDecimalFieldParser } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';
import { TranslatedFieldToEvaluateAfterType } from '../types';

export default adapterDecimalFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'decimal',
      any,
      InstanceType<typeof SequelizeEngineFieldParser>,
      TranslatedFieldToEvaluateAfterType
    >
  ): Promise<ModelAttributeColumnOptions> => {
    const defaultOptions = await args.fieldParser.translate(args);
    defaultOptions.type = DataTypes.DECIMAL(args.field.maxDigits, args.field.decimalPlaces);
    defaultOptions.validate = defaultOptions.validate || {};
    defaultOptions.validate.isDecimal = true;
    return defaultOptions;
  },
});
