import { setDefaultAdapter, NumberSchema, ObjectSchema } from '@palmares/schemas';
import { ZodSchemaAdapter } from '@palmares/zod-schema';

setDefaultAdapter(ZodSchemaAdapter);

const objectSchema = ObjectSchema.new({
  numero: NumberSchema.new(),
});

const schema = NumberSchema.new().max(10).min(5);

const main = async () => {
  const result = await schema._parse(9);
  console.log(result);

  console.log(objectSchema);
};

main();
