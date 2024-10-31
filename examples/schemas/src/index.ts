
import { setDefaultAdapter, getSchemasWithDefaultAdapter, object, string, schema } from '@palmares/schemas';
import { ZodSchemaAdapter, z } from '@palmares/zod-schema';


setDefaultAdapter(new ZodSchemaAdapter());
const p = getSchemasWithDefaultAdapter<ZodSchemaAdapter>();

const userSchema = p.object({
  name: p.string(),
  age: p.number(),
  email: p.string().email(),
  password: p.string().minLength(6),
  company: p.object({
    id: p.number(),
    name: p.string(),
  }),
})

const main = async () => {
  const testSchema = p.object({
    companyId: p.number().toRepresentation(async (value) => {
      const company = await prisma.company.findOne({ where: { id: value } });
      return company as unknown as {
        id: string;
        name: string;
      }
    }),
    name: p.string().omit(),
    password: p.string()
  }).toRepresentation(async (value) => {
    return {
      ...value,
      company: value.companyId
    } as Omit<typeof value, 'companyId'> & { company: Pick<typeof value, 'companyId'>['companyId'] }
  }).onSave(async (value) => {
    return value;
  });

  const resultOfValidation = await testSchema.validate({
    companyId: 1,
    name: 'Bruno',
    password: '123456',
  });

  if (resultOfValidation.isValid) {
    return Response.json(resultOfValidation.save())
  }

  resultOfValidation.


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
