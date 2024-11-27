import { adapterDecimalFieldParser, auto } from '@palmares/databases';

import { getBuilderArgs } from './utils';

import type { fieldParser as DrizzleEngineFieldParser } from './field';
import type { CustomArgs } from './types';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';
import type { decimal as dDecimal } from 'drizzle-orm/mysql-core';
import type { numeric as dNumeric } from 'drizzle-orm/pg-core';
import type { real as dReal } from 'drizzle-orm/sqlite-core';

export const decimalFieldParser = adapterDecimalFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'decimal',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any,
      CustomArgs<
        Parameters<typeof dDecimal>[1] | Parameters<typeof dNumeric>[1],
        ReturnType<typeof dReal> | ReturnType<typeof dNumeric> | ReturnType<typeof dReal>
      >
    >
  ): Promise<string> => {
    const defaultOptions = await args.fieldParser.translate(args);
    const field = args.field;
    const mainType = args.engine.instance.mainType;

    return getBuilderArgs(
      {
        type: mainType === 'sqlite' ? 'real' : mainType === 'postgres' ? 'numeric' : 'decimal',
        databaseName: field.databaseName as string,
        args: mainType === 'sqlite' ? '' : `{ precision: ${field.decimalPlaces}, scale: ${field.maxDigits} }`
      },
      (defaultBuilderArgs) => {
        if (defaultOptions.primaryKey) defaultBuilderArgs.push(['primaryKey', '']);
        if (defaultOptions.default) defaultBuilderArgs.push(['default', defaultOptions.default]);
        if (defaultOptions.nullable !== true) defaultBuilderArgs.push(['notNull', '']);
        if (defaultOptions.unique) defaultBuilderArgs.push(['unique', '']);
        return defaultBuilderArgs;
      }
    )(args.customAttributes.args, args.customAttributes.options);
  }
});
