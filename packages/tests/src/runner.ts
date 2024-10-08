import { initializeDomains } from '@palmares/core';

import { setTestAdapter } from './utils';

export async function run(settingsPath: string) {
  const settings = await import(settingsPath).catch((e) => {
    console.error('Error importing settings', e);
  });
  const defaultSettings = settings.default;
  defaultSettings.$$test = true;
  console.log('runner');
  await initializeDomains(defaultSettings, {
    ignoreCache: false,
    ignoreCommands: true
  });
}

export async function runIndependently(adapterLocation: string) {
  const adapter = await import(adapterLocation).catch((e) => {
    console.error('Error importing adapter', e);
  });
  const testAdapter = new adapter.default();
  setTestAdapter(testAdapter);
}
