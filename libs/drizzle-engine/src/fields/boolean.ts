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
    const field = args.field;
    const mainType = args.engine.instance.mainType
    switch (mainType) {
      case 'sqlite':
        return `d.integer('${field.databaseName}', { mode: 'boolean' })${
          defaultOptions.primaryKey ? defaultOptions.autoincrement ? '.primaryKey({ autoIncrement: true })' : '.primaryKey()' : ''
        }${defaultOptions.default ? `.default(${defaultOptions.default})` : ''}${
        defaultOptions.nullable !== true ? `.notNull()` : ''
        }${
        defaultOptions.unique ? `.unique()` : ''
        }`
      case 'postgres':
        return `d.boolean('${field.databaseName}')${defaultOptions.primaryKey ? '.primaryKey()' : ''}${
          defaultOptions.default ? `.default(${defaultOptions.default})` : ''
        }${
        defaultOptions.nullable !== true ? `.notNull()` : ''
        }${
        defaultOptions.unique ? `.unique()` : ''
        }`
      default:
        return `d.boolean('${field.databaseName}')${
          defaultOptions.autoincrement ? '.autoIncrement()' : ''
        }${defaultOptions.primaryKey ? '.primaryKey()' : ''}${
          defaultOptions.default ? `.default(${defaultOptions.default})` : ''
        }${
        defaultOptions.nullable !== true ? `.notNull()` : ''
        }${
        defaultOptions.unique ? `.unique()` : ''
        }`
    }
  },
});
