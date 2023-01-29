import { SettingsType } from './types';
import defaultSettings from './defaults';
import {
  imports,
  ERR_MODULE_NOT_FOUND,
  LOGGING_SETTINGS_MODULE_NOT_FOUND,
  LOGGING_USING_SETTINGS_FROM_PATH,
  LOGGING_USING_SETTINGS_FROM_IMPORT,
} from '../utils';
import logging from '../logging';
import { SettingsNotFoundException } from './exceptions';
import type Domain from '../domain';

/**
 * This is responsible for handling the configuration of the app. Usually all of the configuration of a palmares
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
  hasInitializedSettings = false;
  hasInitializedDomains = false;
  domains: Domain[] = [];
  #importedSettings: Promise<SettingsType> | SettingsType | string | null =
    null;

  async #loadFromPathsOrEnv(
    settingsPaths: string[] = []
  ): Promise<SettingsType> {
    const possibleModulePaths = [
      process.env.PALMARES_SETTINGS_MODULE,
      ...settingsPaths,
    ];

    for (const settingsModulePath of possibleModulePaths) {
      if (settingsModulePath) {
        try {
          await logging.logMessage(LOGGING_USING_SETTINGS_FROM_PATH, {
            pathOfSettings: settingsModulePath,
          });
          return await import(settingsModulePath);
        } catch (e) {
          const error: any = e;
          if (error.code === ERR_MODULE_NOT_FOUND) {
            await logging.logMessage(LOGGING_SETTINGS_MODULE_NOT_FOUND, {
              pathOfModule: settingsModulePath,
            });
          }
        }
      }
    }
    throw new SettingsNotFoundException();
  }

  async mergeWithDefault(settings: SettingsType) {
    this.settings = {
      ...defaultSettings,
      ...settings,
    };
  }

  async getSettings(
    settingsOrSettingsPath?: Promise<SettingsType> | SettingsType | string
  ) {
    if (this.hasInitializedSettings) return this.settings;
    const settingsNotDefined = typeof settingsOrSettingsPath === 'undefined';
    if (this.#importedSettings && settingsNotDefined)
      settingsOrSettingsPath = this.#importedSettings;
    if (this.#importedSettings === null && settingsOrSettingsPath)
      this.#importedSettings = await Promise.resolve(settingsOrSettingsPath);

    const isSettingsAPath = typeof settingsOrSettingsPath === 'string';
    const join = await imports<typeof import('path')['join']>('path', {
      packagePath: 'join',
    });
    let settingsModule = undefined;

    if (settingsNotDefined && join) {
      const doesProcessExistInRuntime =
        process && typeof process.cwd === 'function';
      const whereSettingsIsLocated = doesProcessExistInRuntime
        ? process.cwd()
        : '';
      const tsFile = join(whereSettingsIsLocated, 'src', 'settings.ts');
      const jsFile = join(whereSettingsIsLocated, 'src', 'settings.js');
      try {
        settingsModule = await this.#loadFromPathsOrEnv([tsFile, jsFile]);
      } catch (e) {
        await logging.logMessage(LOGGING_SETTINGS_MODULE_NOT_FOUND, {
          pathOfModule: tsFile,
        });
        await logging.logMessage(LOGGING_SETTINGS_MODULE_NOT_FOUND, {
          pathOfModule: jsFile,
        });
      }
    }

    const settingsModuleIsStillUndefined =
      typeof settingsModule === 'undefined';
    if (isSettingsAPath)
      settingsModule = await this.#loadFromPathsOrEnv([
        settingsOrSettingsPath as string,
      ]);
    else if (settingsModuleIsStillUndefined) {
      await logging.logMessage(LOGGING_USING_SETTINGS_FROM_IMPORT);
      settingsModule = await Promise.resolve(settingsOrSettingsPath);
    }

    if (settingsModule)
      await this.mergeWithDefault(settingsModule as SettingsType);
    this.hasInitializedSettings = true;
    return this.settings;
  }
}

export default new Configuration();
