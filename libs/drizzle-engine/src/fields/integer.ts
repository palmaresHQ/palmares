import { AdapterFieldParserTranslateArgs, adapterIntegerFieldParser } from '@palmares/databases';

import DrizzleEngineFieldParser from './field';

export default adapterIntegerFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'integer',
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
        return `d.integer('${field.databaseName}', { mode: 'number' })${
          defaultOptions.primaryKey ? defaultOptions.autoincrement ? '.primaryKey({ autoIncrement: true })' : '.primaryKey()' : ''
        }${defaultOptions.default ? `.default(${defaultOptions.default})` : ''}`
      case 'postgres':
        return `d.${defaultOptions.autoincrement ? 'serial' : 'integer'}('${field.databaseName}')${defaultOptions.primaryKey ? '.primaryKey()' : ''}${
          defaultOptions.default ? `.default(${defaultOptions.default})` : ''
        }`
      default:
        return `d.int('${field.databaseName}')${
          defaultOptions.autoincrement ? '.autoIncrement()' : ''
        }${defaultOptions.primaryKey ? '.primaryKey()' : ''}${
          defaultOptions.default ? `.default(${defaultOptions.default})` : ''
        }`
    }
  },
});
