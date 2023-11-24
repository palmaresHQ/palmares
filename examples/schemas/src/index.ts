import { setDefaultAdapter, NumberSchema, ObjectSchema } from '@palmares/schemas';
import { ZodSchemaAdapter } from '@palmares/zod-schema';
import * as z from 'zod';

setDefaultAdapter(ZodSchemaAdapter);

const zodObjectSchema = z.object({
  teste: z.object({
    age: z.number().max(9),
    spent: z.number().min(12),
  }),
});

const objectSchema = ObjectSchema.new({
  teste: ObjectSchema.new({
    age: NumberSchema.new().max(9),
    spent: NumberSchema.new()
      .min(12, { inclusive: true })
      .positive()
      .toValidate((value) => {
        console.log('before validation', value, typeof value);
        return Number(value);
      })
      .toInternal(async (value) => {
        console.log('after validation, changing how the data is displayed', value, typeof value);
        return {
          teste: value,
        };
      }),
  }),
});

//const schema = NumberSchema.new().max(10).min(5);

const main = async () => {
  const data = { age: 8, spent: 12 };
  try {
    zodObjectSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) console.log(error.errors);
    else throw error;
  }
  const objectResult = await objectSchema._parse(data);
  console.log(objectResult.parsed);
  console.log(objectResult.errors);
};

main();
