import type { LoggingTypes } from './types';

export const FRAMEWORK_NAME = 'palmares';

export const stringByMessageType: Record<LoggingTypes, string> = {
  debug: '\x1b[35mDEBUG\x1b[0m',
  log: '\x1b[32mLOG\x1b[0m',
  info: '\x1b[36mINFO\x1b[0m',
  warn: '\x1b[33mWARN\x1b[0m',
  error: '\x1b[31mERROR\x1b[0m',
};
