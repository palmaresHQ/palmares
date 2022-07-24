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
        await buildLogging();
        await makeMigrations(options);
      },
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
