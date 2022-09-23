import { logging } from '@palmares/core';
import { LOGGING_NOT_FOUND_WARN_MESSAGE } from './utils';

export const defaultLoggingForSerializers = (message: string) =>
  `\x1b[1m[serializer]\x1b[0m ${message}`;

export default function log(key: string, params: { errorKey: string }) {
  switch (key) {
    case LOGGING_NOT_FOUND_WARN_MESSAGE:
      return logging.warn(
        defaultLoggingForSerializers(`${params.errorKey} was not found.`)
      );
  }
}
