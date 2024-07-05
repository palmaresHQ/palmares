import { TestAdapter, TestExpectAdapter } from "@palmares/tests";
import { run as runJest } from 'jest';

import JestTestFunctionsAdapter from "./functions";
import JestExpectAdapter from "./expect";

export default class JestTestAdapter extends TestAdapter {
  functions = new JestTestFunctionsAdapter();
  expect = new JestExpectAdapter();

  getCustomProps(): {
    expect: typeof import('@jest/globals')['expect'];
    describe: typeof import('@jest/globals')['describe'];
    beforeAll: typeof import('@jest/globals')['beforeAll'];
    beforeEach: typeof import('@jest/globals')['beforeEach'];
    afterEach: typeof import('@jest/globals')['afterEach'];
    afterAll: typeof import('@jest/globals')['afterAll'];
    jest: typeof import('@jest/globals')['jest'];
  } {
    const { expect, describe, jest, beforeAll, beforeEach, afterAll, afterEach } = require('@jest/globals');

    return {
      expect,
      describe,
      beforeAll,
      beforeEach,
      afterAll,
      afterEach,
      jest,
    }
  }

  async run(
    filesToRun: string[],
    globalSetupFunctionBody: string,
    std: {
    join: (...args: string[]) => Promise<string>,
    writeFile: (path: string | string[], content: string) => Promise<void>;
    removeFile: (path: string | string[]) => Promise<void>;
  }) {
    const whereToCreateJestConfig = await std.join(__dirname, 'jest.config.js')
    const whereToCreateGlobalSetup = await std.join(__dirname, 'setup-jest.js')
    await std.writeFile(whereToCreateGlobalSetup, globalSetupFunctionBody);
    await std.writeFile(whereToCreateJestConfig,
      'module.exports = {\n' +
      '  preset: "ts-jest",\n' +
      '  testEnvironment: "node",\n' +
      '  rootDir: process.cwd(),\n' +
      `  testRegex: [${filesToRun.map((fileToRun) => `'${fileToRun}'`).join(', ')}],\n` +
      `  setupFiles: ['${whereToCreateGlobalSetup}'],\n` +
      '};'
    )
    await runJest(['--config', whereToCreateJestConfig]);
    await Promise.all([std.removeFile(whereToCreateJestConfig), std.removeFile(whereToCreateGlobalSetup)])
  }
}
