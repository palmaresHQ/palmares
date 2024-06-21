
import { setDefaultAdapter, getSchemasWithDefaultAdapter, object, string, schema } from '@palmares/schemas';
import { ZodSchemaAdapter } from '@palmares/zod-schema';

setDefaultAdapter(new ZodSchemaAdapter());
const p = getSchemasWithDefaultAdapter<ZodSchemaAdapter>();

const main = async () => {

  const testSchema = p.object({
    test1: p.object({
      isTest: p.boolean().trueValues(['hey', 1]),
      name: p.string().omit(),
      password: p.string(),
    })
  });


  const value = await testSchema.data({
    test1: {
      isTest: 'hey',
      name: 'Bruno',
      password: '123456',
    }
  })

  console.log(value.test1.name);
}
  /*const value = await testSchema.data({
    test: {
      isTest: 'hey',
    },
  });
  console.log(value.test.isTest);*/
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
  /*.compile({
      testSchema: objectSchema,
    });*/
};

main();
