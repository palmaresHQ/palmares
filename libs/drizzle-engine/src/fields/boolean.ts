import { adapterBooleanFieldParser } from '@palmares/databases';

import { getBuilderArgs } from './utils';

import type { fieldParser as DrizzleEngineFieldParser } from './field';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';

export const booleanFieldParser = adapterBooleanFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<'boolean', any, InstanceType<typeof DrizzleEngineFieldParser>, any>
  ): Promise<any> => {
    const defaultOptions = await args.fieldParser.translate(args);
    const field = args.field;
    const mainType = args.engine.instance.mainType;

    const builderArgsFormatted = getBuilderArgs(
      {
        type: mainType === 'sqlite' ? 'integer' : 'boolean',
        databaseName: field.databaseName as string,
        args: mainType === 'sqlite' ? "{ mode: 'number' }" : undefined
      },
      (defaultBuilderArgs) => {
        if (defaultOptions.primaryKey) defaultBuilderArgs.push(['primaryKey', '']);
        if (defaultOptions.default) defaultBuilderArgs.push(['default', defaultOptions.default]);
        if (defaultOptions.nullable !== true) defaultBuilderArgs.push(['notNull', '']);
        if (defaultOptions.unique) defaultBuilderArgs.push(['unique', '']);
        return defaultBuilderArgs;
      }
    )(args.customAttributes.args, args.customAttributes.options);

    return builderArgsFormatted;
  }
});
