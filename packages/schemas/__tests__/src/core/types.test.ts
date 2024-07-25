import * as p from '@palmares/schemas';
import { describe } from '@palmares/tests';

import type JestTestAdapter from '@palmares/jest-tests';

describe<JestTestAdapter>('Schema Types', ({ test }) => {
  test('number schema', async ({ expect }) => {
    const numberSchema = p.number();

    const { errors } = await numberSchema.parse('value' as any);

    expect((errors?.length || 0) > 0).toBe(true);
  });

  test('boolean schema', async ({ expect }) => {
    const booleanSchema = p.boolean();

    const { errors } = await booleanSchema.parse('value' as any);

    expect((errors?.length || 0) > 0).toBe(true);
  });

  test('string schema', async ({ expect }) => {
    const stringSchema = p.string();

    const { errors } = await stringSchema.parse(2 as any);

    expect((errors?.length || 0) > 0).toBe(true);
  });

  test('array schema', async ({ expect }) => {
    const arraySchema = p.array(p.number());

    const { errors } = await arraySchema.parse('value' as any);

    expect((errors?.length || 0) > 0).toBe(true);
  });

  test('object schema', async ({ expect }) => {
    const objectSchema = p.object({
      number: p.number(),
      string: p.string()
    });

    const { errors } = await objectSchema.parse('value' as any);

    expect((errors?.length || 0) > 0).toBe(true);
  });
});
