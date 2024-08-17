import * as p from '@palmares/schemas';
import { describe } from '@palmares/tests';

import type JestTestAdapter from '@palmares/jest-tests';

describe<JestTestAdapter>('Object Tests', ({ test }) => {
  test('optional', async ({ expect }) => {
    const objectSchema = p.object({
      name: p.string(),
      age: p.number()
    });
    const objectSchemaWithCustomMessage = p
      .object({
        name: p.string(),
        age: p.number()
      })
      .nonOptional({ message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        objectSchema.parse(undefined as any),
        objectSchemaWithCustomMessage.parse(undefined as any),
        objectSchema.parse({
          name: 'John',
          age: 30
        })
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('required');
    expect(errorsOnFail?.[0]?.message).toBe('Required');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed.age).toBe(30);
    expect(parsed.name).toBe('John');
  });

  test('nullable', async ({ expect }) => {
    const objectSchema = p.object({
      name: p.string(),
      age: p.number()
    });
    const objectSchemaWithCustomMessage = p
      .object({
        name: p.string(),
        age: p.number()
      })
      .nonNullable({ message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        objectSchema.parse(null as any),
        objectSchemaWithCustomMessage.parse(null as any),
        objectSchema.parse({
          name: 'John',
          age: 30
        })
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('null');
    expect(errorsOnFail?.[0]?.message).toBe('Cannot be null');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed.age).toBe(30);
    expect(parsed.name).toBe('John');
  });

  test('optional on key', async ({ expect }) => {
    const objectSchema = p.object({
      name: p.string(),
      age: p.number()
    });
    const objectSchemaWithCustomMessage = p.object({
      name: p.string(),
      age: p.number().nonOptional({ message: 'hello' })
    });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        objectSchema.parse({
          name: 'John'
        } as any),
        objectSchemaWithCustomMessage.parse({
          name: 'John'
        } as any),
        objectSchema.parse({
          name: 'John',
          age: 30
        })
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('required');
    expect(errorsOnFail?.[0]?.message).toBe('Required');
    expect(errorsOnFail?.[0]?.path?.[0]).toBe('age');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed.age).toBe(30);
    expect(parsed.name).toBe('John');
  });

  test('nullable on key', async ({ expect }) => {
    const objectSchema = p.object({
      name: p.string(),
      age: p.number()
    });
    const objectSchemaWithCustomMessage = p.object({
      name: p.string(),
      age: p.number().nonNullable({ message: 'hello' })
    });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        objectSchema.parse({
          name: 'John',
          age: null
        } as any),
        objectSchemaWithCustomMessage.parse({
          name: 'John',
          age: null
        } as any),
        objectSchema.parse({
          name: 'John',
          age: 30
        })
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('null');
    expect(errorsOnFail?.[0]?.message).toBe('Cannot be null');
    expect(errorsOnFail?.[0]?.path?.[0]).toBe('age');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed.age).toBe(30);
    expect(parsed.name).toBe('John');
  });

  test('max from string and number', async ({ expect }) => {
    const objectSchema = p.object({
      name: p.string().maxLength(10),
      age: p.number().max(10)
    });

    const [{ errors: errorsWhenString }, { errors: errorWhenNumber }] = await Promise.all([
      objectSchema.parse({
        name: 'John12345789123',
        age: 10
      } as any),
      objectSchema.parse({
        name: 'John',
        age: 12
      } as any)
    ]);

    expect(errorsWhenString?.[0]?.code).toBe('maxLength');
    expect(errorWhenNumber?.[0]?.code).toBe('max');
  });

  test('min from string and number', async ({ expect }) => {
    const objectSchema = p.object({
      name: p.string().minLength(10),
      age: p.number().min(10)
    });

    const [{ errors: errorsWhenString }, { errors: errorWhenNumber }] = await Promise.all([
      objectSchema.parse({
        name: 'John',
        age: 11
      } as any),
      objectSchema.parse({
        name: 'John123456789123',
        age: 9
      } as any)
    ]);

    expect(errorsWhenString?.[0]?.code).toBe('minLength');
    expect(errorWhenNumber?.[0]?.code).toBe('min');
  });

  test('nested issue', async ({ expect }) => {
    const objectSchema = p.object({
      nested: p.object({
        name: p.string(),
        age: p.number().max(10)
      }),
      value: p.number()
    });

    const { errors } = await objectSchema.parse({
      nested: {
        name: 'John',
        age: 12
      },
      value: 20
    });

    expect(errors?.[0]?.code).toBe('max');
    expect(errors?.[0]?.path?.[0]).toBe('nested');
    expect(errors?.[0]?.path?.[1]).toBe('age');
  });
});
