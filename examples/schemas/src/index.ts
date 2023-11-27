import { setDefaultAdapter, NumberSchema, ObjectSchema, getSchemasWithDefaultAdapter } from '@palmares/schemas';
import { ZodSchemaAdapter } from '@palmares/zod-schema';
import * as z from 'zod';

setDefaultAdapter(ZodSchemaAdapter);

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
  teste: testeObjectSchema,
});

//const schema = NumberSchema.new().max(10).min(5);

const main = async () => {
  const result = zodObjectSchema.safeParse({});
  console.log(result.success);
  console.log(result.error);
  /*const [testeResult, objectResult, testeResult2] = await Promise.all([
    objectSchema._parse({ heeey: 100, teste: { age: 8, spent: 12 } }),
    testeObjectSchema._parse({ age: 8, spent: 12 }),
    objectSchema._parse({ heeey: 100, teste: { age: 8, spent: 12 } }),
  ]);

  console.log(testeResult.parsed);
  console.log(testeResult.errors);

  console.log(objectResult.parsed);
  console.log(objectResult.errors);

  console.log(testeResult2.parsed);
  console.log(testeResult2.errors);*/
};

main();
