export function testFunctionsAdapter<
  TDescribe extends TestFunctionsAdapter['getDescribe'],
  TTest extends TestFunctionsAdapter['getTest'],
  TBeforeEach extends TestFunctionsAdapter['getBeforeEach'],
  TAfterEach extends TestFunctionsAdapter['getAfterEach'],
  TBeforeAll extends TestFunctionsAdapter['getBeforeAll'],
  TAfterAll extends TestFunctionsAdapter['getAfterAll']
>(args: {
  /**
   * Should run a callback inside a describe function from your test framework.
   *
   * @example
   * ```typescript
   * import { testFunctionsAdapter } from '@palmares/tests';
   *
   * export default testFunctionsAdapter({
   *   getDescribe(descriptionName: string, callback: () => void): void {
   *     const describe = require('@jest/globals').describe;
   *     describe(descriptionName, () => {
   *       callback();
   *     });
   *   }
   * })
   * ```
   *
   * @param descriptionName - The name of the description
   * @param callback - The callback that should be called inside the describe function
   */
  getDescribe: TDescribe;

  /**
   * Should run a async callback function inside a `test` or `it` function from your test framework.
   *
   * @example
   * ```typescript
   * import { testFunctionsAdapter } from '@palmares/tests';
   *
   * export default testFunctionsAdapter({
   *   getTest(descriptionName: string, callback: () => Promise<void>): void {
   *     const test = require('@jest/globals').test;
   *     test(descriptionName, async () => {
   *       await callback();
   *     });
   *   }
   * })
   * ```
   *
   * @param testName - The name of the test
   * @param callback - The callback that should be called inside the test function
   */
  getTest: TTest;

  /**
   * Should run a callback inside a beforeEach function from your test framework.
   *
   * @example
   * ```typescript
   * import { testFunctionsAdapter } from '@palmares/tests';
   *
   * export default testFunctionsAdapter({
   *   getBeforeEach(callback: () => Promise<void>): void {
   *     const beforeEach = require('@jest/globals').beforeEach;
   *     beforeEach(async () => {
   *       await callback();
   *     });
   *   }
   * })
   * ```
   *
   * @param callback - The callback that should be called inside the beforeEach function
   */
  getBeforeEach: TBeforeEach;

  /**
   * Should run a callback inside a afterEach function from your test framework.
   *
   * @example
   * ```typescript
   * import { testFunctionsAdapter } from '@palmares/tests';
   *
   * export default testFunctionsAdapter({
   *   getAfterEach(callback: () => Promise<void>): void {
   *     const afterEach = require('@jest/globals').afterEach;
   *     afterEach(async () => {
   *       await callback();
   *     });
   *   }
   * })
   * ```
   *
   * @param callback - The callback that should be called inside the beforeEach function
   */
  getAfterEach: TAfterEach;

  /**
   * Should run a callback inside a beforeAll function from your test framework.
   *
   * @example
   * ```typescript
   * import { testFunctionsAdapter } from '@palmares/tests';
   *
   * export default testFunctionsAdapter({
   *   getBeforeAll(callback: () => Promise<void>): void {
   *     const beforeAll = require('@jest/globals').beforeAll;
   *     beforeAll(async () => {
   *       await callback();
   *     });
   *   }
   * })
   * ```
   *
   * @param callback - The callback that should be called inside the beforeEach function
   */
  getBeforeAll: TBeforeAll;

  /**
   * Should run a callback inside an afterAll function from your test framework.
   *
   * @example
   * ```typescript
   * import { testFunctionsAdapter } from '@palmares/tests';
   *
   * export default testFunctionsAdapter({
   *   getAfterAll(callback: () => Promise<void>): void {
   *     const afterAll = require('@jest/globals').afterAll;
   *     afterAll(async () => {
   *       await callback();
   *     });
   *   }
   * })
   * ```
   *
   * @param callback - The callback that should be called inside the beforeEach function
   */
  getAfterAll: TAfterAll;
}): typeof TestFunctionsAdapter & {
  new (): TestFunctionsAdapter & {
    getDescribe: TDescribe;
    getTest: TTest;
    getBeforeEach: TBeforeEach;
    getAfterEach: TAfterEach;
    getBeforeAll: TBeforeAll;
    getAfterAll: TAfterAll;
  };
} {
  class CustomTestFunctionsAdapter extends TestFunctionsAdapter {
    constructor() {
      super();
      this.getAfterAll = args.getAfterAll.bind(this) as TAfterAll;
      this.getAfterEach = args.getAfterEach.bind(this) as TAfterEach;
      this.getBeforeAll = args.getBeforeAll.bind(this) as TBeforeAll;
      this.getBeforeEach = args.getBeforeEach.bind(this) as TBeforeEach;
      this.getDescribe = args.getDescribe.bind(this) as TDescribe;
      this.getTest = args.getTest.bind(this) as TTest;
    }
    getDescribe = args.getDescribe;
    getTest = args.getTest;
    getBeforeEach = args.getBeforeEach;
    getAfterEach = args.getAfterEach;
    getBeforeAll = args.getBeforeAll;
    getAfterAll = args.getAfterAll;
  }

  return CustomTestFunctionsAdapter;
}

