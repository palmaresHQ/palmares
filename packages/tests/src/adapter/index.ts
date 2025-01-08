import { TestExpectAdapter } from './expect';
import { TestFunctionsAdapter } from './functions';

export class TestAdapter {
  functions = new TestFunctionsAdapter();
  expect = new TestExpectAdapter();

  // eslint-disable-next-line ts/require-await
  async getCustomProps?(): Promise<object>;

  /** Should return  */
  // eslint-disable-next-line ts/require-await
  async run(
    _filesToRun: string[],
    _globalSetupFunctionBody: string,
    _std: {
      join: (...args: string[]) => Promise<string>;
      writeFile: (path: string | string[], content: string) => Promise<void>;
      removeFile: (path: string | string[]) => Promise<void>;
      mkdir: (path: string | string[]) => Promise<void>;
    }
  ): Promise<void> {
    throw new Error('Not implemented');
  }
}
