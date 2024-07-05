import { TestFunctionsAdapter } from "@palmares/tests";

export default class JestTestFunctionsAdapter extends TestFunctionsAdapter {
  getDescribe(descriptionName: string, callback: () => void): void {
    const describe = require('@jest/globals').describe;
    describe(descriptionName, () => {
      callback();
    })
  }

  getTest(testName: string, callback: () => Promise<void>): void {
    const test = require('@jest/globals').test;
    test(testName, async () => {
      await callback();
    })
  }
}
