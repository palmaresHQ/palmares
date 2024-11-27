import { adapterUuidFieldParser } from '@palmares/databases';

import { getBuilderArgs } from './utils';

import type { fieldParser as DrizzleEngineFieldParser } from './field';
import type { CustomArgs } from './types';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';
import type { varchar as dVarChar } from 'drizzle-orm/mysql-core';
import type { uuid as dUuid } from 'drizzle-orm/pg-core';
import type { text as dText } from 'drizzle-orm/sqlite-core';

export const uuidFieldParser = adapterUuidFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'uuid',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any,
      CustomArgs<
        Parameters<typeof dText>[1] | Parameters<typeof dVarChar>[1],
        ReturnType<typeof dText> | ReturnType<typeof dUuid> | ReturnType<typeof dVarChar>
      >
    >
  ): Promise<string> => {
    const defaultOptions = await args.fieldParser.translate({
      ...args,
      field: {
        ...args.field,
        isAuto: false
      }
    });
    const field = args.field;
    const mainType = args.engine.instance.mainType;

    // eslint-disable-next-line ts/no-unnecessary-condition
    if (field.isAuto && mainType !== 'postgres') {
      args.lazyEvaluate({
        type: 'uuid',
        data: `import * as pdb from '@palmares/databases;'`
      });
    }

    return getBuilderArgs(
      {
        type: mainType === 'sqlite' ? 'text' : mainType === 'postgres' ? 'uuid' : 'varchar',
        databaseName: field.databaseName as string,
        args: mainType === 'sqlite' || mainType === 'postgres' ? '' : `{ length: 36 }`
      },
      (defaultBuilderArgs) => {
        if (defaultOptions.primaryKey) defaultBuilderArgs.push(['primaryKey', '']);
        if (defaultOptions.default) defaultBuilderArgs.push(['default', `"${defaultOptions.default}"`]);
        if (defaultOptions.nullable !== true) defaultBuilderArgs.push(['notNull', '']);
        if (defaultOptions.unique) defaultBuilderArgs.push(['unique', '']);
        if (field.isAuto) {
          if (mainType === 'postgres') defaultBuilderArgs.push(['defaultRandom', '']);
          else defaultBuilderArgs.push(['$defaultFn', '() => pdb.generateUUID()']);
        }
        return defaultBuilderArgs;
      }
    )(args.customAttributes.args, args.customAttributes.options);
  }
});
