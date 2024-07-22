import { adapterTextFieldParser } from '@palmares/databases';

import type DrizzleEngineFieldParser from './field';
import type { AdapterFieldParserTranslateArgs} from '@palmares/databases';

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
    const field = args.field;
    const mainType = args.engine.instance.mainType
    switch (mainType) {
      case 'sqlite':
        return `d.text('${field.databaseName}')${
          defaultOptions.primaryKey ? '.primaryKey()' : ''
        }${defaultOptions.default ? `.default("${defaultOptions.default}")` : ''}${
        defaultOptions.nullable !== true ? `.notNull()` : ''
        }${
        defaultOptions.unique ? `.unique()` : ''
        }`
      default:
        return `d.text('${field.databaseName}')${
          defaultOptions.primaryKey ? '.primaryKey()' : ''
        }${defaultOptions.default ? `.default("${defaultOptions.default}")` : ''}${
        defaultOptions.nullable !== true ? `.notNull()` : ''
        }${
        defaultOptions.unique ? `.unique()` : ''
        }`
    }
  },
});
