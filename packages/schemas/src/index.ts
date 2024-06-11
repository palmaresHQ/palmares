import NumberSchema, { number } from './schema/number';
import ObjectSchema, { object } from './schema/object';
import UnionSchema, { union } from './schema/union';
import StringSchema, { string } from './schema/string';
import ArraySchema, { array } from './schema/array';
import BooleanSchema, { boolean } from './schema/boolean';
import DatetimeSchema, { datetime } from './schema/datetime';
import Schema, { schema } from './schema/schema';
import SchemaAdapter from './adapter';

export { default as default } from './domain';
export { default as FieldAdapter } from './adapter/fields';
export { default as NumberAdapter } from './adapter/fields/number';
export { default as ObjectFieldAdapter } from './adapter/fields/object';
export { default as UnionFieldAdapter } from './adapter/fields/union';
export { default as StringFieldAdapter } from './adapter/fields/string';
export { default as ArrayFieldAdapter } from './adapter/fields/array';
export { default as BooleanFieldAdapter } from './adapter/fields/boolean';
export { default as DatetimeFieldAdapter } from './adapter/fields/datetime';

export { setDefaultAdapter } from './conf';
export * from './adapter/types';
export * from './schema';
export {
  SchemaAdapter,
  NumberSchema,
  ObjectSchema,
  UnionSchema,
  StringSchema,
  ArraySchema,
  BooleanSchema,
  DatetimeSchema,
  Schema,
};
export { schema, number, object, union, string, array, datetime, boolean };
export { default as compile } from './compile';

import type { Narrow } from '@palmares/core';

export function getSchemasWithDefaultAdapter<TAdapter extends SchemaAdapter>() {
  return {
    number: () => number<{ schemaAdapter: TAdapter; hasSave: false }>(),
    string: () => StringSchema.new<{ schemaAdapter: TAdapter; hasSave: false }>(),
    array: <TSchemas extends readonly [Schema, ...Schema[]] | [Array<Schema>]>(...schemas: TSchemas) =>
      array<TSchemas, { schemaAdapter: TAdapter; hasSave: false }>(...schemas),
    boolean: () => BooleanSchema.new<{ schemaAdapter: TAdapter; hasSave: false }>(),
    object: <TData extends Record<any, Schema<any, any>>>(data: TData) =>
      ObjectSchema.new<TData, { schemaAdapter: TAdapter; hasSave: false }>(data),
    union: <TSchemas extends readonly [Schema<any, any>, Schema<any, any>, ...Schema<any, any>[]]>(
      ...schemas: Narrow<TSchemas>
    ) => UnionSchema.new<TSchemas, { schemaAdapter: TAdapter; hasSave: false }>(schemas),
  };
}
/*
const prisma = {
  user: {
    create: (data: { email: string; password: string }) => {
      return { id: '1', ...data };
    },
  },
};
function express() {
  return {
    post(path: string, callback: (req: any, res: any) => void) {
      callback();
    },
  };
}

const userSchema = object({
  id: string().nullable().optional(),
  email: string(),
  password: string(),
})
  .onSave(async (data) => {
    const user = prisma.user.create({ email: data.email, password: data.password });
    return user;
  })
  .toRepresentation(async (createdUser) => {
    return { id: createdUser.id as string, email: createdUser.email };
  });

const app = express();

app.post('/login', async (req, res) => {
  const validatedResult = await userSchema.validate(req.body);

  if (validatedResult.isValid) {
    const user = await validatedResult.save();
    res.json(user);
    return;
  }

  res.json(validatedResult.errors);
});
*/
