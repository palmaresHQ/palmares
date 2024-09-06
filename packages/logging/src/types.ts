import type { LoggingAdapter } from './adapter';

export type LoggingTypes = 'debug' | 'log' | 'info' | 'warn' | 'error';
export type SavedLoggingMessagesType = Record<string, { category: LoggingTypes; handler: (args?: any) => string }>;
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
    | Promise<{ default: typeof LoggingAdapter }>
    | typeof LoggingAdapter
    | {
        logger: typeof LoggingAdapter | (typeof LoggingAdapter)[];
        level?: LoggingTypes | LoggingTypes[];
        filter?: (args: LoggerArgumentsToFilterAndFormatters) => boolean;
        formatter?: (args: LoggerArgumentsToFilterAndFormatters) => string;
      }[];
};
