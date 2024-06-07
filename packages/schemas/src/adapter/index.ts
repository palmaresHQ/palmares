import { SchemaAdapterNotImplementedError } from '../exceptions';
import FieldAdapter from './fields';
import ArrayFieldAdapter from './fields/array';
import NumberFieldAdapter from './fields/number';
import ObjectFieldAdapter from './fields/object';
import StringFieldAdapter from './fields/string';
import UnionFieldAdapter from './fields/union';
import { ErrorCodes } from './types';

export default class SchemaAdapter {
  field!: FieldAdapter;
  number?: NumberFieldAdapter;
  object!: ObjectFieldAdapter;
  union?: UnionFieldAdapter;
  string?: StringFieldAdapter;
  array?: ArrayFieldAdapter;

  async formatError(
    _error: any,
    _metadata?: any
  ): Promise<{
    message: string;
    path: (string | number)[];
    code: ErrorCodes;
  }> {
    throw new SchemaAdapterNotImplementedError({ className: 'SchemaAdapter', functionName: 'formatError' });
  }
}
