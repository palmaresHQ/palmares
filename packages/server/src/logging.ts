import { logging, MessageCategories } from "@palmares/core";

import { LOGGING_APP_START_SERVER, LOGGING_APP_STOP_SERVER, LOGGING_REQUEST } from './utils';

export default async function buildLogging() {
  const defaultLoggingForServers = (message: string) => `\x1b[1m[server]\x1b[0m ${message}`;
  logging.appendMessage(
    LOGGING_APP_START_SERVER,
    MessageCategories.Info,
    async ({appName, port}) =>  defaultLoggingForServers(`${appName} is running on port ${port}.\nPress Ctrl+C to quit.`)
  );
  logging.appendMessage(
    LOGGING_APP_STOP_SERVER,
    MessageCategories.Info,
    async ({appName, port}) =>  defaultLoggingForServers(`${appName} server is stopping, running cleanup now.`)
  );
  logging.appendMessage(
    LOGGING_REQUEST,
    MessageCategories.Info,
    async ({method, path, elapsedTime, userAgent}) =>  defaultLoggingForServers(`${method} - ${path} - ${userAgent} - ${elapsedTime}`)
  )
}
