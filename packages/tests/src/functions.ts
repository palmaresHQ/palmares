import { getExpect } from './expect';
import { getTestAdapter } from './utils';

import type { TestAdapter } from './adapter';
import type { Expect } from './expect';

/**
 * Describe a test suite to run tests in
 *
 * @example
 * ```typescript
 * describe('Test suite', ({ test }) => {
 *   test('Test', async ({ expect }) => {
 *     expect(1).toBe(1);
 *   });
 * });
 * ```
 *
 * @param descriptionName The name of the test suite
 * @param callback The callback to run the tests, the callback will for convenience receive the
 * `test` function to run tests and the `custom` object that was passed to the test adapter
 */
export function describe<
  TTestAdapter extends TestAdapter & Palmares.PTestAdapter = TestAdapter & Palmares.PTestAdapter
>(
  descriptionName: string,
  callback: (args: {
    test: typeof test<TTestAdapter>;
    beforeEach: typeof beforeEach<TTestAdapter>;
    beforeAll: typeof beforeAll<TTestAdapter>;
    afterAll: typeof afterAll<TTestAdapter>;
    afterEach: typeof afterEach<TTestAdapter>;
  }) => void,
  customArgs?: Parameters<TTestAdapter['functions']['getDescribe']>[2]
) {
  const defaultTestAdapter = getTestAdapter();
  defaultTestAdapter.functions.getDescribe(
    descriptionName,
    () => {
      return callback({
        test,
        beforeEach,
        beforeAll,
        afterAll,
        afterEach
      });
    },
    customArgs
  );
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
export function test<TTestAdapter extends TestAdapter & Palmares.PTestAdapter = TestAdapter & Palmares.PTestAdapter>(
  testName: string,
  callback: (
    args: {
      expect: typeof expect;
    } & {
      custom: Awaited<ReturnType<NonNullable<TTestAdapter['getCustomProps']>>>;
    }
  ) => Promise<void> | void,
  customArgs?: Parameters<TTestAdapter['functions']['getTest']>[2]
) {
  const defaultTestAdapter = getTestAdapter();
  defaultTestAdapter.functions.getTest(
    testName,
    async () => {
      const custom = (await defaultTestAdapter.getCustomProps?.()) as any;
      await Promise.resolve(
        callback({
          expect,
          custom
        })
      );
    },
    customArgs
  );
}

/**
 * Run a function before each test.
 *
 * @example
 * ```typescript
 * beforeEach(({ custom }) => {
 *   db.init();
 * });
 * ```
 *
 * @param callback The callback to run before each test, the callback will for convenience receive the
 * `custom` object that was passed to the test adapter
 */
export function beforeEach<
  TTestAdapter extends TestAdapter & Palmares.PTestAdapter = TestAdapter & Palmares.PTestAdapter
>(
  callback: (args: {
    custom: Awaited<ReturnType<NonNullable<TTestAdapter['getCustomProps']>>>;
  }) => Promise<void> | void,
  customArgs?: Parameters<TTestAdapter['functions']['getBeforeEach']>[2]
) {
  const defaultTestAdapter = getTestAdapter();
  defaultTestAdapter.functions.getBeforeEach(
    async () =>
      await Promise.resolve(
        callback({
          custom: (await defaultTestAdapter.getCustomProps?.()) as any
        })
      ),
    customArgs
  );
}

/**
 * Run a function after each test.
 *
 * @example
 *  ```typescript
 * afterEach(({ custom }) => {
 *   db.flush();
 * });
 * ```
 *
 * @param callback - The callback to run after each test, the callback will for convenience receive the
 * `custom` object that was passed to the test adapter
 */
export function afterEach<
  TTestAdapter extends TestAdapter & Palmares.PTestAdapter = TestAdapter & Palmares.PTestAdapter
>(
  callback: (args: {
    custom: Awaited<ReturnType<NonNullable<TTestAdapter['getCustomProps']>>>;
  }) => Promise<void> | void,
  customArgs?: Parameters<TTestAdapter['functions']['getAfterEach']>[2]
) {
  const defaultTestAdapter = getTestAdapter();
  defaultTestAdapter.functions.getAfterEach(
    async () =>
      await Promise.resolve(
        callback({
          custom: (await defaultTestAdapter.getCustomProps?.()) as any
        })
      ),
    customArgs
  );
}

/**
 * Run a function before all tests.
 *
 * @example
 * ```typescript
 * beforeAll(({ custom }) => {
 *   db.seed();
 * });
 * ```
 *
 * @param callback - The callback to run before all tests, the callback will for convenience receive the
 * `custom` object that was passed to the test adapter
 */
export function beforeAll<
  TTestAdapter extends TestAdapter & Palmares.PTestAdapter = TestAdapter & Palmares.PTestAdapter
>(
  callback: (args: {
    custom: Awaited<ReturnType<NonNullable<TTestAdapter['getCustomProps']>>>;
  }) => Promise<void> | void,
  customArgs?: Parameters<TTestAdapter['functions']['getBeforeAll']>[2]
) {
  const defaultTestAdapter = getTestAdapter();
  defaultTestAdapter.functions.getBeforeAll(
    async () =>
      await Promise.resolve(
        callback({
          custom: (await defaultTestAdapter.getCustomProps?.()) as any
        })
      ),
    customArgs
  );
}

/**
 * Run a function after all tests.
 *
 * @example
 * ```typescript
 * afterAll(({ custom }) => {
 *   db.flush();
 * });
 * ```
 *
 * @param callback - The callback to run after all tests, the callback will for convenience receive the
 * `custom` object that was passed to the test adapter
 */
export function afterAll<
  TTestAdapter extends TestAdapter & Palmares.PTestAdapter = TestAdapter & Palmares.PTestAdapter
>(
  callback: (args: {
    custom: Awaited<ReturnType<NonNullable<TTestAdapter['getCustomProps']>>>;
  }) => Promise<void> | void,
  customArgs?: Parameters<TTestAdapter['functions']['getAfterAll']>[2]
) {
  const defaultTestAdapter = getTestAdapter();
  defaultTestAdapter.functions.getAfterAll(
    async () =>
      await Promise.resolve(
        callback({
          custom: (await defaultTestAdapter.getCustomProps?.()) as any
        })
      ),
    customArgs
  );
}
export function expect<
  TValue,
  TTestAdapter extends TestAdapter & Palmares.PTestAdapter = TestAdapter & Palmares.PTestAdapter
>(value: TValue): Expect<TValue, TTestAdapter, false> {
  const palmaresExpect = getExpect(value, getTestAdapter() as TTestAdapter);
  return palmaresExpect;
}
