import { adapterEnumFieldParser } from '@palmares/databases';

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
    switch (mainType) {
      case 'sqlite':
        return `d.text('${field.databaseName}', { enum: [${optionsAsString}] })${
          defaultOptions.primaryKey ? '.primaryKey()' : ''
          // eslint-disable-next-line ts/no-unnecessary-condition
        }${defaultOptions.default ? `.default(${typeof defaultOptions.default === 'string' ? `'${defaultOptions.default}'` : defaultOptions.default})` : ''}${
          defaultOptions.nullable !== true ? `.notNull()` : ''
        }${
          // eslint-disable-next-line ts/no-unnecessary-condition
          defaultOptions.unique ? `.unique()` : ''
        }`;
      case 'postgres':
        // eslint-disable-next-line no-case-declarations
        const enumVariableName = `${field.fieldName}Enum`;
        args.lazyEvaluate({
          type: 'enum',
          data: `export const ${enumVariableName} = d.pgEnum('${field.databaseName}', [${optionsAsString}]);`
        });

        return `${enumVariableName}('${field.databaseName}')${
          defaultOptions.primaryKey ? '.primaryKey()' : ''
          // eslint-disable-next-line ts/no-unnecessary-condition
        }${defaultOptions.default ? `.default(${typeof defaultOptions.default === 'string' ? `'${defaultOptions.default}'` : defaultOptions.default})` : ''}${
          defaultOptions.nullable !== true ? `.notNull()` : ''
        }${
          // eslint-disable-next-line ts/no-unnecessary-condition
          defaultOptions.unique ? `.unique()` : ''
        }`;
      default:
        return `d.mysqlEnum('${field.databaseName}', [${optionsAsString}])${
          defaultOptions.primaryKey ? '.primaryKey()' : ''
        }${
          // eslint-disable-next-line ts/no-unnecessary-condition
          defaultOptions.default
            ? `.default(${typeof defaultOptions.default === 'string' ? `'${defaultOptions.default}'` : defaultOptions.default})`
            : ''
        }${defaultOptions.nullable !== true ? `.notNull()` : ''}${
          // eslint-disable-next-line ts/no-unnecessary-condition
          defaultOptions.unique ? `.unique()` : ''
        }`;
    }
  }
});
