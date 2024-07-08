import { AdapterFieldParserTranslateArgs, adapterBooleanFieldParser } from '@palmares/databases';

import DrizzleEngineFieldParser from './field';

export default adapterBooleanFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'boolean',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any
    >
  ): Promise<any> => {
    const defaultOptions = await args.fieldParser.translate(args);
    return defaultOptions;
  },
});
