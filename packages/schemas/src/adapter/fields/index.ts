import SchemaAdapter from '../index';
import { SchemaAdapterNotImplementedError } from '../../exceptions';
import { AdapterToStringArgs, AdapterTranslateArgs } from '../types';
import WithFallback from '../../utils';

export default class FieldAdapter<TResult = any> {
  translate(_fieldAdapter: FieldAdapter<any>, _args: AdapterTranslateArgs, _base?: any): any | WithFallback {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'translate' });
  }

  parse?(_adapter: SchemaAdapter, _result: any, _value: any): Promise<{ errors: any; parsed: any }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'parse' });
  }

  toString(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter<any>,
    _args: AdapterToStringArgs,
    _base?: any
  ): Promise<string> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'toString' });
  }
}
