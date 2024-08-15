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
    const datetimeSchema = p.datetime();
    const datetimeSchemaWithCustomMessage = p.datetime().nonNullable({ message: 'hello' });
    const now = new Date();

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        datetimeSchema.parse(null as any),
        datetimeSchemaWithCustomMessage.parse(null as any),
        datetimeSchema.parse(now)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('null');
    expect(errorsOnFail?.[0]?.message).toBe('Cannot be null');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed.toISOString()).toBe(now.toISOString());
  });
});
