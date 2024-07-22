import { adapterAutoFieldParser } from '@palmares/databases';
import { DataTypes } from 'sequelize';

import type SequelizeEngineFieldParser from './field';
import type { TranslatedFieldToEvaluateAfterType } from '../types';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';
import type { ModelAttributeColumnOptions } from 'sequelize';

export default adapterAutoFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'auto',
      any,
      InstanceType<typeof SequelizeEngineFieldParser>,
      TranslatedFieldToEvaluateAfterType
    >
  ): Promise<ModelAttributeColumnOptions> => {
    const defaultOptions = await args.fieldParser.translate(args);
    defaultOptions.primaryKey = true;
    defaultOptions.autoIncrement = true;
    defaultOptions.autoIncrementIdentity = true;
    defaultOptions.type = DataTypes.INTEGER;
    defaultOptions.validate = defaultOptions.validate || {};
    defaultOptions.validate.isNumeric = true;
    defaultOptions.validate.isInt = true;
    return defaultOptions;
  },
});
