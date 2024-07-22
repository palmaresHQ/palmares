import { adapterDecimalFieldParser, auto } from '@palmares/databases';

import type DrizzleEngineFieldParser from './field';
import type { AdapterFieldParserTranslateArgs} from '@palmares/databases';

export default adapterDecimalFieldParser({
  translate: async (
    args: AdapterFieldParserTranslateArgs<
      'decimal',
      any,
      InstanceType<typeof DrizzleEngineFieldParser>,
      any
    >
  ): Promise<string> => {
    const defaultOptions = await args.fieldParser.translate(args);
    const field = args.field;
    const mainType = args.engine.instance.mainType;

    switch (mainType) {
      case 'sqlite':
        return `d.real('${field.databaseName}')${
          defaultOptions.primaryKey ? '.primaryKey()' : ''
        // eslint-disable-next-line ts/no-unnecessary-condition
        }${defaultOptions.default ? `.default(${defaultOptions.default})` : ''}${
        defaultOptions.nullable !== true ? `.notNull()` : ''
        }${
        defaultOptions.unique ? `.unique()` : ''
        }`
      case 'postgres':
        return `d.numeric('${field.databaseName}', { precision: ${field.decimalPlaces}, scale: ${field.maxDigits} })${
          defaultOptions.primaryKey ? '.primaryKey()' : ''
        }${
          defaultOptions.default ? `.default(${defaultOptions.default})` : ''
        }${
          defaultOptions.nullable !== true ? `.notNull()` : ''
        }${
          defaultOptions.unique ? `.unique()` : ''
        }`
      default:
        return `d.decimal('${field.databaseName}', { precision: ${field.decimalPlaces}, scale: ${field.maxDigits} })${
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
