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
    spent: NumberSchema.new().min(12),
  }),
});

//const schema = NumberSchema.new().max(10).min(5);

const main = async () => {
  try {
    zodObjectSchema.parse({ teste: { age: 10, spent: 4 } });
  } catch (error) {
    if (error instanceof z.ZodError) console.log(error.errors);
    else throw error;
  }
  const objectResult = await objectSchema._parse({ teste: { age: 10, spent: 4 } });
  console.log(objectResult.errors);
};

main();
