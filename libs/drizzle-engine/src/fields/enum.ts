import { AdapterFieldParserTranslateArgs, adapterEnumFieldParser } from '@palmares/databases';

import DrizzleEngineFieldParser from './field';
import { pgEnum, pgTable } from "drizzle-orm/pg-core";
export const moodEnum = pgEnum('mood', ['sad', 'ok', 'happy']);
export const table = pgTable('table', {
  mood: moodEnum('mood'),
});
export default adapterEnumFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'enum',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any
    >
  ): Promise<any> => {
    const defaultOptions = await args.fieldParser.translate(args);
    const field = args.field;
    const mainType = args.engine.instance.mainType;
    const optionsAsString = args.field.choices.map((choice) => `"${choice}"`).join(', ')
    switch (mainType) {
      case 'sqlite':
        return `d.text('${field.databaseName}', { enum: [${optionsAsString}] })${
            defaultOptions.primaryKey ? '.primaryKey()' : ''
          }${defaultOptions.default ? `.default(${defaultOptions.default})` : ''}${
          defaultOptions.nullable !== true ? `.notNull()` : ''
          }${
          defaultOptions.unique ? `.unique()` : ''
          }`
      case 'postgres':
        const enumVariableName = `${field.fieldName}Enum`;
        args.lazyEvaluate({
          type: 'enum',
          data: `export const ${enumVariableName} = d.pgEnum('${field.databaseName}', [${optionsAsString}]);`
        });

        return `${enumVariableName}('${field.databaseName}')${
            defaultOptions.primaryKey ? '.primaryKey()' : ''
          }${defaultOptions.default ? `.default(${defaultOptions.default})` : ''}${
          defaultOptions.nullable !== true ? `.notNull()` : ''
          }${
          defaultOptions.unique ? `.unique()` : ''
          }`
      default:
        return `d.mysqlEnum('${field.databaseName}', [${optionsAsString}])${
          defaultOptions.primaryKey ? '.primaryKey()' : ''
        }${
          defaultOptions.default ? `.default(${defaultOptions.default})` : ''
        }${
          defaultOptions.nullable !== true ? `.notNull()` : ''
        }${
          defaultOptions.unique ? `.unique()` : ''
        }`
    }
  },
});
