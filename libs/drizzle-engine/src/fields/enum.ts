import { adapterEnumFieldParser } from '@palmares/databases';

import { getBuilderArgs } from './utils';

import type { fieldParser as DrizzleEngineFieldParser } from './field';
import type { AdapterFieldParserTranslateArgs } from '@palmares/databases';

export const enumFieldParse = adapterEnumFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<'enum', any, InstanceType<typeof DrizzleEngineFieldParser>, any>
  ): Promise<any> => {
    const defaultOptions = await args.fieldParser.translate(args);
    const field = args.field;
    const mainType = args.engine.instance.mainType;
    const optionsAsString = args.field.choices.map((choice) => `"${choice}"`).join(', ');
    const enumVariableName = `${field.fieldName}Enum`;
    if (mainType === 'postgres') {
      args.lazyEvaluate({
        type: 'enum',
        data: `export const ${enumVariableName} = d.pgEnum('${field.databaseName}', [${optionsAsString}]);`
      });
    }

    return getBuilderArgs(
      {
        type: mainType === 'sqlite' ? 'text' : mainType === 'postgres' ? enumVariableName : 'mysqlEnum',
        databaseName: field.databaseName as string,
        args:
          mainType === 'sqlite' ? `{ enum: [${optionsAsString}] }` : mainType === 'mysql' ? `[${optionsAsString}]` : '',
        withoutD: mainType === 'postgres' ? true : false
      },
      (defaultBuilderArgs) => {
        if (defaultOptions.primaryKey) defaultBuilderArgs.push(['primaryKey', '']);
        if (defaultOptions.default)
          defaultBuilderArgs.push([
            'default',
            `${typeof defaultOptions.default === 'string' ? `'${defaultOptions.default}'` : defaultOptions.default}`
          ]);
        if (defaultOptions.nullable !== true) defaultBuilderArgs.push(['notNull', '']);
        if (defaultOptions.unique) defaultBuilderArgs.push(['unique', '']);
        return defaultBuilderArgs;
      }
    )(args.customAttributes.args, args.customAttributes.options);
  }
});
