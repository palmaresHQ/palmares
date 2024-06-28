import FieldAdapter from '.';
import WithFallback from '../../utils';
import { NumberAdapterTranslateArgs } from '../types';

export function arrayFieldAdapter<
  TTranslate extends ArrayFieldAdapter['translate'],
  TToString extends ArrayFieldAdapter['toString'],
  TFormatError extends ArrayFieldAdapter['formatError'],
  TParse extends ArrayFieldAdapter['parse']
>(args: {
  translate: TTranslate;
  toString?: TToString;
  formatError?: TFormatError;
  parse?: TParse;
}) {
  class CustomArrayFieldAdapter extends ArrayFieldAdapter {
    translate = args.translate as TTranslate;
    toString = args.toString as TToString;
    formatError = args.formatError as TFormatError;
    parse = args.parse as TParse;
  }

  return CustomArrayFieldAdapter as typeof ArrayFieldAdapter & {
    new (): ArrayFieldAdapter & {
      translate: TTranslate;
      toString: TToString;
      formatError: TFormatError;
      parse: TParse;
    }
  }
}

export default class ArrayFieldAdapter extends FieldAdapter {
  translate(_fieldAdapter: FieldAdapter, _args: NumberAdapterTranslateArgs): any | WithFallback<'array'> {}
}
