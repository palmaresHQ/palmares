import FieldAdapter from '.';
import { SchemaAdapterNotImplementedError } from '../../exceptions';

import type SchemaAdapter from '..';
import type WithFallback from '../../utils';
import type { DatetimeAdapterTranslateArgs } from '../types';

export default class DatetimeFieldAdapter<TResult = any> extends FieldAdapter<TResult> {
  translate(_fieldAdapter: FieldAdapter<any>, _args: DatetimeAdapterTranslateArgs): any | WithFallback<'datetime'> {}

  parse(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter<any>,
    _result: any,
    _value: any,
    _args: DatetimeAdapterTranslateArgs
  ): Promise<{ errors: any; parsed: any }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'parse' });
  }
}
