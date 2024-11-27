import { adapterBooleanFieldParser } from '@palmares/databases';

import { getBuilderArgs } from './utils';

import type { fieldParser as DrizzleEngineFieldParser } from './field';
import type { CustomArgs } from './types';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';
import type { boolean as dBoolean } from 'drizzle-orm/mysql-core';
import type { boolean as dBoolean2 } from 'drizzle-orm/pg-core';
import type { integer as dInteger } from 'drizzle-orm/sqlite-core';

export const booleanFieldParser = adapterBooleanFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'boolean',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any,
      CustomArgs<
        Parameters<typeof dInteger>[1],
        ReturnType<typeof dBoolean> | ReturnType<typeof dBoolean2> | ReturnType<typeof dInteger>
      >
    >
  ): Promise<any> => {
    const defaultOptions = await args.fieldParser.translate(args);
    const field = args.field;
    const mainType = args.engine.instance.mainType;

    const builderArgsFormatted = getBuilderArgs(
      {
        type: mainType === 'sqlite' ? 'integer' : 'boolean',
        databaseName: field.databaseName as string,
        args: mainType === 'sqlite' ? "{ mode: 'number' }" : undefined
      },
      (defaultBuilderArgs) => {
        if (defaultOptions.primaryKey) defaultBuilderArgs.push(['primaryKey', '']);

        if (typeof defaultOptions.default === 'boolean')
          if (mainType === 'sqlite') defaultBuilderArgs.push(['default', defaultOptions.default ? '1' : '0']);
          else defaultBuilderArgs.push(['default', JSON.stringify(defaultOptions.default)]);

        if (defaultOptions.nullable !== true) defaultBuilderArgs.push(['notNull', '']);
        if (defaultOptions.unique) defaultBuilderArgs.push(['unique', '']);
        return defaultBuilderArgs;
      }
    )(args.customAttributes.args, args.customAttributes.options);

    return builderArgsFormatted;
  }
});
