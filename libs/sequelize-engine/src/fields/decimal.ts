import { adapterDecimalFieldParser } from '@palmares/databases';
import { DataTypes } from 'sequelize';

import type SequelizeEngineFieldParser from './field';
import type { TranslatedFieldToEvaluateAfterType } from '../types';
import type { AdapterFieldParserTranslateArgs} from '@palmares/databases';
import type { ModelAttributeColumnOptions } from 'sequelize';

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
