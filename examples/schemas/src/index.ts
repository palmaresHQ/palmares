import { setDefaultAdapter, NumberSchema, ObjectSchema } from '@palmares/schemas';
import { ZodSchemaAdapter } from '@palmares/zod-schema';

setDefaultAdapter(ZodSchemaAdapter);

const objectSchema = ObjectSchema.new({
  numero: NumberSchema.new().max(10),
});

const schema = NumberSchema.new().max(10).min(5);

const main = async () => {
  const result = await schema._parse(9);
  console.log(result);

  const objectResult = await objectSchema._parse({ numero: 20 });
  console.log(objectResult);
};

main();
