import { describe } from '@palmares/tests'

describe('test', ({ test }) => {
  test('test if this works', async ({ expect }) => {
    expect('Hello').toBe('Hello')
  });

  test('test if this works2', async ({ expect }) => {
    expect(1).toBe(1);
  });
});
  