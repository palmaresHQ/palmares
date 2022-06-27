import { 
    FRAMEWORK_NAME, 
    LOGGING_USING_SETTINGS_FROM_PATH,
    LOGGING_SETTINGS_MODULE_NOT_FOUND, 
    LOGGING_DATABASE_MODELS_NOT_FOUND,
    LOGGING_DATABASE_CLOSING,
    LOGGING_DATABASE_IS_NOT_CONNECTED,
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


class Logging {
  messages: MessagesType = {
    [LOGGING_USING_SETTINGS_FROM_PATH]: {
      category: MessageCategories.Info,
      callback: async ({pathOfSettings}) => `Loading the ${FRAMEWORK_NAME} settings from path: ${pathOfSettings}`
    },
    [LOGGING_SETTINGS_MODULE_NOT_FOUND]: {
      category: MessageCategories.Error,
      callback: async (customArgs?: SettingsModuleNotFoundParameters) => `Your settings module was not found at ${customArgs?.pathOfModule}.`
    },
    [LOGGING_DATABASE_MODELS_NOT_FOUND]: {
      category: MessageCategories.Warn,
      callback: async ({appName}) => `Looks like the app ${appName} did not define any models.\n`+
        `If that's not intended behaviour, you should create the 'models.ts'/'models.js' file in the ${appName} app.`
    },
    [LOGGING_DATABASE_CLOSING]: {
      category: MessageCategories.Info,
      callback: async ({databaseName}) => `Closing the ${databaseName} database connection.`
    },
    [LOGGING_DATABASE_IS_NOT_CONNECTED]: {
      category: MessageCategories.Warn,
      callback: async ({databaseName}) => `${FRAMEWORK_NAME} wasn't able to connect to the '${databaseName}' database.`
    },
    [LOGGING_APP_START_SERVER]: {
      category: MessageCategories.Info,
      callback: async ({appName, port}) => `${appName} is running on port ${port}.\nPress Ctrl+C to quit.`
    },
    [LOGGING_APP_STOP_SERVER]: {
      category: MessageCategories.Info,
      callback: async ({appName}) => `${appName} server is stopping, running cleanup now.`
    }
  }

  stringByMessageType = {
    [MessageCategories.Debug]: '\x1b[32mDEBUG\x1b[0m',
    [MessageCategories.Info]: '\x1b[36mINFO\x1b[0m',
    [MessageCategories.Warn]: '\x1b[33mWARN\x1b[0m',
    [MessageCategories.Error]: '\x1b[31mERROR\x1b[0m'
  }

  async defaultLogInfo(): Promise<string> {
    return `\x1b[32m[${FRAMEWORK_NAME}]\x1b[0m \x1b[33m${new Date().toISOString()}\x1b[0m`
  }

  async appendMessage(
    messageName: string, category: MessageCategories, callback: MessagesCallbackType
  ): Promise<void> {

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

    const logMessage: string = `${await this.defaultLogInfo()} ` + 
      `${this.stringByMessageType[message.category]} ` + 
      `${await Promise.resolve(message.callback(customData))}`;

    switch (message.category) {
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
}

export default new Logging();