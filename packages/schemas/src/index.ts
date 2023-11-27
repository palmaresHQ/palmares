import NumberSchema from './schema/number';
import ObjectSchema from './schema/object';
import Schema from './schema/schema';
import SchemaAdapter from './adapter';

export { default as default } from './domain';
export { default as FieldAdapter } from './adapter/fields';
export { default as NumberAdapter } from './adapter/fields/number';
export { default as ObjectFieldAdapter } from './adapter/fields/object';
export { setDefaultAdapter } from './conf';
export * from './adapter/types';
export * from './schema';
export { default as ObjectSchema } from './schema/object';
export { SchemaAdapter, NumberSchema };

export function getSchemasWithDefaultAdapter<TAdapter extends SchemaAdapter>() {
  return {
    number: NumberSchema.new<{ schemaAdapter: TAdapter }>,
    object: <TData extends Record<any, Schema>>(data: TData) =>
      ObjectSchema.new<TData, { schemaAdapter: TAdapter }>(data),
  };
}
