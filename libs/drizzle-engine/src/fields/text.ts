import { adapterTextFieldParser } from '@palmares/databases';

import { getBuilderArgs } from './utils';

import type { fieldParser as DrizzleEngineFieldParser } from './field';
import type { CustomArgs } from './types';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';
import type { text as dText2 } from 'drizzle-orm/mysql-core';
import type { text as dText3 } from 'drizzle-orm/pg-core';
import type { text as dText } from 'drizzle-orm/sqlite-core';

export const textFieldParser = adapterTextFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'text',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any,
      CustomArgs<
        Parameters<typeof dText>[1] | Parameters<typeof dText2>[1] | Parameters<typeof dText3>[1],
        ReturnType<typeof dText> | ReturnType<typeof dText2> | ReturnType<typeof dText3>
      >
    >
  ): Promise<any> => {
    const defaultOptions = await args.fieldParser.translate(args);
    const field = args.field;

    return getBuilderArgs(
      {
        type: 'text',
        databaseName: field.databaseName as string,
        args: undefined
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
