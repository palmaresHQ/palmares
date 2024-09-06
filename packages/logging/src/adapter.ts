export function loggingAdapter<
  TLogFunction extends LoggingAdapter['log'],
  TDebugFunction extends LoggingAdapter['debug'],
  TInfoFunction extends LoggingAdapter['info'],
  TWarnFunction extends LoggingAdapter['warn'],
  TErrorFunction extends LoggingAdapter['error']
>(args: {
  /**
   * Log level log message.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/API/console/log
   *
   * @example
   * ```ts
   * logger.log('Hello World');
   * ```
   *
   * @param _message - The message to be logged.
   */
  log: TLogFunction;
  /**
   * Log level debug message.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/API/console/debug
   *
   * @example
   * ```ts
   * logger.debug('Hello World');
   * ```
   *
   * @param _message - The message to be logged.
   */
  debug: TDebugFunction;
  /**
   * Log level info message.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/API/console/info
   *
   * @example
   * ```ts
   * logger.info('Hello World');
   * ```
   *
   * @param _message - The message to be logged.
   */
  info: TInfoFunction;
  /**
   * Log level warn message.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/API/console/warn
   *
   * @example
   * ```ts
   * logger.warn('Hello World');
   * ```
   *
   * @param _message - The message to be logged.
   */
  warn: TWarnFunction;
  /**
   * Log level error message.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/API/console/error
   *
   * @example
   * ```ts
   * logger.error('Hello World');
   * ```
   *
   * @param _message - The message to be logged.
   */
  error: TErrorFunction;
}) {
  const ModifiedClass = class extends LoggingAdapter {
    log = args.log;
    debug = args.debug;
    info = args.info;
    warn = args.warn;
    error = args.error;
  };

  return ModifiedClass as new () => LoggingAdapter & {
    log: TLogFunction;
    debug: TDebugFunction;
    info: TInfoFunction;
    warn: TWarnFunction;
    error: TErrorFunction;
  };
}

export class LoggingAdapter {
  /**
   * Log level log message.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/API/console/log
   *
   * @example
   * ```ts
   * logger.log('Hello World');
   * ```
   *
   * @param _message - The message to be logged.
   */
  log(_message: string): void {
    return undefined;
  }

  /**
   * Log level debug message.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/API/console/debug
   *
   * @example
   * ```ts
   * logger.debug('Hello World');
   * ```
   *
   * @param _message - The message to be logged.
   */
  debug(_message: string): void {
    return undefined;
  }

  /**
   * Log level warn message.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/API/console/warn
   *
   * @example
   * ```ts
   * logger.warn('Hello World');
   * ```
   *
   * @param _message - The message to be logged.
   */
  warn(_message: string): void {
    return undefined;
  }

  /**
   * Log level error message.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/API/console/error
   *
   * @example
   * ```ts
   * logger.error('Hello World');
   * ```
   *
   * @param _message - The message to be logged.
   */
  error(_message: string): void {
    return undefined;
  }

  /**
   * Log level info message.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/API/console/info
   *
   * @example
   * ```ts
   * logger.info('Hello World');
   * ```
   *
   * @param _message - The message to be logged.
   */
  info(_message: string): void {
    return undefined;
  }
}
