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
  }).nullable(),
});

const main = async () => {
  const [testeResult] = await Promise.all([objectSchema._parse({ heeey: 100, teste: null })]);
  console.log(testeResult.parsed);
  console.log(testeResult.errors);

  /*
  console.log(objectResult.parsed);
  console.log(objectResult.errors);

  console.log(testeResult2.parsed);
  console.log(testeResult2.errors);
  */
};

main();
