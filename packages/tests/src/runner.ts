import { initializeDomains } from '@palmares/core';

import { setTestAdapter } from './utils';

export default async function run(settingsPath: string) {
  const settings = await import(settingsPath).catch((e) => {
    console.error('Error importing settings', e);
  });
  const defaultSettings = settings.default;
  defaultSettings.$$test = true;
  await initializeDomains(defaultSettings, {
    ignoreCache: true,
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
