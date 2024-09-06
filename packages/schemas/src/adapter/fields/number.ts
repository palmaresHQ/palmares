import { FieldAdapter } from '.';
import { SchemaAdapterNotImplementedError } from '../../exceptions';

import type { SchemaAdapter } from '..';
import type { WithFallback } from '../../utils';
import type { NumberAdapterTranslateArgs } from '../types';

export function numberFieldAdapter<
  TTranslate extends NumberFieldAdapter['translate'],
  TToString extends NumberFieldAdapter['toString'],
  TFormatError extends NumberFieldAdapter['formatError'],
  TParse extends NumberFieldAdapter['parse']
>(args: { translate: TTranslate; toString?: TToString; formatError?: TFormatError; parse?: TParse }) {
  class CustomNumberFieldAdapter extends NumberFieldAdapter {
    translate = args.translate;
    toString = args.toString as TToString;
    formatError = args.formatError as TFormatError;
    parse = args.parse as TParse;
  }

  return CustomNumberFieldAdapter as typeof NumberFieldAdapter & {
    new (): NumberFieldAdapter & {
      translate: TTranslate;
      toString: TToString;
      formatError: TFormatError;
      parse: TParse;
    };
  };
}

export class NumberFieldAdapter extends FieldAdapter {
  translate(_fieldAdapter: FieldAdapter, _args: NumberAdapterTranslateArgs): any | WithFallback<'number'> {}

  parse(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter,
    _result: any,
    _value: any,
    _args: NumberAdapterTranslateArgs
  ): Promise<{ errors: any; parsed: any }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'parse' });
  }
}
