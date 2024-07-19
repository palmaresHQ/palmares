import { FRAMEWORK_NAME, PACKAGE_NAME } from './utils/constants';

let cachedLogger: {
  log: (message: string) => void;
  info: (message: string) => void;
  debug: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
} = {
  log: (message: string) => console.log(getDefaultFormattedMessage(message)),
  info: (message: string) => console.info(getDefaultFormattedMessage(message)),
  debug: (message: string) => console.debug(getDefaultFormattedMessage(message)),
  warn: (message: string) => console.warn(getDefaultFormattedMessage(message)),
  error: (message: string) => console.error(getDefaultFormattedMessage(message)),
};

/**
 * Returns a formatted message with the framework name and the package name.
 *
 * @param message The message to be formatted.
 *
 * @returns The formatted message.
 */
export function getDefaultFormattedMessage(message: string) {
  return `\x1b[32m[${FRAMEWORK_NAME}]\x1b[0m \x1b[1m[${PACKAGE_NAME}]\x1b[0m ${message}`;
}

/**
 * Returns the cached logger.
 *
 * @returns The cached logger.
 */
export function getLogger() {
  return cachedLogger;
}

/**
 * Sets the cached logger.
 *
 * @param logger - The logger to be cached.
 */
export function setLogger(logger: typeof cachedLogger) {
  cachedLogger = logger;
}
// qui
