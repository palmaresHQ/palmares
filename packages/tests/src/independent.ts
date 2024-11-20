import { setTestAdapter } from './utils';

import type { Std } from '@palmares/core';

export async function testIndependently(adapterLocation: string, std: Std, filesToTest: string[]) {
  const adapterLocationFileUrl = std.files.getPathToFileURL(adapterLocation);
  const actualAdapterLocation =
    (await std.os.platform()) === 'windows' && adapterLocationFileUrl.startsWith('file:') === false
      ? `file:/${adapterLocationFileUrl}`
      : adapterLocationFileUrl;
  const adapter = await import(actualAdapterLocation).catch((e) => {
    console.error('Error importing adapter', e);
  });
  const testAdapter = new adapter.default();
  setTestAdapter(testAdapter);

  return testAdapter.run(filesToTest, `require('@palmares/tests').runIndependently('${actualAdapterLocation}');`, {
    mkdir: std.files.makeDirectory,
    join: std.files.join,
    writeFile: std.files.writeFile,
    removeFile: std.files.removeFile
  });
}
