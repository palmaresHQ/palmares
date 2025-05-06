import { getDefaultStd, getSettings, initializeDomains, setSettings } from '@palmares/core';
import {
  TestExpectAdapter,
  TestFunctionsAdapter,
  describe,
  getTestAdapter,
  run,
  setTestAdapter,
  testCommand
} from '@palmares/tests';
import path from 'path';

import type JestTestAdapter from '@palmares/jest-tests';

describe('test if test adapter works', ({ test }) => {
  // // eslint-disable-next-line ts/require-await
  test('function adapter', ({ expect, custom: { jest } }) => {
    const runningTestAdapter = getTestAdapter();

    expect(runningTestAdapter.functions).toBeInstanceOf(TestFunctionsAdapter);
  });

  // // eslint-disable-next-line ts/require-await
  test('expect adapter', ({ expect }) => {
    const runningTestAdapter = getTestAdapter();
    expect(runningTestAdapter.expect).toBeInstanceOf(TestExpectAdapter);
  });
});

describe<JestTestAdapter>('test if test package works', ({ test }) => {
  test('test runner', async ({ expect }) => {
    const oldTestAdapter = getTestAdapter();

    await run(path.resolve(import.meta.dirname, 'test', '__tests__', 'settings-for-test.ts'));
    const newTestAdapter = getTestAdapter();
    setTestAdapter(oldTestAdapter);
    expect(oldTestAdapter).not.toBe(newTestAdapter);
  });

  test('test test builder', async ({ expect, custom: { jest } }) => {
    const oldTestAdapter = getTestAdapter();
    const oldSettings = getSettings();
    const { settings, domains } = await initializeDomains(
      {
        settingsPathLocation: path.resolve(import.meta.dirname, 'test', '__tests__', 'settings-for-test.ts'),
        std: getDefaultStd()
      },
      {
        ignoreCache: true,
        ignoreCommands: true
      }
    );

    const testAdapter = getTestAdapter();
    try {
      // eslint-disable-next-line ts/require-await
      jest.spyOn(testAdapter, 'run').mockImplementation(async (filesToRun, globalSetupFunctionBody) => {
        expect(filesToRun.length).toEqual(0);
        expect(globalSetupFunctionBody).toEqual(`require('@palmares/tests').run('${settings.settingsLocation}');`);
        Promise.resolve();
      });
      await testCommand(domains, settings as any);
      expect(testAdapter.run).toHaveBeenCalled();
    } catch (e) {
      setTestAdapter(oldTestAdapter);
      expect((e as any).message).toEqual('Not implemented');
    }
    setTestAdapter(oldTestAdapter);

    setSettings(oldSettings as any);
  });
});
