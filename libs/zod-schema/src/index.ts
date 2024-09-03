import { SchemaAdapter } from '@palmares/schemas';
import * as z from 'zod';

import ZodFieldSchemaAdapter from './fields';
import ZodArrayFieldSchemaAdapter from './fields/array';
import ZodBooleanFieldSchemaAdapter from './fields/boolean';
import ZodDatetimeFieldSchemaAdapter from './fields/datetime';
import ZodNumberFieldSchemaAdapter from './fields/number';
import ZodObjectFieldSchemaAdapter from './fields/object';
import ZodStringFieldSchemaAdapter from './fields/string';
import ZodUnionFieldSchemaAdapter from './fields/union';

import type { ErrorCodes } from '@palmares/schemas';

export { z };
export class ZodSchemaAdapter extends SchemaAdapter {
  field = new ZodFieldSchemaAdapter();
  number = new ZodNumberFieldSchemaAdapter();
  object = new ZodObjectFieldSchemaAdapter();
  union = new ZodUnionFieldSchemaAdapter();
  boolean = new ZodBooleanFieldSchemaAdapter();
  string = new ZodStringFieldSchemaAdapter();
  datetime = new ZodDatetimeFieldSchemaAdapter();
  array = new ZodArrayFieldSchemaAdapter();
  // eslint-disable-next-line ts/require-await
  async formatError(error: z.ZodIssue) {
    return {
      message: error.message,
      path: error.path.map((path) => `${path}`),
      code: error.code as ErrorCodes
    };
  }
}
