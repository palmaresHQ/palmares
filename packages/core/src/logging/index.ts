import {
    FRAMEWORK_NAME,
    LOGGING_USING_SETTINGS_FROM_PATH,
    LOGGING_SETTINGS_MODULE_NOT_FOUND,
    LOGGING_APP_START_SERVER,
    LOGGING_APP_STOP_SERVER
} from '../utils/constants';
import {
    MessagesType,
    MessageCategories,
    MessagesCallbackType,
    SettingsModuleNotFoundParameters
} from './types';
import { ExistingMessageException, MessageDoesNotExistException } from './exceptions';
import Logger from './logger';

class Logging {
  messages: MessagesType = {
    [LOGGING_USING_SETTINGS_FROM_PATH]: {
      category: MessageCategories.Info,
      callback: async ({pathOfSettings}) => `Loading the ${FRAMEWORK_NAME} settings from path: ${pathOfSettings}`
    },
    [LOGGING_SETTINGS_MODULE_NOT_FOUND]: {
      category: MessageCategories.Error,
      callback: async (customArgs?: SettingsModuleNotFoundParameters) => `Your settings module was not found at ${customArgs?.pathOfModule}.`
    }
  }

  stringByMessageType = {
    [MessageCategories.Debug]: '\x1b[32mDEBUG\x1b[0m',
    [MessageCategories.Info]: '\x1b[36mINFO\x1b[0m',
    [MessageCategories.Warn]: '\x1b[33mWARN\x1b[0m',
    [MessageCategories.Error]: '\x1b[31mERROR\x1b[0m'
  }

  defaultLogInfo(): string {
    return `\x1b[32m[${FRAMEWORK_NAME}]\x1b[0m \x1b[33m${new Date().toISOString()}\x1b[0m`
  }

  appendMessage(
    messageName: string, category: MessageCategories, callback: MessagesCallbackType
  ): void {

    const alreadyExists = this.messages[messageName] !== undefined;
    if (alreadyExists) throw new ExistingMessageException(messageName);

    this.messages[messageName] = {
      category,
      callback
    }
  }

  async logMessage(messageName: string, customData={}) {
    const message = this.messages[messageName];
    const isMessageNotDefined = message === undefined;
    if (isMessageNotDefined) throw new MessageDoesNotExistException(messageName);

    const customMessage = await Promise.resolve(message.callback(customData))
    await this.log(message.category, customMessage)
  }

  async log(category: MessageCategories, message: string) {
    const logMessage: string = `${this.defaultLogInfo()} ${this.stringByMessageType[category]} ${message}`;

    switch (category) {
      case MessageCategories.Debug:
        console.debug(logMessage);
        break;
      case MessageCategories.Info:
        console.info(logMessage);
        break;
      case MessageCategories.Warn:
        console.warn(logMessage);
        break;
      case MessageCategories.Error:
        console.error(logMessage);
        break;
    }
  }

  createLogger(name: string) {
    return new Logger(name, this)
  }
}

export default new Logging();
