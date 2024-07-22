import { adapterEnumFieldParser } from '@palmares/databases';
import { DataTypes } from 'sequelize';

import type SequelizeEngineFieldParser from './field';
import type { TranslatedFieldToEvaluateAfterType } from '../types';
import type { AdapterFieldParserTranslateArgs} from '@palmares/databases';
import type { ModelAttributeColumnOptions } from 'sequelize';

export default adapterEnumFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'enum',
      any,
      InstanceType<typeof SequelizeEngineFieldParser>,
      TranslatedFieldToEvaluateAfterType
    >
  ): Promise<ModelAttributeColumnOptions> => {
    const defaultOptions = await args.fieldParser.translate(args);
    defaultOptions.type = DataTypes.ENUM(...args.field.choices);
    return defaultOptions;
  },
});
