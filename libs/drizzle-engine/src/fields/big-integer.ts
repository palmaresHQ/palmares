import { adapterBigIntegerFieldParser } from '@palmares/databases';

import type { fieldParser as DrizzleEngineFieldParser } from './field';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';

export const bigIntegerFieldParser = adapterBigIntegerFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<'big-integer', any, InstanceType<typeof DrizzleEngineFieldParser>, any>
  ): Promise<string> => {
    const defaultOptions = await args.fieldParser.translate(args);
    const field = args.field;
    const mainType = args.engine.instance.mainType;
    switch (mainType) {
      case 'sqlite':
        return `d.integer('${field.databaseName}', { mode: 'number' })${
          defaultOptions.primaryKey
            ? defaultOptions.autoincrement
              ? '.primaryKey({ autoIncrement: true })'
              : '.primaryKey()'
            : ''
        }${defaultOptions.default ? `.default(${defaultOptions.default})` : ''}${
          defaultOptions.nullable !== true ? `.notNull()` : ''
        }${defaultOptions.unique ? `.unique()` : ''}`;
      case 'postgres':
        return (
          `d.${defaultOptions.autoincrement ? 'bigserial' : 'bigint'}` +
          `('${field.databaseName}', { mode: 'number' })${defaultOptions.primaryKey ? '.primaryKey()' : ''}${
            defaultOptions.default ? `.default(${defaultOptions.default})` : ''
          }${defaultOptions.nullable !== true ? `.notNull()` : ''}${defaultOptions.unique ? `.unique()` : ''}`
        );
      default:
        return `d.bigint('${field.databaseName}', { mode: 'number' })${
          defaultOptions.autoincrement ? '.autoIncrement()' : ''
        }${defaultOptions.primaryKey ? '.primaryKey()' : ''}${
          defaultOptions.default ? `.default(${defaultOptions.default})` : ''
        }${defaultOptions.nullable !== true ? `.notNull()` : ''}${defaultOptions.unique ? `.unique()` : ''}`;
    }
  }
});
