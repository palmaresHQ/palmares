import { setDefaultAdapter, getSchemasWithDefaultAdapter, object, string } from '@palmares/schemas';
import { ZodSchemaAdapter } from '@palmares/zod-schema';
import * as z from 'zod';

setDefaultAdapter(new ZodSchemaAdapter());
const p = getSchemasWithDefaultAdapter<ZodSchemaAdapter>();

/*
const testSchema = p.object({
  test: p.object({
    isTest: p
      .boolean()
      .trueValues(['hey', 1])
      .toRepresentation(async () => {
        return 'alooou';
      }),
  }),
});*/

const main = async () => {
  // .data não valida, só parseia o dado (limpa ele)
  // .data é um bom nome?
  const testSchema = p.object({
    test1: p.object({
      isTest: p.boolean().trueValues(['hey', 1]),
      name: p.string().omit(),
    })
  });

  const value = await testSchema.data({
    test1: {
      isTest: 'hey',
      name: 'hey'
    },
  });

  console.log(value);

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
