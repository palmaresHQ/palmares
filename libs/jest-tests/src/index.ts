/* eslint-disable ts/consistent-type-imports */
import { std as palmaresStd } from '@palmares/core';
import { TestAdapter } from '@palmares/tests';

import { JestExpectAdapter } from './expect';
import { JestTestFunctionsAdapter } from './functions';
import { CustomData } from './types';

let defaultConfig: import('jest').Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: process.cwd()
};

let cliOptions: string[] = [];

class JestTestAdapter extends TestAdapter {
  functions = new JestTestFunctionsAdapter();
  expect = new JestExpectAdapter();

  static setGlobals(globals: any) {
    Object.assign(global, globals);
  }

  async getCustomProps(): Promise<CustomData> {
    try {
      const { expect, describe, jest, beforeAll, beforeEach, afterAll, afterEach, test } = require('@jest/globals');
      return {
        expect,
        describe,
        beforeAll,
        beforeEach,
        afterAll,
        afterEach,
        test,
        jest
      };
    } catch (e) {
      const { expect, describe, jest, beforeAll, beforeEach, afterAll, afterEach, test } = await import(
        '@jest/globals'
      );
      return {
        test,
        expect,
        describe,
        beforeAll,
        beforeEach,
        afterAll,
        afterEach,
        jest
      };
    }
  }

  async run(filesToRun: string[], globalSetupFunctionBody: string, std: (typeof palmaresStd)['files']) {
    let dirnameToCreate: undefined | string = '';
    try {
      dirnameToCreate = __dirname;
    } catch (e) {
      try {
        // @ts-ignore because i don't care
        dirnameToCreate = import.meta.dirname;
        // eslint-disable-next-line ts/no-unnecessary-condition
        if (dirnameToCreate === undefined) {
          // @ts-ignore because i don't care
          const __filename = std.getFileURLToPath(import.meta.url);
          dirnameToCreate = std.dirname(__filename);
        }
      } catch (e) {
        try {
          // @ts-ignore because i don't care
          dirnameToCreate = import.meta.url;
          dirnameToCreate = dirnameToCreate.replace('file://', '');
        } catch (e) {
          throw new Error('Could not get dirname');
        }
      }
    }

    let jest;
    try {
      jest = require('jest');
    } catch (e) {
      jest = await import('jest');
    }
    const [_, __, whereToCreateJestConfig, whereToCreateGlobalSetup] = await Promise.all([
      std.makeDirectory(await std.join(dirnameToCreate, '.jest')),
      std.makeDirectory(await std.join(dirnameToCreate, '.jest')),
      std.join(dirnameToCreate, '.jest', 'jest.config.js'),
      std.join(dirnameToCreate, '.jest', 'setup-jest.js')
    ]);

    await std.writeFile(whereToCreateGlobalSetup, globalSetupFunctionBody);
    defaultConfig.testRegex = filesToRun.concat(defaultConfig.testRegex || []);
    defaultConfig.setupFiles = [whereToCreateGlobalSetup].concat(defaultConfig.setupFiles || []);
    const defaultConfigAsString = JSON.stringify(defaultConfig, null, 2);
    await std.writeFile(whereToCreateJestConfig, `module.exports = ${defaultConfigAsString};`);
    await jest.run(['--config', whereToCreateJestConfig].concat(cliOptions));
    await Promise.all([std.removeFile(whereToCreateJestConfig), std.removeFile(whereToCreateGlobalSetup)]);
  }

  static new(args?: {
    config?: import('jest').Config;
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
      '--noStackTrace'
    ][number][];
  }) {
    if (args?.config) {
      defaultConfig = {
        ...defaultConfig,
        ...args.config
      };
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

export { JestTestAdapter };
export { JestTestAdapter as default };
