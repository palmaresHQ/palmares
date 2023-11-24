import { setDefaultAdapter, NumberSchema, ObjectSchema } from '@palmares/schemas';
import { ZodSchemaAdapter } from '@palmares/zod-schema';

setDefaultAdapter(ZodSchemaAdapter);

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

const main = async () => {
  const objectResult = await objectSchema._parse({ teste: { age: 8, spent: '12' } });
  console.log(objectResult.errors);
};

main();
