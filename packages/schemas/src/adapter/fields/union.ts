import FieldAdapter from '.';
import { SchemaAdapterNotImplementedError } from '../../exceptions';

import type SchemaAdapter from '..';
import type { UnionAdapterTranslateArgs } from '../types';
import type WithFallback from '../../utils';

export default class UnionFieldAdapter<TResult = any> extends FieldAdapter<TResult> {
  translate(_fieldAdapter: FieldAdapter<any>, _args: UnionAdapterTranslateArgs): any | WithFallback<'union'> {}

  parse(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter<any>,
    _result: any,
    _value: any,
    _args: UnionAdapterTranslateArgs
  ): Promise<{ errors: any; parsed: any }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'parse' });
  }
}
