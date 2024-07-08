import { AdapterFieldParserTranslateArgs, adapterCharFieldParser } from '@palmares/databases';

//import { text } from 'drizzle-orm/sqlite-core';
import DrizzleEngineFieldParser from './field';

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
        }${defaultOptions.default ? `.default("${defaultOptions.default}")` : ''}`
      default:
        return `d.varchar('${field.databaseName}', { length: ${args.field.maxLength} })${
          defaultOptions.primaryKey ? '.primaryKey()' : ''
        }${defaultOptions.default ? `.default("${defaultOptions.default}")` : ''}`
    }
  },
});
