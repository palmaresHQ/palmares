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
    `import { run } from '@palmares/tests';\nawait run('` +
      `${(await std.os.platform()) === 'windows' ? 'file:/' : ''}` +
      `${std.files.getPathToFileURL(settings.settingsLocation)}');`,
    {
      mkdir: std.files.makeDirectory,
      join: std.files.join,
      writeFile: std.files.writeFile,
      removeFile: std.files.removeFile
    }
  );
}
