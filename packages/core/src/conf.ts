import { ERR_MODULE_NOT_FOUND, LOGGING_SETTINGS_MODULE_NOT_FOUND } from './utils';
import logging from './logging';


class Configuration {
    constructor() {

    }

    async loadFromEnv() {
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
    }

    async merge

    async loadConfiguration() {
        const settingsModule = await this.loadFromEnv();
        if (settingsModule) {
            return settingsModule;
        }
    }
}