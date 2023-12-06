import { setDefaultAdapter, NumberSchema, ObjectSchema, getSchemasWithDefaultAdapter } from '@palmares/schemas';
import { ZodSchemaAdapter } from '@palmares/zod-schema';
import * as z from 'zod';

setDefaultAdapter(ZodSchemaAdapter);

const schema = {
  age: z.number().max(9),
  spent: z.number().min(12),
};

schema.spent = z.string();
const object = z.object(schema);

// funciona pq alterei pela referencia.
object.parse({ age: 10, spent: 'funciona' });

const zodObjectSchema = z.object({
  teste: z.object({
    age: z.number().max(9),
    spent: z.number().min(12),
  }),
});

const testeObjectSchema = ObjectSchema.new({
  age: NumberSchema.new(),
  spent: NumberSchema.new()
    .min(12, { inclusive: true })
    .positive()
    .toValidate((value) => {
      return Number(value);
    })
    .toInternal(async (value) => {
      return {
        teste: value,
      };
    })
    .toRepresentation(async (value) => {
      console.log('without validation, changing how the data is sent to the user', value, typeof value);
      return 'Aquiiii';
    }),
});

const objectSchema = ObjectSchema.new({
  heeey: NumberSchema.new().toInternal(async (value) => {
    return 'ta funcionando?';
  }),
  teste: ObjectSchema.new({
    age: NumberSchema.new(),
    spent: NumberSchema.new()
      .min(12, { inclusive: true })
      .positive()
      .toValidate((value) => {
        return Number(value);
      })
      .toInternal(async (value) => {
        return {
          teste: value,
        };
      })
      .toRepresentation(async (value) => {
        console.log('without validation, changing how the data is sent to the user', value, typeof value);
        return 'Aquiiii';
      }),
  })
    .nullable()
    .or(NumberSchema.new()),
});

const main = async () => {
  const [testeResult] = await Promise.all([objectSchema.parse({ heeey: 100, teste: 22 })]);
  console.log(testeResult.errors);
  console.log(testeResult.parsed);
};

main();
