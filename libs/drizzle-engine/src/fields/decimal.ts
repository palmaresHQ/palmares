import { AdapterFieldParserTranslateArgs, adapterDecimalFieldParser } from '@palmares/databases';

import DrizzleEngineFieldParser from './field';

export default adapterDecimalFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'decimal',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any
    >
  ): Promise<any> => {
    const defaultOptions = await args.fieldParser.translate(args);

    return defaultOptions;
  },
});
