import { TestAdapter } from "@palmares/tests";
import { run as runJest } from 'jest';

import JestTestFunctionsAdapter from "./functions";
import JestExpectAdapter from "./expect";

let defaultConfig: import('jest').Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: process.cwd(),
};

let cliOptions: string[] = [];

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
      mkdir: (path: string | string[]) => Promise<void>,
      join: (...args: string[]) => Promise<string>,
      writeFile: (path: string | string[], content: string) => Promise<void>;
      removeFile: (path: string | string[]) => Promise<void>;
  }) {
    const [_, __, whereToCreateJestConfig,whereToCreateGlobalSetup] = await Promise.all([
      std.mkdir(await std.join(__dirname, '.jest')),
      std.mkdir(await std.join(__dirname, '.jest')),
      std.join(__dirname,'.jest', 'jest.config.js'),
      std.join(__dirname, '.jest', 'setup-jest.js')
    ])
    await std.writeFile(whereToCreateGlobalSetup, globalSetupFunctionBody);
    defaultConfig.testRegex = filesToRun.concat(defaultConfig.testRegex || []);
    defaultConfig.setupFiles = [whereToCreateGlobalSetup].concat(defaultConfig.setupFiles || []);
    const defaultConfigAsString = JSON.stringify(defaultConfig, null, 2);
    await std.writeFile(whereToCreateJestConfig,
      `module.exports = ${defaultConfigAsString};`
    )
    await runJest(['--config', whereToCreateJestConfig].concat(cliOptions));
    await Promise.all([std.removeFile(whereToCreateJestConfig), std.removeFile(whereToCreateGlobalSetup)])
  }

  static new(args?: {
    config?: import('jest').Config,
    cliOptions?: [
      '--watch',
      '--watchAll',
      '-o',
      '-t',
      ['--collect-coverage', string],
      '--colors',
      '--coverage',
      ['--coverage', boolean],
      ['--coverageDirectory', string],
      ['--coverageProvider', 'babel' | 'v8'],
      '--debug',
      ['--filter', string],
      '--lastCommit',
      '--onlyChanged',
      '--listTests',
      ['--maxWorkers', number | string],
      '--noStackTrace',
    ][number][]
  }) {
    if (args?.config) {
      defaultConfig = {
        ...defaultConfig,
        ...args.config,
      }
    }
    if (args?.cliOptions) {
      cliOptions = args.cliOptions.map((option) => {
        if (Array.isArray(option)) return option.join('=');
        return option;
      });
    }

    return this;
  }
}
