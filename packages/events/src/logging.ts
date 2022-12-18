import { logging, MessageCategories } from '@palmares/core';

import { LOGGING_APP_START_EVENTS_SERVER } from './utils';

export const defaultLoggingForEvents = (message: string) =>
  `\x1b[1m[events]\x1b[0m ${message}`;

export default async function buildLogging() {
  logging.appendMessage(
    LOGGING_APP_START_EVENTS_SERVER,
    MessageCategories.Info,
    async ({ appName }) =>
      defaultLoggingForEvents(
        `${appName} is running an events server and will only listen for events.\nPress Ctrl+C to quit.`
      )
  );
}
