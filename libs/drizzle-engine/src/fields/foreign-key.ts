import { AdapterFieldParserTranslateArgs, adapterForeignKeyFieldParser } from '@palmares/databases';

import DrizzleEngineFieldParser from './field';

export default adapterForeignKeyFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'foreign-key',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any
    >
  ): Promise<undefined> => {
    const defaultOptions = await args.fieldParser.translate(args);

  },
});
