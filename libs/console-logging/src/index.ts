import { loggingAdapter } from '@palmares/logging';

export default loggingAdapter({
  debug: (message: string) => console.debug(message),
  error: (message: string) => console.error(message),
  info: (message: string) => console.info(message),
  log: (message: string) => console.log(message),
  warn: (message: string) => console.warn(message),
});
