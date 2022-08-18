import { logging } from '@palmares/core';
import { LOGGING_NOT_FOUND_ERROR_MESSAGE } from './utils';

export const defaultLoggingForSerializers = (message: string) => `\x1b[1m[serializer]\x1b[0m ${message}`;

export default function log(key: string, params?: any) {
  switch (key) {
    case LOGGING_NOT_FOUND_ERROR_MESSAGE:
      const { errorKey } = params;
      return logging.warn(defaultLoggingForSerializers(`${errorKey} was not found.`));
  }
}
