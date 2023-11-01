import { AdapterFieldParserTranslateArgs, adapterForeignKeyFieldParser } from '@palmares/databases';

import SequelizeEngineFieldParser from './field';
import { TranslatedFieldToEvaluateAfterType } from '../types';

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
