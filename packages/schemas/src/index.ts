import NumberSchema, { number } from './schema/number';
import ObjectSchema, { object } from './schema/object';
import UnionSchema, { union } from './schema/union';
import StringSchema, { string } from './schema/string';
import ArraySchema, { array } from './schema/array';
import Schema, { schema } from './schema/schema';
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
export { SchemaAdapter, NumberSchema, ObjectSchema, UnionSchema, StringSchema, ArraySchema };
export { schema, number, object, union, string, array };
export { default as compile } from './compile';

import type { Narrow } from '@palmares/core';

export function getSchemasWithDefaultAdapter<TAdapter extends SchemaAdapter>() {
  return {
    number: () => number<{ schemaAdapter: TAdapter }>(),
    string: () => string<{ schemaAdapter: TAdapter }>(),
    array: <TSchemas extends readonly [Schema, ...Schema[]] | [Array<Schema>]>(...schemas: TSchemas) =>
      array<TSchemas, { schemaAdapter: TAdapter }>(...schemas),
    object: <TData extends Record<any, Schema>>(data: TData) =>
      ObjectSchema.new<TData, { schemaAdapter: TAdapter }>(data),
    union: <TSchemas extends readonly [Schema<any, any>, Schema<any, any>, ...Schema<any, any>[]]>(
      ...schemas: Narrow<TSchemas>
    ) => UnionSchema.new<TSchemas, { schemaAdapter: TAdapter }>(schemas),
  };
}
