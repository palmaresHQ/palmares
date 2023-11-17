import { NoAdapterFoundError, SchemaAdapterNotImplementedError } from '../exceptions';
import FieldAdapter from './fields';
import NumberAdapter from './fields/number';
import ObjectFieldAdapter from './fields/object';
import { ErrorCodes } from './types';

export default class SchemaAdapter {
  field!: FieldAdapter;
  number!: NumberAdapter;
  object!: ObjectFieldAdapter;

  async formatError(
    _error: any,
    _metadata?: any
  ): Promise<{
    message: string;
    path: string[];
    code: ErrorCodes;
  }> {
    throw new SchemaAdapterNotImplementedError({ className: 'SchemaAdapter', functionName: 'formatError' });
  }
}
