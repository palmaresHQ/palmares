import { SchemaAdapter } from '@palmares/schemas';

import ZodFieldSchemaAdapter from './fields';
import ZodNumberFieldSchemaAdapter from './fields/number';
import ZodObjectFieldSchemaAdapter from './fields/object';

export class ZodSchemaAdapter extends SchemaAdapter {
  field = new ZodFieldSchemaAdapter();
  number = new ZodNumberFieldSchemaAdapter();
  object = new ZodObjectFieldSchemaAdapter();
}
