import { conf } from '@palmares/core'

import ValidationError from './exceptions';
import { SerializersSettingsType } from './types'

export default function getSettings(): SerializersSettingsType {
  const serializerSettings = conf.settings as SerializersSettingsType;
  const isValidValidationError = serializerSettings?.ERROR_CLASS instanceof ValidationError
  const isValidErrorMessages = serializerSettings?.ERROR_MESSAGES instanceof Object;

  return {
    ...conf.settings,
    ERROR_CLASS: isValidValidationError ? serializerSettings.ERROR_CLASS : ValidationError,
    ERROR_MESSAGES: isValidErrorMessages ? serializerSettings.ERROR_MESSAGES : {},
  }
}