export default class TestFunctionsAdapter {
  /**
   * Should run a callback inside a describe function from your test framework.
   *
   * @example
   * ```typescript
   * import { TestFunctionsAdapter } from '@palmares/tests';
   *
   * export default class JestTestFunctionsAdapter extends TestFunctionsAdapter {
   *   getDescribe(descriptionName: string, callback: () => void): void {
   *     const describe = require('@jest/globals').describe;
   *     describe(descriptionName, () => {
   *       callback();
   *     });
   *   }
   * }
   * ```
   *
   * @param descriptionName - The name of the description
   * @param callback - The callback that should be called inside the describe function
   */
  getDescribe(_descriptionName: string, _callback: () => void): void {
    throw new Error('Not implemented');
  }

  /**
   * Should run a async callback function inside a `test` or `it` function from your test framework.
   *
   * @example
   * ```typescript
   * import { TestFunctionsAdapter } from '@palmares/tests';
   *
   * export default class JestTestFunctionsAdapter extends TestFunctionsAdapter {
   *   getTest(descriptionName: string, callback: () => Promise<void>): void {
   *     const test = require('@jest/globals').test;
   *     test(descriptionName, async () => {
   *       await callback();
   *     });
   *   }
   * }
   * ```
   *
   * @param testName - The name of the test
   * @param callback - The callback that should be called inside the test function
   */
  getTest(_testName: string, _callback: () => Promise<void>): void {
    throw new Error('Not implemented');
  }

  /**
   * Should run a callback inside a beforeEach function from your test framework.
   *
   * @example
   * ```typescript
   * import { TestFunctionsAdapter } from '@palmares/tests';
   *
   * export default class JestTestFunctionsAdapter extends TestFunctionsAdapter {
   *   getBeforeEach(callback: () => Promise<void>): void {
   *     const beforeEach = require('@jest/globals').beforeEach;
   *     beforeEach(async () => {
   *       await callback();
   *     });
   *   }
   * }
   * ```
   *
   * @param callback - The callback that should be called inside the beforeEach function
   */
  getBeforeEach(_callback: () => Promise<void>): void {
    throw new Error('Not implemented');
  }

  /**
   * Should run a callback inside a afterEach function from your test framework.
   *
   * @example
   * ```typescript
   * import { TestFunctionsAdapter } from '@palmares/tests';
   *
   * export default class JestTestFunctionsAdapter extends TestFunctionsAdapter {
   *   getAfterEach(callback: () => Promise<void>): void {
   *     const afterEach = require('@jest/globals').afterEach;
   *     afterEach(async () => {
   *       await callback();
   *     });
   *   }
   * }
   * ```
   *
   * @param callback - The callback that should be called inside the beforeEach function
   */
  getAfterEach(_callback: () => Promise<void>): void {
    throw new Error('Not implemented');
  }

  /**
   * Should run a callback inside a beforeAll function from your test framework.
   *
   * @example
   * ```typescript
   * import { TestFunctionsAdapter } from '@palmares/tests';
   *
   * export default class JestTestFunctionsAdapter extends TestFunctionsAdapter {
   *   getBeforeAll(callback: () => Promise<void>): void {
   *     const beforeAll = require('@jest/globals').beforeAll;
   *     beforeAll(async () => {
   *       await callback();
   *     });
   *   }
   * }
   * ```
   *
   * @param callback - The callback that should be called inside the beforeEach function
   */
  getBeforeAll(_callback: () => Promise<void>): void {
    throw new Error('Not implemented');
  }

  /**
   * Should run a callback inside an afterAll function from your test framework.
   *
   * @example
   * ```typescript
   * import { TestFunctionsAdapter } from '@palmares/tests';
   *
   * export default class JestTestFunctionsAdapter extends TestFunctionsAdapter {
   *   getAfterAll(callback: () => Promise<void>): void {
   *     const afterAll = require('@jest/globals').afterAll;
   *     afterAll(async () => {
   *       await callback();
   *     });
   *   }
   * }
   * ```
   *
   * @param callback - The callback that should be called inside the beforeEach function
   */
  getAfterAll(_callback: () => Promise<void>): void {
    throw new Error('Not implemented');
  }
}
