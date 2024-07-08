import { AdapterFieldParserTranslateArgs, adapterTextFieldParser } from '@palmares/databases';

import DrizzleEngineFieldParser from './field';

export default adapterTextFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'text',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any
    >
  ): Promise<any> => {
    const defaultOptions = await args.fieldParser.translate(args);
    return defaultOptions;
  },
});
