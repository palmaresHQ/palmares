import SchemaAdapter from '../adapter';
import FieldAdapter from '../adapter/fields';

export type OnlyFieldAdaptersFromSchemaAdapter = keyof {
  [key in keyof SchemaAdapter as SchemaAdapter[key] extends FieldAdapter ? key : never]: SchemaAdapter[key];
};
