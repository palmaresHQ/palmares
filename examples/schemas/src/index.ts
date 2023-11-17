import { setDefaultAdapter, NumberSchema, ObjectSchema } from '@palmares/schemas';
import { ZodSchemaAdapter } from '@palmares/zod-schema';

setDefaultAdapter(ZodSchemaAdapter);

const objectSchema = ObjectSchema.new({
  teste: ObjectSchema.new({
    age: NumberSchema.new().max(9),
    spent: NumberSchema.new().min(12),
  }),
});

//const schema = NumberSchema.new().max(10).min(5);

const main = async () => {
  const objectResult = await objectSchema._parse({ teste: { age: 10, spent: 4 } });
  console.log(objectResult.errors);
};

main();
