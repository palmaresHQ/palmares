import FieldAdapter from '.';
import { SchemaAdapterNotImplementedError } from '../../exceptions';

import type SchemaAdapter from '..';
import type WithFallback from '../../utils';
import type { BooleanAdapterTranslateArgs } from '../types';

export function booleanFieldAdapter<
  TTranslate extends BooleanFieldAdapter['translate'],
  TToString extends BooleanFieldAdapter['toString'],
  TFormatError extends BooleanFieldAdapter['formatError'],
  TParse extends BooleanFieldAdapter['parse']
>(args: {
  translate: TTranslate;
  toString?: TToString;
  formatError?: TFormatError;
  parse?: TParse;
}) {
  class CustomBooleanFieldAdapter extends BooleanFieldAdapter {
    translate = args.translate;
    toString = args.toString as TToString;
    formatError = args.formatError as TFormatError;
    parse = args.parse as TParse;
  }

  return CustomBooleanFieldAdapter as typeof BooleanFieldAdapter & {
    new (): BooleanFieldAdapter & {
      translate: TTranslate;
      toString: TToString;
      formatError: TFormatError;
      parse: TParse;
    }
  }
}

export default class BooleanFieldAdapter extends FieldAdapter {
  translate(_fieldAdapter: FieldAdapter, _args: BooleanAdapterTranslateArgs): any | WithFallback<'boolean'> {}

  parse(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter,
    _result: any,
    _value: any,
    _args: BooleanAdapterTranslateArgs
  ): Promise<{ errors: any; parsed: any }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'parse' });
  }
}
