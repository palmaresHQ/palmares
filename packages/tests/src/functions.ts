import TestAdapter from './adapter';
import getExpect, { Expect } from './expect';
import { getTestAdapter } from './utils';

/**
 * Describe a test suite to run tests in
 *
 * @example
 * ```typescript
 * describe('Test suite', ({ test }) => {
 *   test('Test', async ({ expect }) => {
 *    expect(1).toBe(1);
 *   });
 * });
 * ```
 *
 * @param descriptionName The name of the test suite
 * @param callback The callback to run the tests, the callback will for convenience receive the
 * `test` function to run tests and the `custom` object that was passed to the test adapter
 */
export function describe<TTestAdapter extends TestAdapter = TestAdapter>(descriptionName: string, callback: (args: {
  test: typeof test<TTestAdapter>
} & {
  custom: ReturnType<TTestAdapter['getCustomProps']>
}) => void) {
  const defaultTestAdapter = getTestAdapter();
  defaultTestAdapter.functions.getDescribe(descriptionName, () => {
    callback({ test: test, custom: defaultTestAdapter.getCustomProps() as any })
  });
}

/**
 * Run a test it can be either called inside a `describe` or on its own
 *
 * @example
 * ```typescript
 * test('Test', async ({ expect }) => {
 *  expect(1).toBe(1);
 * });
 * ```
 *
 * @param testName The name of the test
 * @param callback The callback to run the test, the callback will for convenience receive the
 * `expect` function to run assertions and the `custom` object that was passed to the test adapter
 */
export function test<TTestAdapter extends TestAdapter = TestAdapter>(testName: string, callback: (args: {
  expect: typeof expect
} & {
  custom: ReturnType<TTestAdapter['getCustomProps']>
}) => Promise<void>) {
  const defaultTestAdapter = getTestAdapter();

  defaultTestAdapter.functions.getTest(testName,
    () => callback({
    expect: expect,
    custom: defaultTestAdapter.getCustomProps() as any
  }));
}

export function expect<TValue>(value: TValue): Expect<TValue, false> {
  return getExpect<TValue>(value, getTestAdapter());
}
