import { conf } from '@palmares/core'
import ValidationError from './exceptions';
import { SerializersSettingsType } from './types'


const serializerSettings = conf.settings as SerializersSettingsType;
const isValidValidationError = serializerSettings?.ERROR_CLASS instanceof ValidationError
const isValidErrorMessages = serializerSettings?.ERROR_MESSAGES instanceof Object;

export const settings: SerializersSettingsType = {
  ...conf.settings,
  ERROR_CLASS: isValidValidationError ? serializerSettings.ERROR_CLASS : ValidationError,
  ERROR_MESSAGES: isValidErrorMessages ? serializerSettings.ERROR_MESSAGES : {},
}
