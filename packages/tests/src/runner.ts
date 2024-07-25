import { initializeDomains } from '@palmares/core';

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
