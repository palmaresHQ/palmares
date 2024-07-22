import { adapterCharFieldParser } from '@palmares/databases';

//import { text } from 'drizzle-orm/sqlite-core';
import type DrizzleEngineFieldParser from './field';
import type { AdapterFieldParserTranslateArgs} from '@palmares/databases';

export default adapterCharFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'char',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any
    >
  ): Promise<string> => {
    const defaultOptions = await args.fieldParser.translate(args);
    const field = args.field;
    const mainType = args.engine.instance.mainType
    switch (mainType) {
      case 'sqlite':
        return `d.text('${field.databaseName}', { length: ${args.field.maxLength} })${
          defaultOptions.primaryKey ? '.primaryKey()' : ''
        }${defaultOptions.default ? `.default("${defaultOptions.default}")` : ''}${
        defaultOptions.nullable !== true ? `.notNull()` : ''
        }${
        defaultOptions.unique ? `.unique()` : ''
        }`
      default:
        return `d.varchar('${field.databaseName}', { length: ${args.field.maxLength} })${
          defaultOptions.primaryKey ? '.primaryKey()' : ''
        }${defaultOptions.default ? `.default("${defaultOptions.default}")` : ''}${
        defaultOptions.nullable !== true ? `.notNull()` : ''
        }${
        defaultOptions.unique ? `.unique()` : ''
        }`
    }
  },
});
