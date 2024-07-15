import { AdapterFieldParserTranslateArgs, adapterForeignKeyFieldParser } from '@palmares/databases';

import DrizzleEngineFieldParser from './field';

export default adapterForeignKeyFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'foreign-key',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any
    >
  ): Promise<undefined> => {
    const defaultOptions = await args.fieldParser.translate(args);

    args.lazyEvaluate({
      type: 'foreign-key',
      fieldAttributes: {
        ...defaultOptions,
        foreignData: {
          palmaresModel: args.field.modelRelatedTo,
          palmaresField: args.field.modelRelatedTo._fields()[args.field.toField],
          toField: args.field.toField,
          relatedToModelName: args.field.relatedTo,
          relatedName: args.field.relatedName,
          relationName: args.field.relationName,
          action: args.field.onDelete
        }
      },
    })
  },
});
