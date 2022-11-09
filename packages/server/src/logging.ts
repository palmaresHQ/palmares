import { logging, MessageCategories } from '@palmares/core';

import { LOGGING_APP_START_SERVER, LOGGING_REQUEST } from './utils';

export const defaultLoggingForServers = (message: string) =>
  `\x1b[1m[server]\x1b[0m ${message}`;

export default async function buildLogging() {
  logging.appendMessage(
    LOGGING_APP_START_SERVER,
    MessageCategories.Info,
    async ({ appName, port }) =>
      defaultLoggingForServers(
        `${appName} is running on port ${port}.\nPress Ctrl+C to quit.`
      )
  );
  logging.appendMessage(
    LOGGING_REQUEST,
    MessageCategories.Info,
    async ({
      method,
      path,
      elapsedTime,
      userAgent,
      loggerType,
      statusCode,
    }) => {
      const statusCodeString =
        loggerType === MessageCategories.Info
          ? `\x1b[36m${statusCode}\x1b[0m`
          : loggerType === MessageCategories.Warn
          ? `\x1b[33m${statusCode}\x1b[0m`
          : `\x1b[31m${statusCode}\x1b[0m`;
      return defaultLoggingForServers(
        `${method} - ${path} - ${statusCodeString} - ${userAgent} - ${elapsedTime}`
      );
    }
  );
}
