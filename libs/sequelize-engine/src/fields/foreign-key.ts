import { adapterForeignKeyFieldParser } from '@palmares/databases';

import type SequelizeEngineFieldParser from './field';
import type { TranslatedFieldToEvaluateAfterType } from '../types';
import type { AdapterFieldParserTranslateArgs} from '@palmares/databases';

export default adapterForeignKeyFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'foreign-key',
      any,
      InstanceType<typeof SequelizeEngineFieldParser>,
      TranslatedFieldToEvaluateAfterType
    >
  ): Promise<undefined> => {
    const defaultOptions = await args.fieldParser.translate(args);

    args.lazyEvaluate({
      fieldAttributes: defaultOptions,
      type: 'foreign-key',
    } as TranslatedFieldToEvaluateAfterType);
  },
});
