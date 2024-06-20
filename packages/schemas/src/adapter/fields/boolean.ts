import FieldAdapter from '.';
import { SchemaAdapterNotImplementedError } from '../../exceptions';

import type SchemaAdapter from '..';
import type WithFallback from '../../utils';
import type { BooleanAdapterTranslateArgs } from '../types';

export default class BooleanFieldAdapter<TResult = any> extends FieldAdapter<TResult> {
  translate(_fieldAdapter: FieldAdapter<any>, _args: BooleanAdapterTranslateArgs): any | WithFallback<'boolean'> {}

  parse(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter<any>,
    _result: any,
    _value: any,
    _args: BooleanAdapterTranslateArgs
  ): Promise<{ errors: any; parsed: any }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'parse' });
  }
}
