import { SettingsNotFoundException } from './exceptions';
import { setDefaultStd } from '../std/config';
import { PALMARES_SETTINGS_MODULE_ENVIRONMENT_VARIABLE } from '../utils';

import type { SettingsType2 } from './types';
import type { Std } from '../std-adapter';

let $PCachedSettings: SettingsType2 | undefined;
declare global {
  // eslint-disable-next-line no-var
  var $PCachedSettings: SettingsType2 | undefined;
}

export function getSettings() {
  if ($PCachedSettings) return $PCachedSettings;
}

/**
 * Extracts the settings from the path provided using an standard library provided, could be Node, Bun, Deno, whatever.
 * We do need an standard library on this case because we can't make any assumptions on where you are running. Please
 * be aware that if you are using NodeStd and trying to run the code on the browser it WILL fail. Just use it if you
 * are completely sure that it will only run on that runtime and any other.
 */
async function extractSettingsFromPath(stdToUse: Std, path?: string) {
  setDefaultStd(stdToUse);
  const pathToUse: string =
    typeof path === 'string' ? path : await stdToUse.files.readFromEnv(PALMARES_SETTINGS_MODULE_ENVIRONMENT_VARIABLE);

  if (!pathToUse) throw new SettingsNotFoundException();
  try {
    $PCachedSettings = ((await import(stdToUse.files.getPathToFileURL(pathToUse))) as { default: SettingsType2 })
      .default;
    return $PCachedSettings;
  } catch (e) {
    throw new SettingsNotFoundException();
  }
}

/**
 * Function supposed to be called after all of the domains were loaded. It will save the settings in memory and return
 * it when it's needed / requested by calling the `getSettings` function.
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
  let settings = undefined;
  if (settingsOrStd instanceof Promise) {
    const awaitedSettingsOrSrd = await settingsOrStd;
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (awaitedSettingsOrSrd === undefined) throw new SettingsNotFoundException();
    if ('files' in awaitedSettingsOrSrd.default) settings = await extractSettingsFromPath(awaitedSettingsOrSrd.default);
    else {
      settings = awaitedSettingsOrSrd.default;
    }
  } else if ('files' in settingsOrStd) await extractSettingsFromPath(settingsOrStd);
  else if (typeof settingsOrStd === 'object' && 'settingsPathLocation' in settingsOrStd) {
    settings = await extractSettingsFromPath(settingsOrStd.std, settingsOrStd.settingsPathLocation);
  } else {
    settings = settingsOrStd;
  }

  if (!settings) throw new SettingsNotFoundException();
  if ((settings as any)?.default) settings = (settings as any).default;
  $PCachedSettings = settings;
  setDefaultStd(new settings.std());
  return settings;
}
