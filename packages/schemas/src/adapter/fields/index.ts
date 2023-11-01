import SchemaAdapter from '../index';
import { SchemaAdapterNotImplementedError } from '../../exceptions';
import { AdapterTranslateArgs } from '../types';

export default class FieldAdapter<TResult = any> {
  __result!: TResult;

  translate(_fieldAdapter: FieldAdapter<any>, _args: AdapterTranslateArgs, _base?: any) {}

  parse(
    _adapter: SchemaAdapter,
    _result: FieldAdapter['__result'],
    _value: any
  ): Promise<{ errors: any; parsed: any }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'parse' });
  }
}
