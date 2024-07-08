import { AdapterFieldParserTranslateArgs, adapterEnumFieldParser } from '@palmares/databases';

import DrizzleEngineFieldParser from './field';

export default adapterEnumFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'enum',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any
    >
  ): Promise<any> => {
    const defaultOptions = await args.fieldParser.translate(args);
    return defaultOptions;
  },
});
