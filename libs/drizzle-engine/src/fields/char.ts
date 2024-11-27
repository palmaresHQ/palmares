import { adapterCharFieldParser } from '@palmares/databases';

//import { text } from 'drizzle-orm/sqlite-core';
import { getBuilderArgs } from './utils';

import type { fieldParser as DrizzleEngineFieldParser } from './field';
import type { CustomArgs } from './types';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';
import type { varchar as dVarChar } from 'drizzle-orm/mysql-core';
import type { varchar as dVarChar2 } from 'drizzle-orm/pg-core';
import type { text as dText } from 'drizzle-orm/sqlite-core';

export const charFieldParser = adapterCharFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'char',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any,
      CustomArgs<
        Parameters<typeof dText>[1] | Parameters<typeof dVarChar>[1] | Parameters<typeof dVarChar2>[1],
        ReturnType<typeof dVarChar> | ReturnType<typeof dText> | ReturnType<typeof dVarChar2>
      >
    >
  ): Promise<string> => {
    const defaultOptions = await args.fieldParser.translate(args);
    const field = args.field;
    const mainType = args.engine.instance.mainType;

    return getBuilderArgs(
      {
        type: mainType === 'sqlite' ? 'text' : 'varchar',
        databaseName: field.databaseName as string,
        args: `{ length: ${args.field.maxLength} }`
      },
      (defaultBuilderArgs) => {
        if (defaultOptions.primaryKey) defaultBuilderArgs.push(['primaryKey', '']);
        if (defaultOptions.default) defaultBuilderArgs.push(['default', `"${defaultOptions.default}"`]);
        if (defaultOptions.nullable !== true) defaultBuilderArgs.push(['notNull', '']);
        if (defaultOptions.unique) defaultBuilderArgs.push(['unique', '']);
        return defaultBuilderArgs;
      }
    )(args.customAttributes.args, args.customAttributes.options);
  }
});
