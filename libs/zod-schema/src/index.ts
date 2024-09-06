import { SchemaAdapter } from '@palmares/schemas';
import * as z from 'zod';

import { defaultFieldAdapter } from './fields';
import { arrayAdapter } from './fields/array';
import { booleanAdapter } from './fields/boolean';
import { datetimeAdapter } from './fields/datetime';
import { numberAdapter } from './fields/number';
import { objectAdapter } from './fields/object';
import { stringAdapter } from './fields/string';
import { unionAdapter } from './fields/union';

import type { ErrorCodes } from '@palmares/schemas';

export { z };
export class ZodSchemaAdapter extends SchemaAdapter {
  field = new defaultFieldAdapter();
  number = new numberAdapter();
  object = new objectAdapter();
  union = new unionAdapter();
  boolean = new booleanAdapter();
  string = new stringAdapter();
  datetime = new datetimeAdapter();
  array = new arrayAdapter();
  // eslint-disable-next-line ts/require-await
  async formatError(error: z.ZodIssue) {
    return {
      message: error.message,
      path: error.path.map((path) => `${path}`),
      code: error.code as ErrorCodes
    };
  }
}
