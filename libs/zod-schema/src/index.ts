import { ErrorCodes, SchemaAdapter } from '@palmares/schemas';
import * as z from 'zod';

import ZodFieldSchemaAdapter from './fields';
import ZodNumberFieldSchemaAdapter from './fields/number';
import ZodObjectFieldSchemaAdapter from './fields/object';
import ZodUnionFieldSchemaAdapter from './fields/union';

export class ZodSchemaAdapter extends SchemaAdapter {
  field = new ZodFieldSchemaAdapter();
  number = new ZodNumberFieldSchemaAdapter();
  object = new ZodObjectFieldSchemaAdapter();
  union = new ZodUnionFieldSchemaAdapter();

  async formatError(error: z.ZodIssue) {
    return {
      message: error.message,
      path: error.path.map((path) => `${path}`),
      code: error.code as ErrorCodes,
    };
  }
}
