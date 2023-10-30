import { AdapterFieldParserTranslateArgs, adapterUuidFieldParser } from '@palmares/databases';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import SequelizeEngine from '../engine';
import { TranslatedFieldToEvaluateAfterType } from '../types';

export default adapterUuidFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'uuid',
      any,
      InstanceType<typeof SequelizeEngineFieldParser>,
      TranslatedFieldToEvaluateAfterType
    >
  ): Promise<ModelAttributeColumnOptions> => {
    const defaultOptions = await args.fieldParser.translate(args);
    defaultOptions.type = DataTypes.UUID;
    if (args.field.autoGenerate) defaultOptions.defaultValue = DataTypes.UUIDV4;
    defaultOptions.validate = defaultOptions.validate || {};
    defaultOptions.validate.isUUID = 4;
    return defaultOptions;
  },
});
