import { adapterDateFieldParser } from '@palmares/databases';

import type { fieldParser as DrizzleEngineFieldParser } from './field';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';

export const dateFieldParser = adapterDateFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<'date', any, InstanceType<typeof DrizzleEngineFieldParser>, any>
  ): Promise<any> => {
    const defaultOptions = await args.fieldParser.translate(args);
    const field = args.field;
    const mainType = args.engine.instance.mainType;
    switch (mainType) {
      case 'sqlite':
        return `d.text('${field.databaseName}')${
          defaultOptions.primaryKey
            ? defaultOptions.autoincrement
              ? '.primaryKey({ autoIncrement: true })'
              : '.primaryKey()'
            : ''
        }${defaultOptions.default ? `.default(${defaultOptions.default})` : ''}${
          defaultOptions.nullable !== true ? `.notNull()` : ''
        }${defaultOptions.unique ? `.unique()` : ''}${
          // eslint-disable-next-line ts/no-unnecessary-condition
          field.autoNowAdd ? '.$defaultFn(() => drzl.sql`CURRENT_TIMESTAMP`)' : ''
        }${
          // eslint-disable-next-line ts/no-unnecessary-condition
          field.autoNow ? '.$onUpdate(() => drzl.sql`CURRENT_TIMESTAMP`)' : ''
        }`;
      case 'postgres':
        return `d.timestamp('${field.databaseName}', { precision: 6, withTimezone: true, mode: 'date' })${defaultOptions.primaryKey ? '.primaryKey()' : ''}${
          defaultOptions.default ? `.default(${defaultOptions.default})` : ''
        }${defaultOptions.nullable !== true ? `.notNull()` : ''}${defaultOptions.unique ? `.unique()` : ''}${
          // eslint-disable-next-line ts/no-unnecessary-condition
          field.autoNow ? `.defaultNow()` : ''
        }${
          // eslint-disable-next-line ts/no-unnecessary-condition
          field.autoNowAdd ? '.$onUpdate(() => drzl.sql`now()`)' : ''
        }`;
      default:
        return `d.datetime('${field.databaseName}', { fsp: 6, mode: 'date' })${
          defaultOptions.autoincrement ? '.autoIncrement()' : ''
        }${defaultOptions.primaryKey ? '.primaryKey()' : ''}${
          defaultOptions.default ? `.default(${defaultOptions.default})` : ''
        }${defaultOptions.nullable !== true ? `.notNull()` : ''}${defaultOptions.unique ? `.unique()` : ''}${
          // eslint-disable-next-line ts/no-unnecessary-condition
          field.autoNow ? `.defaultNow()` : ''
        }${
          // eslint-disable-next-line ts/no-unnecessary-condition
          field.autoNowAdd ? '.$onUpdate(() => drzl.sql`NOW()`)' : ''
        }`;
    }
  }
});
