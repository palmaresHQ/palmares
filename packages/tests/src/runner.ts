import { initializeDomains, setDefaultStd } from '@palmares/core';

import { setTestAdapter } from './utils';

export async function run(settingsPath: string) {
  try {
    const settings = await import(settingsPath);
    /*const settings = await import(settingsPath);*/ /*.catch((e) => {
      console.error('Error importing settings', e);
    });*/
    let defaultSettings = settings.default;
    if ('default' in defaultSettings) defaultSettings = defaultSettings.default;

    defaultSettings.$$test = true;
    await initializeDomains(defaultSettings, {
      ignoreCache: true,
      ignoreCommands: true
    });
  } catch (e) {
    console.error('Error initializing domains', e);
  }
}

export async function runIndependently(adapterLocation: string) {
  const adapter = await import(adapterLocation).catch((e) => {
    console.error('Error importing adapter', e);
  });
  const testAdapter = new adapter.default();
  setTestAdapter(testAdapter);
}
