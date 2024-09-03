import { setTestAdapter } from './utils';

import type { Std } from '@palmares/core';

export default async function testIndependently(adapterLocation: string, std: Std, filesToTest: string[]) {
  const adapter = await import(adapterLocation).catch((e) => {
    console.error('Error importing adapter', e);
  });
  const testAdapter = new adapter.default();
  setTestAdapter(testAdapter);

  return testAdapter.run(filesToTest, `require('@palmares/tests').runIndependently('${adapterLocation}');`, {
    mkdir: std.files.makeDirectory,
    join: std.files.join,
    writeFile: std.files.writeFile,
    removeFile: std.files.removeFile
  });
}
