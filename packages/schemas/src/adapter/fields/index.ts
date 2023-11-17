import SchemaAdapter from '../index';
import { SchemaAdapterNotImplementedError } from '../../exceptions';
import { AdapterTranslateArgs, ErrorCodes } from '../types';
import WithFallback, { parseErrorsFactory } from '../../utils';

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
}
