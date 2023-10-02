import LoggingAdapter from './adapter';
import { LoggerArgumentsToFilterAndFormatters, LoggingTypes } from './types';

let cachedLogging: Partial<
  Record<
    LoggingTypes,
    {
      logger: LoggingAdapter | LoggingAdapter[];
      filter?: (args: LoggerArgumentsToFilterAndFormatters) => boolean;
      formatter?: (args: LoggerArgumentsToFilterAndFormatters) => string;
    }[]
  >
> = {};

/**
 * This will set the logger for the given logging level.
 *
 * @example
 * ```ts
 * setLoggerAtLevel('debug', { logger: MyLogger });
 * ```
 *
 * @param level - One of the logging levels. (debug, log, info, warn, error)
 * @param logger - The logger to use for the given logging level. Containing the formatter and filters if any.
 */
export function setLoggerAtLevel(
  level: LoggingTypes,
  logger: {
    logger: LoggingAdapter | LoggingAdapter[];
    filter?: (args: LoggerArgumentsToFilterAndFormatters) => boolean;
    formatter?: (args: LoggerArgumentsToFilterAndFormatters) => string;
  }
) {
  if (cachedLogging[level]) cachedLogging[level]?.push(logger);
  else cachedLogging[level] = [logger];
}

/**
 * This will return the logger for the given logging level.
 *
 * @example
 * ```ts
 * const logger = getLoggersAtLevel('debug');
 * ```
 *
 * @param level - One of the logging levels. (debug, log, info, warn, error)
 *
 * @returns - The logger data for the given logging level.
 */
export function getLoggersAtLevel(level: LoggingTypes) {
  return cachedLogging[level];
}
