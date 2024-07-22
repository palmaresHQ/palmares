import { stringByMessageType } from './constants';

import type { LoggerArgumentsToFilterAndFormatters } from './types';

/**
 * This default message formatter will return a string colorized to the log.
 *
 * @param args - The arguments to be formatted.
 *
 * @returns The formatted message to show on the console.
 */
export function getDefaultFormattedMessage(args: LoggerArgumentsToFilterAndFormatters) {
  return `\x1b[32m[${args.frameworkName}]\x1b[0m \x1b[33m${args.created}\x1b[0m \x1b[1m[${args.domain}]\x1b[0m${
    args.name && args.name.length > 0 ? ` \x1b[4m[${args.name}]\x1b[0m ` : ' '
  }${stringByMessageType[args.logLevel.toLowerCase() as keyof typeof stringByMessageType]} ${args.message}`;
}
