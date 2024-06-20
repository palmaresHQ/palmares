import FieldAdapter from '.';
import { SchemaAdapterNotImplementedError } from '../../exceptions';

import type SchemaAdapter from '..';
import type { ObjectAdapterTranslateArgs } from '../types';
import type WithFallback from '../../utils';

export default class ObjectFieldAdapter<TResult = any> extends FieldAdapter<TResult> {
  translate(_fieldAdapter: FieldAdapter<any>, _args: ObjectAdapterTranslateArgs): any | WithFallback<'object'> {}

  parse(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter<any>,
    _result: any,
    _value: any,
    _args: ObjectAdapterTranslateArgs
  ): Promise<{ errors: any; parsed: any }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'parse' });
  }
}
