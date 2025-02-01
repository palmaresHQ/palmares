import { TestExpectAdapter } from './expect';
import { TestFunctionsAdapter } from './functions';

import type { std } from '@palmares/core';

export class TestAdapter {
  functions = new TestFunctionsAdapter();
  expect = new TestExpectAdapter();

  // eslint-disable-next-line ts/require-await
  async getCustomProps?(): Promise<object>;

  /** Should return  */
  // eslint-disable-next-line ts/require-await
  async run(_filesToRun: string[], _globalSetupFunctionBody: string, _std: (typeof std)['files']): Promise<void> {
    throw new Error('Not implemented');
  }
}
