import { setDefaultAdapter, getSchemasWithDefaultAdapter } from '@palmares/schemas';
import { ZodSchemaAdapter } from '@palmares/zod-schema';
import * as z from 'zod';

setDefaultAdapter(new ZodSchemaAdapter());
const p = getSchemasWithDefaultAdapter<ZodSchemaAdapter>();

const testSchema = p.array(p.string().is(['Brazil', 'Botsuana']), p.number());

const main = async () => {
  const value = await testSchema.parse(['Brazil', 10]);
  console.log(value);
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
