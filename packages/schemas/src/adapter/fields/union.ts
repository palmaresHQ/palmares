import FieldAdapter from '.';
import { SchemaAdapterNotImplementedError } from '../../exceptions';

import type SchemaAdapter from '..';
import type WithFallback from '../../utils';
import type { UnionAdapterTranslateArgs } from '../types';


export function unionFieldAdapter<
  TTranslate extends UnionFieldAdapter['translate'],
  TToString extends UnionFieldAdapter['toString'],
  TFormatError extends UnionFieldAdapter['formatError'],
  TParse extends UnionFieldAdapter['parse']
>(args: {
  translate: TTranslate;
  toString?: TToString;
  formatError?: TFormatError;
  parse?: TParse;
}) {
  class CustomUnionFieldAdapter extends UnionFieldAdapter {
    translate = args.translate;
    toString = args.toString as TToString;
    formatError = args.formatError as TFormatError;
    parse = args.parse as TParse;
  }

  return CustomUnionFieldAdapter as typeof UnionFieldAdapter & {
    new (): UnionFieldAdapter & {
      translate: TTranslate;
      toString: TToString;
      formatError: TFormatError;
      parse: TParse;
    }
  }
}

export default class UnionFieldAdapter extends FieldAdapter {
  translate(_fieldAdapter: FieldAdapter, _args: UnionAdapterTranslateArgs): any | WithFallback<'union'> {}

  parse(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter,
    _result: any,
    _value: any,
    _args: UnionAdapterTranslateArgs
  ): Promise<{ errors: any; parsed: any }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'parse' });
  }
}
