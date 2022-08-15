import {
  Domain,
  DefaultCommandType,
  DomainReadyFunctionArgs,
  DomainHandlerFunctionArgs,
} from "@palmares/core"

import { Model } from "./models";
import buildLogging from "./logging";
import { DatabaseSettingsType } from "./types";
import { MigrationFileType } from "./migrations/types";
import { makeMigrations, migrate } from "./commands";
import defaultSettings from "./settings";
import { defaultMigrations, defaultModels } from "./defaults";
import Databases from "./databases";

export class DatabaseDomain extends Domain {
  async getModels(): Promise<ReturnType<typeof Model>[]> {
    return defaultModels;
  }

  async getMigrations(): Promise<MigrationFileType[]> {
    return defaultMigrations;
  }
}

export default class DatabasesDomain extends DatabaseDomain {
  databases!: Databases;

  commands: DefaultCommandType = {
    makemigrations: {
      description: 'Create the migrations automatically based on your created models',
      example: '',
      handler: async (options: DomainHandlerFunctionArgs) => {
        await buildLogging();
        await makeMigrations(await this.loadDatabases(), options);
      },
    },
    migrate: {
      description: 'Run the pending migrations on your database',
      example: '',
      handler: async (options: DomainHandlerFunctionArgs) => {
        await buildLogging();
        await migrate(await this.loadDatabases(), options);
      }
    }
  }

  constructor() {
    super(DatabasesDomain.name, __dirname);
  }

  async loadDatabases() {
    this.databases = new Databases();
    return this.databases;
  }

  async ready(options: DomainReadyFunctionArgs<DatabaseSettingsType>): Promise<void> {
    const { settings, domains } = options;
    await buildLogging();
    const settingsWithDefault = defaultSettings(settings);
    const databaseDomains = domains as DatabaseDomain[];
    await Promise.all([
      (await this.loadDatabases()).init(settingsWithDefault, databaseDomains),
      super.ready(options)
    ]);
  }

  async close(): Promise<void> {
    await Promise.all([
      this.databases.close(),
      super.close()
    ]);
  }
}
