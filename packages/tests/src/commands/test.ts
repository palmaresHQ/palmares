import { getDefaultStd } from '@palmares/core';

import { setTestAdapter } from '../utils';

import type { AllTestsSettingsType, TestDomain } from '../types';

const filesToTest: string[] = [];

export default async function test(domains:TestDomain[], settings: AllTestsSettingsType){
  for (const domain of domains) {
    if (domain.getTests) {
      const testFilesOrTestFile = domain.getTests();
      if (Array.isArray(testFilesOrTestFile)) filesToTest.push(...testFilesOrTestFile);
      else filesToTest.push(testFilesOrTestFile);
    }
  }
  const newTestAdapter = new settings.testAdapter();
  setTestAdapter(newTestAdapter);
  const std = getDefaultStd();

  return newTestAdapter.run(
    filesToTest,
    `require('@palmares/tests').run('${settings.settingsLocation}');`,
    {
      mkdir: std.files.makeDirectory,
      join: std.files.join,
      writeFile: std.files.writeFile,
      removeFile: std.files.removeFile,
    }
  );
}
