import { adapterForeignKeyFieldParser } from '@palmares/databases';

import type { fieldParser as DrizzleEngineFieldParser } from './field';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';

export const foreignKeyFieldParser = adapterForeignKeyFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<'foreign-key', any, InstanceType<typeof DrizzleEngineFieldParser>, any>
  ): Promise<undefined> => {
    const defaultOptions = await args.fieldParser.translate(args);

    args.lazyEvaluate({
      type: 'foreign-key',
      fieldAttributes: {
        ...defaultOptions,
        foreignData: {
          ...args.field,
          toField: args.field.toField,
          relatedToModelName: args.field.relatedTo,
          relatedName: args.field.relatedName,
          relationName: args.field.relationName,
          action: args.field.onDelete
        }
      }
    });
  }
});
