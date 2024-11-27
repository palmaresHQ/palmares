import { adapterUuidFieldParser } from '@palmares/databases';

import type { fieldParser as DrizzleEngineFieldParser } from './field';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';

export const uuidFieldParser = adapterUuidFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<'uuid', any, InstanceType<typeof DrizzleEngineFieldParser>, any>
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
    if (field.isAuto) {
      args.lazyEvaluate({
        type: 'uuid',
        data: `import * as pdb from '@palmares/databases;'`
      });
    }
    switch (mainType) {
      case 'sqlite':
        return `d.text('${field.databaseName}')${defaultOptions.primaryKey ? '.primaryKey()' : ''}${
          defaultOptions.default && field.isAuto !== true ? `.default("${defaultOptions.default}")` : ''
        }${defaultOptions.nullable !== true ? `.notNull()` : ''}${
          defaultOptions.unique ? `.unique()` : ''
        }${field.isAuto ? `.$defaultFn(() => pdb.generateUUID())` : ''}`;
      case 'postgres':
        return `d.uuid('${field.databaseName}', { length: 36 })${defaultOptions.primaryKey ? '.primaryKey()' : ''}${
          defaultOptions.default && field.isAuto !== true ? `.default("${defaultOptions.default}")` : ''
        }${
          defaultOptions.nullable !== true ? `.notNull()` : ''
        }${defaultOptions.unique ? `.unique()` : ''}${field.isAuto ? `.defaultRandom()` : ''}`;
      default:
        return `d.varchar('${field.databaseName}', { length: 36 })${defaultOptions.primaryKey ? '.primaryKey()' : ''}${
          defaultOptions.default && field.isAuto !== true ? `.default("${defaultOptions.default}")` : ''
        }${defaultOptions.nullable !== true ? `.notNull()` : ''}${
          defaultOptions.unique ? `.unique()` : ''
        }${field.isAuto ? `.$defaultFn(() => pdb.generateUUID())` : ''}`;
    }
  }
});
