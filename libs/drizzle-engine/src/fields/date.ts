import { adapterDateFieldParser } from '@palmares/databases';
import { primaryKey } from 'drizzle-orm/pg-core';

import { getBuilderArgs } from './utils';

import type { fieldParser as DrizzleEngineFieldParser } from './field';
import type { CustomArgs } from './types';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';
import type { datetime as dDatetime } from 'drizzle-orm/mysql-core';
import type { timestamp as dTimestamp } from 'drizzle-orm/pg-core';
import type { text as dText } from 'drizzle-orm/sqlite-core';

export const dateFieldParser = adapterDateFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'date',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any,
      CustomArgs<
        Parameters<typeof dText>[1] | Parameters<typeof dDatetime>[1] | Parameters<typeof dTimestamp>[1],
        ReturnType<typeof dText> | ReturnType<typeof dDatetime> | ReturnType<typeof dTimestamp>
      >
    >
  ): Promise<any> => {
    const defaultOptions = await args.fieldParser.translate(args);
    const field = args.field;
    const mainType = args.engine.instance.mainType;

    return getBuilderArgs(
      {
        type: mainType === 'sqlite' ? 'text' : mainType === 'postgres' ? 'timestamp' : 'datetime',
        databaseName: field.databaseName as string,
        args:
          mainType === 'postgres'
            ? "{ precision: 6, withTimezone: true, mode: 'date' }"
            : mainType === 'sqlite'
              ? ''
              : "{ fsp: 6, mode: 'date' }"
      },
      (defaultBuilderArgs) => {
        if (defaultOptions.primaryKey) defaultBuilderArgs.push(['primaryKey', '']);
        if (defaultOptions.default) defaultBuilderArgs.push(['default', defaultOptions.default]);
        if (defaultOptions.nullable !== true) defaultBuilderArgs.push(['notNull', '']);
        if (defaultOptions.unique) defaultBuilderArgs.push(['unique', '']);
        if (field.autoNowAdd)
          if (mainType === 'sqlite') defaultBuilderArgs.push(['default', 'drzl.sql`(current_timestamp)`']);
          else defaultBuilderArgs.push(['defaultNow', '']);

        if (field.autoNow)
          if (mainType === 'sqlite') defaultBuilderArgs.push(['$onUpdate', '() => drzl.sql`CURRENT_TIMESTAMP`']);
          else defaultBuilderArgs.push(['$onUpdate', '() => drzl.sql`now()`']);

        return defaultBuilderArgs;
      }
    )(args.customAttributes.args, args.customAttributes.options);
  }
});
