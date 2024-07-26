import * as p from '@palmares/schemas';
import { describe } from '@palmares/tests';

import type JestTestAdapter from '@palmares/jest-tests';

describe<JestTestAdapter>('Number Tests', ({ test }) => {
  test('number schema', async ({ expect }) => {
    const numberSchema = p.number();

    const { errors } = await numberSchema.parse('value' as any);

    expect((errors?.length || 0) > 0).toBe(true);
  });
});
