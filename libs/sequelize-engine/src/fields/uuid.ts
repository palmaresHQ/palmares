import { adapterUuidFieldParser } from '@palmares/databases';
import { DataTypes } from 'sequelize';

import type SequelizeEngineFieldParser from './field';
import type { TranslatedFieldToEvaluateAfterType } from '../types';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';
import type { ModelAttributeColumnOptions } from 'sequelize';

export default adapterUuidFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'uuid',
      any,
      InstanceType<typeof SequelizeEngineFieldParser>,
      TranslatedFieldToEvaluateAfterType
    >
  ): Promise<ModelAttributeColumnOptions> => {
    const defaultOptions = await args.fieldParser.translate({
      ...args,
      field: { ...args.field, isAuto: false }
    });
    defaultOptions.type = DataTypes.UUID;
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (args.field.isAuto) {
      defaultOptions.defaultValue = DataTypes.UUIDV4;
      defaultOptions.autoIncrement = false;
      defaultOptions.autoIncrementIdentity = false;
    }
    defaultOptions.validate = defaultOptions.validate || {};
    defaultOptions.validate.isUUID = 4;
    return defaultOptions;
  }
});
