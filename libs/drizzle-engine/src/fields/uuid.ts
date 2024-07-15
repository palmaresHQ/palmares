import { AdapterFieldParserTranslateArgs, adapterUuidFieldParser } from '@palmares/databases';

import DrizzleEngineFieldParser from './field';

export default adapterUuidFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'uuid',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any
    >
  ): Promise<string> => {
    const defaultOptions = await args.fieldParser.translate(args);
    const field = args.field;
    const mainType = args.engine.instance.mainType
    if (field.autoGenerate) {
      args.lazyEvaluate({
        type: 'uuid',
        data: `import * as pdb from '@palmares/databases;'`
      })
    }
    switch (mainType) {
      case 'sqlite':
        return `d.text('${field.databaseName}')${
          defaultOptions.primaryKey ? '.primaryKey()' : ''
        }${defaultOptions.default && field.autoGenerate as boolean !== true ? `.default("${defaultOptions.default}")` : ''}${
        defaultOptions.nullable !== true ? `.notNull()` : ''
        }${
        defaultOptions.unique ? `.unique()` : ''
        }${field.autoGenerate as boolean ? `.$defaultFn(() => pdb.generateUUID())` : ''}`
      default:
        return `d.varchar('${field.databaseName}', { length: 36 })${
          defaultOptions.primaryKey ? '.primaryKey()' : ''
        }${defaultOptions.default && field.autoGenerate as boolean !== true ? `.default("${defaultOptions.default}")` : ''}${
        defaultOptions.nullable !== true ? `.notNull()` : ''
        }${
        defaultOptions.unique ? `.unique()` : ''
        }${field.autoGenerate as boolean ? `.$defaultFn(() => pdb.generateUUID())` : ''}`
    }
  },
});

