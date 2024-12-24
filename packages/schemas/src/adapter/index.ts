import { SchemaAdapterNotImplementedError } from '../exceptions';

import type { FieldAdapter } from './fields';
import type { ArrayFieldAdapter } from './fields/array';
import type { BooleanFieldAdapter } from './fields/boolean';
import type { DatetimeFieldAdapter } from './fields/datetime';
import type { NumberFieldAdapter } from './fields/number';
import type { ObjectFieldAdapter } from './fields/object';
import type { StringFieldAdapter } from './fields/string';
import type { UnionFieldAdapter } from './fields/union';
import type { ErrorCodes } from './types';

export class SchemaAdapter {
  $$type = '$PSchemaAdapter';
  name!: string;
  field!: FieldAdapter;
  number?: NumberFieldAdapter;
  object!: ObjectFieldAdapter;
  union?: UnionFieldAdapter;
  string?: StringFieldAdapter;
  array?: ArrayFieldAdapter;
  boolean?: BooleanFieldAdapter;
  datetime?: DatetimeFieldAdapter;
  adapterInstance: any;

  // eslint-disable-next-line ts/require-await
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

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace Palmares {
    interface PSchemaAdapter {}
  }
}
