import {
  setDefaultAdapter,
  NumberSchema,
  ObjectSchema,
  getSchemasWithDefaultAdapter,
  UnionSchema,
  StringSchema,
  compile,
} from '@palmares/schemas';
import { ZodSchemaAdapter } from '@palmares/zod-schema';

setDefaultAdapter(new ZodSchemaAdapter());

const testSchema = ObjectSchema.new({
  name: StringSchema.new().minLength(3).maxLength(10, {
    inclusive: true,
  }),
  age: NumberSchema.new(),
  email: StringSchema.new().includes('@'),
  cameFrom: StringSchema.new().is(['Brazil', 'Botsuana']),
});

const main = async () => {
  const value = await testSchema.parse({
  });



    /*const [testeResult, teste2Result, teste3Result, teste4Result] = await Promise.all([
    objectSchema.parse({
      teste: 10,
    }),
    objectSchema.parse({
      teste: 'heyyy',
    }),
    objectSchema.parse({
      teste: {
        age: 10,
      },
    }),
    objectSchema.parse({
      teste: {
        age: 'hey',
      },
    }),
  ]);*/
    /*
  const teste4Result = await objectSchema.parse({
    teste: {
      age: 10,
    },
  });*/

    /*
  console.log('______//_______');
  console.log(testeResult.errors);
  console.log(testeResult.parsed);

  console.log('______//_______');
  console.log(teste2Result.errors);
  console.log(teste2Result.parsed);

  console.log('______//_______');
  console.log(teste3Result.errors);
  console.log(teste3Result.parsed);
  */

    /*
  console.log('______//_______');
  console.log(teste4Result.errors);
  console.log(teste4Result.parsed);
  */

    .compile({
      testSchema: objectSchema,
    });
};

main();
