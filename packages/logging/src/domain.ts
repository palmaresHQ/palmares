import { domain } from '@palmares/core';

import { setLoggerAtLevel } from './config';
import { LoggingSettingsType, LoggingTypes } from './types';
import LoggingAdapter from './adapter';
import Logger from './logger';

//@ts-ignore
export default domain('@palmares/logging', __dirname || import.meta.url, {
  load: async (settings: LoggingSettingsType) => {
    if (settings.logger) {
      if (settings.logger instanceof Promise || Array.isArray(settings.logger) === false) {
        const logger = (
          settings.logger instanceof Promise ? (await settings.logger).default : settings.logger
        ) as typeof LoggingAdapter;
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
