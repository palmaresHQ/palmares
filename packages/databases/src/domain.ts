import {
  Domain,
  DefaultCommandType,
  DomainReadyFunctionArgs,
  DomainHandlerFunctionArgs
} from "@palmares/core"

import { Model } from "./models";
import buildLogging from "./logging";
import databases from "./databases";
import { DatabaseSettingsType } from "./types";
import { MigrationFileType } from "./migrations/types";
import { makeMigrations, migrate } from "./commands";
import defaultSettings from "./settings";
import { defaultMigrations, defaultModels } from "./defaults";

export class DatabaseDomain extends Domain {
  async getModels(): Promise<ReturnType<typeof Model>[]> {
    return defaultModels;
  }

  async getMigrations(): Promise<MigrationFileType[]> {
    return defaultMigrations;
  }
}

export default class DatabasesDomain extends DatabaseDomain {
  commands: DefaultCommandType = {
    makemigrations: {
      description: 'Create the migrations automatically based on your created models',
      example: '',
      handler: async (options: DomainHandlerFunctionArgs) => {
        await buildLogging();
        await makeMigrations(options);
      },
    },
    migrate: {
      description: 'Run the pending migrations on your database',
      example: '',
      handler: async (options: DomainHandlerFunctionArgs) => {
        await buildLogging();
        await migrate(options);
      }
    }
  }

  constructor() {
    super(DatabasesDomain.name, __dirname);
  }

  async ready({ settings, domains }: DomainReadyFunctionArgs<any, DatabaseSettingsType>): Promise<void> {
    await buildLogging();
    const settingsWithDefault = defaultSettings(settings);
    const databaseDomains = domains as DatabaseDomain[];
    await databases.init(settingsWithDefault, databaseDomains);
  }

  async close(): Promise<void> {
    await databases.close();
  }
}
