import { SettingsNotFoundException } from './exceptions';
import { setDefaultStd } from '../std/config';
import { PALMARES_SETTINGS_MODULE_ENVIRONMENT_VARIABLE } from '../utils';

import type { SettingsType2 } from './types';
import type Std from '../std-adapter';

let cachedSettings: SettingsType2 | null = null;

export function getSettings() {
  if (cachedSettings) return cachedSettings;
}

/**
 * Extracts the settings from the path provided using an standard library provided, could be Node, Bun, Deno, whatever.
 * We do need an standard library on this case because we can't make any assumptions on where you are running. Please be aware that
 * if you are using NodeStd and trying to run the code on the browser it WILL fail. Just use it if you are completely sure that it will
 * only run on that runtime and any other.
 */
async function extractSettingsFromPath(stdToUse: Std, path?: string) {
  setDefaultStd(stdToUse);
  const pathToUse: string =
    typeof path === 'string' ? path : await stdToUse.files.readFromEnv(PALMARES_SETTINGS_MODULE_ENVIRONMENT_VARIABLE);

  if (!pathToUse) throw new SettingsNotFoundException();
  try {
    cachedSettings = ((await import(pathToUse)) as { default: SettingsType2 }).default;
  } catch (e) {
    throw new SettingsNotFoundException();
  }
}

/**
 * Function supposed to be called after all of the domains were loaded. It will save the settings in memory and return it when it's needed / requested by calling the `getSettings` function.
 */
export async function setSettings(
  settingsOrStd:
    | Promise<{ default: SettingsType2 }>
    | SettingsType2
    | Std
    | Promise<{ default: Std }>
    | {
        settingsPathLocation: string;
        std: Std;
      }
) {
  if (settingsOrStd instanceof Promise) {
    const awaitedSettingsOrSrd = await settingsOrStd;
    if ('files' in awaitedSettingsOrSrd.default) await extractSettingsFromPath(awaitedSettingsOrSrd.default);
    else cachedSettings = awaitedSettingsOrSrd.default;
  } else if ('files' in settingsOrStd) await extractSettingsFromPath(settingsOrStd);
  else if (typeof settingsOrStd === 'object' && 'settingsPathLocation' in settingsOrStd) {
    await extractSettingsFromPath(settingsOrStd.std, settingsOrStd.settingsPathLocation);
  } else cachedSettings = settingsOrStd;

  if (!cachedSettings) throw new SettingsNotFoundException();
  setDefaultStd(new cachedSettings.std());
  return cachedSettings;
}
