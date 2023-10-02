import LoggerAdapter from './adapter';

export type LoggingTypes = 'debug' | 'log' | 'info' | 'warn' | 'error';
export type SavedLoggingMessagesType = Record<string, { category: LoggingTypes; handler: (args?: object) => string }>;
export type LoggerArgumentsToFilterAndFormatters = {
  message: string;
  created: string;
  domain: string;
  name: string;
  frameworkName: string;
  logLevel: Uppercase<LoggingTypes>;
};
export type LoggingSettingsType = {
  logger:
    | Promise<{ default: typeof LoggerAdapter }>
    | typeof LoggerAdapter
    | {
        logger: typeof LoggerAdapter | typeof LoggerAdapter[];
        level?: LoggingTypes | LoggingTypes[];
        filter?: (args: LoggerArgumentsToFilterAndFormatters) => boolean;
        formatter?: (args: LoggerArgumentsToFilterAndFormatters) => string;
      }[];
};
