import NumberSchema from './schema/number';
import ObjectSchema from './schema/object';
import UnionSchema from './schema/union';
import StringSchema from './schema/string';
import Schema from './schema/schema';
import SchemaAdapter from './adapter';

export { default as default } from './domain';
export { default as FieldAdapter } from './adapter/fields';
export { default as NumberAdapter } from './adapter/fields/number';
export { default as ObjectFieldAdapter } from './adapter/fields/object';
export { default as UnionFieldAdapter } from './adapter/fields/union';
export { default as StringFieldAdapter } from './adapter/fields/string';

export { setDefaultAdapter } from './conf';
export * from './adapter/types';
export * from './schema';
export { SchemaAdapter, NumberSchema, ObjectSchema, UnionSchema, StringSchema };
export { default as compile } from './compile';

import type { Narrow } from '@palmares/core';

export function getSchemasWithDefaultAdapter<TAdapter extends SchemaAdapter>() {
  return {
    number: NumberSchema.new<{ schemaAdapter: TAdapter }>,
    object: <TData extends Record<any, Schema>>(data: TData) =>
      ObjectSchema.new<TData, { schemaAdapter: TAdapter }>(data),
    union: <TSchemas extends readonly [Schema<any, any>, Schema<any, any>, ...Schema<any, any>[]]>(
      ...schemas: Narrow<TSchemas>
    ) => UnionSchema.new<TSchemas, { schemaAdapter: TAdapter }>(schemas),
  };
}
