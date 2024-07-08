import { AdapterFieldParserTranslateArgs, adapterDateFieldParser } from '@palmares/databases';

import DrizzleEngineFieldParser from './field';

export default adapterDateFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'date',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any
    >
  ): Promise<any> => {
    const defaultOptions = await args.fieldParser.translate(args);
    return defaultOptions;
  },
});
