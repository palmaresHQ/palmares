import { AdapterFieldParserTranslateArgs, adapterUuidFieldParser } from '@palmares/databases';

import DrizzleEngineFieldParser from './field';

export default adapterUuidFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'uuid',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any
    >
  ): Promise<any> => {
    const defaultOptions = await args.fieldParser.translate(args);
    return defaultOptions;
  },
});
