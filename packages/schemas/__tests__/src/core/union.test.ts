import * as p from '@palmares/schemas';
import { getDefaultAdapter } from '@palmares/schemas';
import { describe } from '@palmares/tests';

import type JestTestAdapter from '@palmares/jest-tests';

describe<JestTestAdapter>('Union Tests', ({ test }) => {
  test('optional', async ({ expect }) => {
    const unionSchema = p.union([p.number(), p.string()]);
    const unionSchemaWithCustomMessage = p.union([p.number(), p.string()]).nonOptional({ message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        unionSchema.parse(undefined as any),
        unionSchemaWithCustomMessage.parse(undefined as any),
        unionSchema.parse(1)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('required');
    expect(errorsOnFail?.[0]?.message).toBe('Required');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe(1);
  });

  test('nullable', async ({ expect }) => {
    const unionSchema = p.union([p.number(), p.string()]);
    const unionSchemaWithCustomMessage = p.union([p.number(), p.string()]).nonNullable({ message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        unionSchema.parse(null as any),
        unionSchemaWithCustomMessage.parse(null as any),
        unionSchema.parse('teste')
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('null');
    expect(errorsOnFail?.[0]?.message).toBe('Cannot be null');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe('teste');
  });

  test('in case of failure use the other', async ({ expect }) => {
    const unionSchema = p.union([p.number().max(20), p.number().min(12)]);

    const { errors, parsed } = await unionSchema.parse(25);
    expect((errors || []).length).toBe(0);
    expect(parsed).toBe(25);
  });

  test('in case of failure, show first', async ({ expect }) => {
    const unionSchema = p.union([p.number().min(25), p.number().max(20)]);

    const { errors } = await unionSchema.parse(23);
    expect((errors || []).length > 0).toBe(true);
  });

  test('works when not defined on adapter', async ({ expect }) => {
    const adapter = getDefaultAdapter();
    const existingUnion = adapter.union;
    adapter.union = undefined;
    const unionSchema = p.union([p.number().min(25), p.number().max(20)]);
    const { errors } = await unionSchema.parse(23);
    expect((errors || []).length > 0).toBe(true);

    adapter.union = existingUnion;
  });

  test('nested in case of failure use the other', async ({ expect }) => {
    const unionSchema = p.object({
      test: p.union([p.number().max(20), p.number().min(12)] as const)
    });

    const { errors, parsed } = await unionSchema.parse({
      test: 23
    });
    expect((errors || []).length).toBe(0);
    expect(parsed.test).toBe(23);
  });

  test('nested in case of failure, show first', async ({ expect }) => {
    const unionSchema = p.object({ test: p.union([p.number().min(25), p.number().max(20)]) });

    const { errors } = await unionSchema.parse({ test: 23 });
    expect((errors || []).length > 0).toBe(true);
  });

  test('nested works when not defined on adapter', async ({ expect }) => {
    const adapter = getDefaultAdapter();
    const existingUnion = adapter.union;
    adapter.union = undefined;
    const unionSchema = p.object({ test: p.union([p.number().min(25), p.number().max(20)]) });
    const { parsed, errors } = await unionSchema.parse({ test: 23 });
    expect((errors || []).length > 0).toBe(true);

    adapter.union = existingUnion;
  });
});
