import FieldAdapter from '.';
import { SchemaAdapterNotImplementedError } from '../../exceptions';

import type SchemaAdapter from '..';
import type WithFallback from '../../utils';
import type { DatetimeAdapterTranslateArgs } from '../types';


export function datetimeFieldAdapter<
  TTranslate extends DatetimeFieldAdapter['translate'],
  TToString extends DatetimeFieldAdapter['toString'],
  TFormatError extends DatetimeFieldAdapter['formatError'],
  TParse extends DatetimeFieldAdapter['parse']
>(args: {
  translate: TTranslate;
  toString?: TToString;
  formatError?: TFormatError;
  parse?: TParse;
}) {
  class CustomDatetimeFieldAdapter extends DatetimeFieldAdapter {
    translate = args.translate as TTranslate;
    toString = args.toString as TToString;
    formatError = args.formatError as TFormatError;
    parse = args.parse as TParse;
  }

  return CustomDatetimeFieldAdapter as typeof DatetimeFieldAdapter & {
    new (): DatetimeFieldAdapter & {
      translate: TTranslate;
      toString: TToString;
      formatError: TFormatError;
      parse: TParse;
    }
  }
}

export default class DatetimeFieldAdapter extends FieldAdapter {
  translate(_fieldAdapter: FieldAdapter, _args: DatetimeAdapterTranslateArgs): any | WithFallback<'datetime'> {}

  parse(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter,
    _result: any,
    _value: any,
    _args: DatetimeAdapterTranslateArgs
  ): Promise<{ errors: any; parsed: any }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'parse' });
  }
}
