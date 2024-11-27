import { adapterIntegerFieldParser } from '@palmares/databases';

import { getBuilderArgs } from './utils';

import type { fieldParser as DrizzleEngineFieldParser } from './field';
import type { CustomArgs } from './types';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';
import type { int as dInt2 } from 'drizzle-orm/mysql-core';
import type { integer as dInt, bigserial as dSerial } from 'drizzle-orm/pg-core';
import type { integer as dInteger } from 'drizzle-orm/sqlite-core';

type ParametersOfColumnTypes =
  | Parameters<typeof dSerial>[1]
  | Parameters<typeof dInteger>[1]
  | Parameters<typeof dInt2>[1];

type ReturnTypeOfColumnTypes =
  | ReturnType<typeof dInt>
  | ReturnType<typeof dSerial>
  | ReturnType<typeof dInteger>
  | ReturnType<typeof dSerial>;

export const integerFieldParser = adapterIntegerFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'integer',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any,
      CustomArgs<ParametersOfColumnTypes, ReturnTypeOfColumnTypes>
    >
  ): Promise<string> => {
    const defaultOptions = await args.fieldParser.translate(args);
    const field = args.field;
    const mainType = args.engine.instance.mainType;

    const builderArgsFormatted = getBuilderArgs(
      {
        type:
          mainType === 'sqlite'
            ? 'integer'
            : mainType !== 'postgres'
              ? 'bigint'
              : defaultOptions.autoincrement
                ? 'serial'
                : 'integer',
        databaseName: field.databaseName as string,
        args: "{ mode: 'number' }"
      },
      (defaultBuilderArgs) => {
        if (defaultOptions.primaryKey)
          defaultBuilderArgs.push(['primaryKey', mainType === 'sqlite' ? '{ autoIncrement: true }' : '']);
        if (defaultOptions.default) defaultBuilderArgs.push(['default', defaultOptions.default]);
        if (defaultOptions.nullable !== true) defaultBuilderArgs.push(['notNull', '']);
        if (defaultOptions.unique) defaultBuilderArgs.push(['unique', '']);
        if (mainType === 'mysql' && defaultOptions.autoincrement) defaultBuilderArgs.push(['autoIncrement', '']);
        return defaultBuilderArgs;
      }
    )(args.customAttributes.args, args.customAttributes.options);

    return builderArgsFormatted;
  }
});
