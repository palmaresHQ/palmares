import { initializeDomains, std as palmaresStd } from '@palmares/core';

import { setTestAdapter } from './utils';

export async function run(settingsPath: string) {
  try {
    let settings: any = undefined;
    try {
      settings = await import(settingsPath);
    } catch (e) {
      try {
        settings = await import(palmaresStd.files.getPathToFileURL(settingsPath));
      } catch (e) {
        console.error('Error importing settings', e);
      }
    }
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
  setTestAdapter(testAdapter, true);
}
