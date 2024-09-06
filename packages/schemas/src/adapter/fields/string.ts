import { FieldAdapter } from '.';
import { SchemaAdapterNotImplementedError } from '../../exceptions';

import type { SchemaAdapter } from '..';
import type { WithFallback } from '../../utils';
import type { StringAdapterTranslateArgs } from '../types';

export function stringFieldAdapter<
  TTranslate extends StringFieldAdapter['translate'],
  TToString extends StringFieldAdapter['toString'],
  TFormatError extends StringFieldAdapter['formatError'],
  TParse extends StringFieldAdapter['parse']
>(args: { translate: TTranslate; toString?: TToString; formatError?: TFormatError; parse?: TParse }) {
  class CustomStringFieldAdapter extends StringFieldAdapter {
    translate = args.translate;
    toString = args.toString as TToString;
    formatError = args.formatError as TFormatError;
    parse = args.parse as TParse;
  }

  return CustomStringFieldAdapter as typeof StringFieldAdapter & {
    new (): StringFieldAdapter & {
      translate: TTranslate;
      toString: TToString;
      formatError: TFormatError;
      parse: TParse;
    };
  };
}

export class StringFieldAdapter extends FieldAdapter {
  translate(_fieldAdapter: FieldAdapter, _args: StringAdapterTranslateArgs): any | WithFallback<'string'> {}

  parse(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter,
    _result: any,
    _value: any,
    _args: StringAdapterTranslateArgs
  ): Promise<{ errors: any; parsed: any }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'parse' });
  }
}
