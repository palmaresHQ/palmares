import type { LoggingAdapter } from './adapter';
import type { LoggerArgumentsToFilterAndFormatters, LoggingTypes } from './types';

declare global {
  // eslint-disable-next-line no-var
  var $PLogging:
    | Partial<
        Record<
          LoggingTypes,
          {
            logger: LoggingAdapter | LoggingAdapter[];
            filter?: (args: LoggerArgumentsToFilterAndFormatters) => boolean;
            formatter?: (args: LoggerArgumentsToFilterAndFormatters) => string;
          }[]
        >
      >
    | undefined;
}

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
  if (typeof globalThis.$PLogging !== 'object') globalThis.$PLogging = {};
  if (globalThis.$PLogging[level]) globalThis.$PLogging[level].push(logger);
  else globalThis.$PLogging[level] = [logger];
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
  return globalThis.$PLogging?.[level];
}
