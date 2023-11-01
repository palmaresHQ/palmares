import { setDefaultAdapter, NumberSchema } from '@palmares/schemas';
import { ZodSchemaAdapter } from '@palmares/zod-schema';

setDefaultAdapter(ZodSchemaAdapter);

const schema = NumberSchema.new().max(10).min(5);

const main = async () => {
  const result = await schema._parse(30);
  console.log(result);
};

main();
