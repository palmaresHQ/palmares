import SchemaAdapter from '../index';
import { SchemaAdapterNotImplementedError } from '../../exceptions';
import { AdapterToStringArgs, AdapterTranslateArgs, ErrorCodes } from '../types';
import WithFallback from '../../utils';
import { SupportedSchemas } from '../../types';

export default class FieldAdapter<TResult = any> {
  translate(_fieldAdapter: FieldAdapter<any>, _args: AdapterTranslateArgs<SupportedSchemas>, _base?: any): any | WithFallback<SupportedSchemas> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'translate' });
  }

  parse(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter<any>,
    _result: any,
    _value: any,
    _args: Omit<AdapterTranslateArgs<SupportedSchemas>, 'withFallback'>,
  ): Promise<{ errors: any; parsed: any }> {
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

  async formatError(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter<any>,
    _error: any,
    _metadata?: any
  ): Promise<{
    message: string;
    path: (string | number)[];
    code: ErrorCodes;
  }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'formatError' });
  }
}
