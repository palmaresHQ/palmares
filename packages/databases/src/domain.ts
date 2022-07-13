import { Domain, logging, MessageCategories, DefaultCommandType, DomainReadyFunctionArgs, DomainHandlerFunctionArgs } from "@palmares/core"

import { Model } from "./models";
import databases from "./databases";
import { DatabaseSettingsType } from "./types";
import {
  LOGGING_DATABASE_MODELS_NOT_FOUND,
  LOGGING_DATABASE_CLOSING,
  LOGGING_DATABASE_IS_NOT_CONNECTED,
  LOGGING_MIGRATIONS_NOT_FOUND
} from './utils';
import { MigrationFileType } from "./migrations/types";
import { makeMigrations } from "./commands";
import defaultSettings from "./settings";

export class DatabaseDomain extends Domain {
  async getModels(): Promise<typeof Model[]> {
    return [];
  }

  async getMigrations(): Promise<MigrationFileType[]> {
    return [];
  }
}

export default class DatabasesDomain extends DatabaseDomain {
  commands: DefaultCommandType = {
    makemigrations: {
      description: 'Create the migrations automatically based on your created models',
      example: '',
      handler: async (options: DomainHandlerFunctionArgs) => {
        await this.buildLogging();
        await makeMigrations(options);
      },
    }
  }

  constructor() {
    super(DatabasesDomain.name, __dirname);
  }

  async buildLogging() {
    logging.appendMessage(
      LOGGING_DATABASE_MODELS_NOT_FOUND,
      MessageCategories.Warn,
      async ({domainName}) =>  `\x1b[1m[databases]\x1b[0m Looks like the domain ${domainName} did not define any models.`+
      `\nIf that's not intended behavior, you should create the 'models.ts'/'models.js' file in the ${domainName} domain or ` +
      `add the 'getModels' to the domain class.`
    );
    logging.appendMessage(
      LOGGING_DATABASE_CLOSING,
      MessageCategories.Info,
      async ({databaseName}) => `\x1b[1m[databases]\x1b[0m Closing the '${databaseName}' database connection.`
    );
    logging.appendMessage(
      LOGGING_DATABASE_IS_NOT_CONNECTED,
      MessageCategories.Info,
      async ({databaseName}) => `\x1b[1m[databases]\x1b[0m Couldn't connect to the '${databaseName}' database.`
    );
    logging.appendMessage(
      LOGGING_MIGRATIONS_NOT_FOUND,
      MessageCategories.Warn,
      async ({domainName}) => `\x1b[1m[databases]\x1b[0m No migrations were found for the '${domainName}', if this is ` +
      `your first time running this command, you can safely ignore this message.\n\nYou can fully dismiss this message ` +
      `by setting 'DATABASES_DISMISS_NO_MIGRATIONS_LOG = true;' in 'settings.(ts/js)'`
    );
  }

  async ready({ settings, domains }: DomainReadyFunctionArgs<any, DatabaseSettingsType>): Promise<void> {
    await this.buildLogging();
    const settingsWithDefault = defaultSettings(settings);
    const databaseDomains = domains as DatabaseDomain[];
    await databases.init(settingsWithDefault, databaseDomains);
  }

  async getModels(): Promise<(typeof Model)[]> {
    return [];
  }

  async getMigrations(): Promise<MigrationFileType[]> {
    return [];
  }

  async close(): Promise<void> {
    await databases.close();
  }
}
