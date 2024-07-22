import { initializeDomains } from '@palmares/core'

import { setTestAdapter } from './utils'

import type { AllTestsSettingsType } from './types'

export default async function run(settingsPath: string) {
  const settings = await import(settingsPath).catch((e) => {
    console.error('Error importing settings', e)
  });
  const { settings: allSettings } = await initializeDomains(settings.default, {
    ignoreCache: true,
    ignoreCommands: true,
  });

  const testSettings = allSettings as AllTestsSettingsType;
  const adapterInstance = new testSettings.testAdapter();
  setTestAdapter(adapterInstance);
}
