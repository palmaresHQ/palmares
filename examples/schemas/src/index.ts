import {
  setDefaultAdapter,
  NumberSchema,
  ObjectSchema,
  getSchemasWithDefaultAdapter,
  UnionSchema,
  compile,
} from '@palmares/schemas';
import { ZodSchemaAdapter } from '@palmares/zod-schema';
import * as z from 'zod';
setDefaultAdapter(new ZodSchemaAdapter());

/*
const testeObjectSchema = ObjectSchema.new({
  age: NumberSchema.new(),
  spent: NumberSchema.new()
    .min(12, { inclusive: true })
    .positive()
    .toValidate((value) => {
      return Number(value);
    })
    .toInternal(async (value) => {
      return {
        teste: value,
      };
    })
    .toRepresentation(async (value) => {
      console.log('without validation, changing how the data is sent to the user', value, typeof value);
      return 'Aquiiii';
    }),
});
*/
const objectSchema = ObjectSchema.new({
  teste: UnionSchema.new([
    NumberSchema.new().toInternal(async () => 'aqui'),
    ObjectSchema.new({
      age: NumberSchema.new().toInternal(async (value) => 'hey'),
    }),
  ]),
});

/*
const object2Schema = ObjectSchema.new({
  hey: UnionSchema.new([
    ObjectSchema.new({
      name: NumberSchema.new(),
    }),
    NumberSchema.new(),
  ]),
});
*/
const main = async () => {
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

  compile({
    testSchema: objectSchema,
  });
};

main();
