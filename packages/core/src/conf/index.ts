import { SettingsType } from './types';
import defaultSettings from './defaults';
import {
    ERR_MODULE_NOT_FOUND,
    LOGGING_SETTINGS_MODULE_NOT_FOUND,
    LOGGING_USING_SETTINGS_FROM_PATH
} from '../utils';
import logging from '../logging';

/**
 * This is responsible for handling the configuration of the app. Usully all of the configuration of a palmares
 * app will live inside of 'settings.ts' or 'settings.js' files.
 *
 * 'settings.js' or 'settings.js' usually live inside the `src` folder but sometimes you can change, or sometimes
 * you might even want to create multiple settings.js files.
 *
 * To solve this problem you can use the `PALMARES_SETTINGS_MODULE` environment variable to specify which settings
 * module you want to use in your application.
 */
class Configuration {
  settings = defaultSettings;

  async #loadFromPathOrEnv(settingsPath: string): Promise<SettingsType> {
    const isEnvDefined: boolean =
      typeof process.env.PALMARES_SETTINGS_MODULE === 'string';
    const settingsModulePath: string = isEnvDefined ?
      process.env.PALMARES_SETTINGS_MODULE || '' : settingsPath;
    try {
      await logging.logMessage(LOGGING_USING_SETTINGS_FROM_PATH, { pathOfSettings: settingsModulePath });
      return await import(settingsModulePath);
    } catch (e) {
      const error: any = e;
      if (error.code === ERR_MODULE_NOT_FOUND) {
        await logging.logMessage(LOGGING_SETTINGS_MODULE_NOT_FOUND, { pathOfModule: settingsModulePath });
      }
    }
    return defaultSettings;
  }

  async mergeWithDefault(settings: SettingsType) {
    this.settings = {
      ...defaultSettings,
      ...settings
    };
  }

  async loadConfiguration(settingsOrSettingsPath: Promise<SettingsType> | SettingsType | string) {
    const isSettingsAPath = typeof settingsOrSettingsPath === 'string';
    let settingsModule = undefined;

    if (isSettingsAPath) settingsModule = await this.#loadFromPathOrEnv(settingsOrSettingsPath as string);
    else settingsModule = await Promise.resolve(settingsOrSettingsPath);

    if (settingsModule) this.mergeWithDefault(settingsModule);
    return this.settings;
  }
}

export default new Configuration();
