import {
  describe,
  getTestAdapter,
  TestFunctionsAdapter,
  TestExpectAdapter,
  run,
  setTestAdapter,
  testCommand,
} from '@palmares/tests'
import { getDefaultStd, getSettings, initializeDomains, setSettings } from '@palmares/core';
import JestTestAdapter from '@palmares/jest-tests';

import path from 'path';
import { User } from './models';

describe<JestTestAdapter>('first test', ({ test }) => {
  test('test', async ({ expect }) => {
    await User.default.get()
  });
});
