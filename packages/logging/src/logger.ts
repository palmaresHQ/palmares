import { getLoggersAtLevel } from './config';
import { FRAMEWORK_NAME } from './constants';
import { getDefaultFormattedMessage } from './defaults';

import type { LoggerArgumentsToFilterAndFormatters, LoggingTypes, SavedLoggingMessagesType } from './types';

/**
 * This is the main logger class. This is the class that you will use to log messages in the application. You can log to the console but you can also log to a file or a database.
 * You can add your own custom logger logic.
 *
 * This also lets you add logging messages that you can use to log messages. This is useful when you want to log the same message multiple times. And you don't want to repeat the
 * same text over and over again.
 *
 * @example
 * ```ts
 * const logger = new Logger({ name: 'my-logger' });
 * logger.log('Hello World!');
 * ```
 */
export class Logger<TLoggingMessages extends SavedLoggingMessagesType> {
  name = '';
  domainName = '';
  loggingMessages?: TLoggingMessages;

  constructor(
    args: {
      domainName?: string;
      name?: string;
    },
    loggingMessages?: TLoggingMessages
  ) {
    this.domainName = args.domainName || '';
    this.name = args.name || '';
    this.loggingMessages = loggingMessages;
  }

  /**
   * Retrieve a child logger from the current logger.
   *
   * @example
   * ```ts
   * const logger = new Logger({ domainName: 'my-custom-package' });
   * const childLogger = logger.getChildLogger('migrations');
   * ```
   *
   * @param name - The name of the child logger.
   *
   * @returns A new logger instance with the given name.
   */
  getChildLogger<TNewLoggingMessages extends SavedLoggingMessagesType>(
    name: string,
    loggingMessages?: TNewLoggingMessages
  ) {
    const concatenatedLoggingMessages = (
      this.loggingMessages && loggingMessages
        ? {
            ...this.loggingMessages,
            ...loggingMessages
          }
        : this.loggingMessages
          ? this.loggingMessages
          : loggingMessages
    ) as TLoggingMessages & TNewLoggingMessages;
    return new Logger(
      {
        domainName: this.domainName,
        name
      },
      concatenatedLoggingMessages
    );
  }

  /**
   * If you don't use the `loggingMessages` property in the constructor, you can use this method to add logging messages to the logger.
   *
   * On here you are only able to add logging messages one by one. So you need to call this method for each logging message you want to add.
   * This will work as a builder pattern so you can append as many logging messages as you want.
   *
   * @example
   * ```ts
   * const logger = new Logger({ name: 'my-logger' })
   *  .appendLogMessage('my-logging-message', {
   *    category: 'debug',
   *    handler: (args: { databaseName: string }) => `Hello World! ${args.databasename}`,
   *   });
   *
   * logger.logMessage('my-logging-message', { databaseName: 'my-database' });
   * ```
   *
   * @param name - The name of the logging message.
   * @param log - The logging function that will be called when the `logMessage` method is called.
   *
   * @returns - The current logger instance.
   */
  appendLogMessage<TName extends string, TLog extends SavedLoggingMessagesType[string]>(name: TName, log: TLog) {
    (this.loggingMessages as any)[name] = log;
    return this as unknown as Logger<
      TLoggingMessages & {
        [key in TName]: TLog;
      }
    >;
  }

  /**
   * This will log the message that was added to the logger using the `appendLogMessage` method or the `loggingMessages` property in the constructor.
   *
   * @example
   * ```ts
   * const logger = new Logger({ name: 'my-logger' }, {
   *    'my-logging-message': {
   *      category: 'debug',
   *      handler: (args: { databaseName: string }) => `Hello World! ${args.databasename}`,
   *    },
   * });
   *
   * logger.logMessage('my-logging-message', { databaseName: 'my-database' });
   * ```
   *
   * @param name - The name of the logging message.
   * @param args - The arguments that will be passed to the handler function.
   */
  logMessage<TName extends keyof TLoggingMessages>(
    name: TName,
    args: Parameters<TLoggingMessages[TName]['handler']>[0]
  ) {
    if (this.loggingMessages?.[name])
      this.#log(this.loggingMessages[name].handler(args), this.loggingMessages[name].category);
  }

  /**
   * This is the main logging method. This will log the message to the console or to a file or a database, or even an api.
   *
   * With this method we can reuse the same logic over and over again on each logging type.
   *
   * @param message - The message to be logged.
   * @param level - The level of the message to be logged.
   *
   * @private
   */
  #log(message: string, level: LoggingTypes) {
    const data: LoggerArgumentsToFilterAndFormatters = {
      message,
      created: new Date().toISOString(),
      domain: this.domainName,
      name: this.name,
      frameworkName: FRAMEWORK_NAME,
      logLevel: level.toUpperCase() as Uppercase<LoggingTypes>
    };
    const loggers = getLoggersAtLevel(level);
    if (!Array.isArray(loggers)) return;
    for (const logger of loggers) {
      const shouldLog = logger.filter ? logger.filter(data) : true;
      if (!shouldLog) continue;
      const formattedMessage = logger.formatter ? logger.formatter(data) : getDefaultFormattedMessage(data);
      if (Array.isArray(logger.logger)) return logger.logger.forEach((logger) => logger.log(formattedMessage));
      else return logger.logger.log(formattedMessage);
    }
  }

  log(message: string) {
    this.#log(message, 'log');
  }

  info(message: string) {
    this.#log(message, 'info');
  }

  debug(message: string) {
    this.#log(message, 'debug');
  }

  warn(message: string) {
    this.#log(message, 'warn');
  }

  error(message: string) {
    this.#log(message, 'error');
  }
}
