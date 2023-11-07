import SchemaAdapter from '../index';
import { SchemaAdapterNotImplementedError } from '../../exceptions';
import { AdapterTranslateArgs } from '../types';
import WithFallback from '../../utils';

export default class FieldAdapter<TResult = any> {
  __result!: TResult;

  translate(_fieldAdapter: FieldAdapter<any>, _args: AdapterTranslateArgs, _base?: any): any | WithFallback {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'translate' });
  }

  parse(
    _adapter: SchemaAdapter,
    _result: FieldAdapter['__result'],
    _value: any
  ): Promise<{ errors: any; parsed: any }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'parse' });
  }

  errors(
    _adapter: SchemaAdapter,
    _result: FieldAdapter['__result'],
    _value: any
  ): Promise<{
    slug: string;
    message: string;
    metadata: any;
  }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'errors' });
  }
}
