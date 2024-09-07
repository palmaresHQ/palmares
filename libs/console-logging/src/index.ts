import { loggingAdapter } from '@palmares/logging';

const consoleLoggingAdapter = loggingAdapter({
  debug: (message: string) => console.debug(message),
  error: (message: string) => console.error(message),
  info: (message: string) => console.info(message),
  log: (message: string) => console.log(message),
  warn: (message: string) => console.warn(message)
});

export { consoleLoggingAdapter as ConsoleLogging };
export default consoleLoggingAdapter;
