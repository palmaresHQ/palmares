import { SettingsType } from './types';
import defaultSettings from './defaults';
import { ERR_MODULE_NOT_FOUND, LOGGING_SETTINGS_MODULE_NOT_FOUND } from '../utils';
import logging from '../logging';

/**
 * This is responsible for handling the configuration of the app.
 */
class Configuration {
    settings = defaultSettings;

    async loadFromEnv(): Promise<SettingsType> {
        const isEnvDefined: boolean = 
            typeof process.env.PALMARES_SETTINGS_MODULE === 'string';
        if (isEnvDefined) {
            const settingsModulePath = process.env.PALMARES_SETTINGS_MODULE || '';
            try {
                return await import(settingsModulePath);
            } catch (e) {
                if (ERR_MODULE_NOT_FOUND) {
                    logging.logMessage(LOGGING_SETTINGS_MODULE_NOT_FOUND, { pathOfModule: settingsModulePath });
                }
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

    async loadConfiguration() {
        const settingsModule = await this.loadFromEnv();
        if (settingsModule) {
            this.mergeWithDefault(settingsModule);
        }
    }
}

export default new Configuration();