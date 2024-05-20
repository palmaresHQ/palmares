import {
  setDefaultAdapter,
  NumberSchema,
  ObjectSchema,
  getSchemasWithDefaultAdapter,
  UnionSchema,
} from '@palmares/schemas';
import { ZodSchemaAdapter } from '@palmares/zod-schema';
import * as z from 'zod';

setDefaultAdapter(ZodSchemaAdapter);

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

const objectSchema = ObjectSchema.new({
  teste: UnionSchema.new([
    ObjectSchema.new({
      age: NumberSchema.new(),
      spent: NumberSchema.new()
        .min(12, { inclusive: true })
        .positive()
        .toValidate((value) => {
          console.log('toValidate', value);
          return Number(value);
        })
        .toInternal(async (value) => {
          console.log('toInternal', value);
          return {
            teste: value,
          };
        })
        .toRepresentation(async (value) => {
          console.log('without validation, changing how the data is sent to the user', value, typeof value);
          return 'Aquiiii';
        }),
    }),
    NumberSchema.new(),
  ]),
});

const main = async () => {
  const [testeResult, teste2Result] = [
    await objectSchema.parse({
      teste: 10,
    }),
    undefined,
  ];
  console.log('______//_______');
  console.log(testeResult.errors);
  console.log(testeResult.parsed);
  //console.log(teste2Result.errors);
  //console.log(teste2Result.parsed);
};

main();
