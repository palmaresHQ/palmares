import { std } from '@palmares/core';

import { setTestAdapter } from '../utils';

import type { AllTestsSettingsType, TestDomain } from '../types';

const filesToTest: string[] = [];

export async function test(domains: TestDomain[], settings: AllTestsSettingsType) {
  for (const domain of domains) {
    if (domain.getTests) {
      const testFilesOrTestFile = domain.getTests();
      if (Array.isArray(testFilesOrTestFile)) filesToTest.push(...testFilesOrTestFile);
      else filesToTest.push(testFilesOrTestFile);
    }
  }
  const newTestAdapter = new settings.testAdapter();
  await setTestAdapter(newTestAdapter);

  return newTestAdapter.run(
    filesToTest,
    `try { await import('@palmares/tests').then(({ run }) => run('` +
      `${(await std.os.platform()) === 'windows' ? 'file:/' : ''}` +
      `${std.files.getPathToFileURL(settings.settingsLocation)}')).catch((e) => console.error(e)); } catch (e) {` +
      `require('@palmares/tests')['run']('` +
      `${(await std.os.platform()) === 'windows' ? 'file:/' : ''}` +
      `${std.files.getPathToFileURL(settings.settingsLocation)}'); }`,
    std.files
  );
}
