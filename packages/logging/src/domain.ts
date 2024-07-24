import { domain } from '@palmares/core';

import { setLoggerAtLevel } from './config';
import Logger from './logger';

import type { LoggingSettingsType, LoggingTypes } from './types';

// eslint-disable-next-line ts/ban-ts-comment
// @ts-ignore
export default domain('@palmares/logging', __dirname || import.meta.url, {
  load: async (settings: LoggingSettingsType) => {
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (settings.logger) {
      if (settings.logger instanceof Promise || Array.isArray(settings.logger) === false) {
        const logger = (
          settings.logger instanceof Promise ? (await settings.logger).default : settings.logger
        );
        const loggerData = { logger: new logger() }; // Create once only and link them together, this way we don't need to create too much objects and instances just to consume memory.
        setLoggerAtLevel('debug', loggerData);
        setLoggerAtLevel('log', loggerData);
        setLoggerAtLevel('info', loggerData);
        setLoggerAtLevel('warn', loggerData);
        setLoggerAtLevel('error', loggerData);
      } else if (Array.isArray(settings.logger)) {
        for (const logger of settings.logger) {
          const initializedLogger = Array.isArray(logger.logger)
            ? logger.logger.map((loggerConstructor) => {
                console.log(loggerConstructor);
                return new loggerConstructor();
              })
            : new logger.logger();
          (logger as any).logger = initializedLogger;
          const loggingLevels: LoggingTypes[] = Array.isArray(logger.level)
            ? logger.level
            : typeof logger.level === 'string'
            ? [logger.level]
            : ['debug', 'log', 'info', 'warn', 'error'];
          for (const level of loggingLevels) setLoggerAtLevel(level, logger as any);
        }
      }
      (settings as any).__logger = Logger;
    }
  },
});
