import { adapterFieldParser } from '@palmares/databases';

import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';

export default adapterFieldParser({
  // eslint-disable-next-line ts/require-await
  translate: async (args: AdapterFieldParserTranslateArgs<any, any, any, any>) => {
    if (args.field.dbIndex) {
      args.lazyEvaluate({
        type: 'index',
        indexAttributes: {
          modelName: args.modelName,
          fieldName: args.field.fieldName,
          databaseName: args.field.databaseName,
          unique: args.field.unique
        }
      });
    }

    const fieldData = {
      fieldName: args.field.fieldName,
      primaryKey: args.field.primaryKey,
      unique: args.field.unique as boolean,
      nullable: args.field.allowNull as boolean,
      dbIndex: args.field.dbIndex,
      default: args.field.defaultValue as any,
      autoincrement: args.field.isAuto as boolean,
      databaseName: args.field.databaseName
    };
    return fieldData;
  }
});
