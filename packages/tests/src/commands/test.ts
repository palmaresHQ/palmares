import { getDefaultStd } from '@palmares/std';

import { AllTestsSettingsType, TestDomain } from '../types';
import { getTestAdapter, setTestAdapter } from '../utils';

const filesToTest: string[] = [];

export default function test(domains:TestDomain[], settings: AllTestsSettingsType){
  for (const domain of domains) {
    if (domain.getTests) {
      const testFilesOrTestFile = domain.getTests();
      if (Array.isArray(testFilesOrTestFile)) filesToTest.push(...testFilesOrTestFile);
      else filesToTest.push(testFilesOrTestFile);
    }
  }
  console.log(filesToTest)
  setTestAdapter(new settings.testAdapter());
  const std = getDefaultStd();
  getTestAdapter().run(
    filesToTest,
    `require('@palmares/tests').run('${settings.settingsLocation}');`,
    {
      join: std.files.join,
      writeFile: std.files.writeFile,
      removeFile: std.files.removeFile,
    }
  );
}
