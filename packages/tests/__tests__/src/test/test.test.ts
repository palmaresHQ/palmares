import { getDefaultStd, getSettings, initializeDomains, setSettings } from '@palmares/core';
import JestTestAdapter from '@palmares/jest-tests';
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

describe<JestTestAdapter>('test if test adapter works', ({ test }) => {
  test('test adapter', async ({ expect }) => {
    const runningTestAdapter = getTestAdapter();

    expect(runningTestAdapter.constructor).toEqual(JestTestAdapter);
  });

  test('function adapter', async ({ expect }) => {
    const runningTestAdapter = getTestAdapter();

    expect(runningTestAdapter.functions).toBeInstanceOf(TestFunctionsAdapter);
  });

  test('expect adapter', async ({ expect }) => {
    const runningTestAdapter = getTestAdapter();

    expect(runningTestAdapter.expect).toBeInstanceOf(TestExpectAdapter);
  });
});

describe<JestTestAdapter>('test if test package works', ({ test }) => {
  test('test runner', async ({ expect }) => {
    const oldTestAdapter = getTestAdapter();

    await run(path.resolve(__dirname, '__tests__', 'settings.test.ts'));
    const newTestAdapter = getTestAdapter();
    setTestAdapter(oldTestAdapter);
    expect(oldTestAdapter).not.toBe(newTestAdapter);
  });

  test('test test builder', async ({ expect, custom: { jest } }) => {
    const oldTestAdapter = getTestAdapter();
    const oldSettings = getSettings();
    const { settings, domains } = await initializeDomains(
      {
        settingsPathLocation: path.resolve(__dirname, '__tests__', 'settings.test.ts'),
        std: getDefaultStd()
      },
      {
        ignoreCache: true,
        ignoreCommands: true
      }
    );

    const testAdapter = getTestAdapter();
    try {
      jest.spyOn(testAdapter, 'run').mockImplementation(async (filesToRun, globalSetupFunctionBody) => {
        console.log(filesToRun, globalSetupFunctionBody);
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
