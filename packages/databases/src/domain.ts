import {
  DomainReadyFunctionArgs,
  DomainHandlerFunctionArgs,
  domain,
} from '@palmares/core';

import buildLogging from './logging';
import { DatabaseSettingsType } from './types';
import { makeMigrations, migrate } from './commands';
import defaultSettings from './settings';
import { defaultMigrations, defaultModels } from './defaults';
import Databases from './databases';
import { DatabaseDomainInterface } from './interfaces';

/*export default class DatabasesDomain
  extends Domain
  implements DatabaseDomainInterface
{
  databases!: Databases;

  commands: DefaultCommandType = {
    makemigrations: {
      description:
        'Create the migrations automatically based on your created models',
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
      },
    },
  };

  constructor() {
    super(DatabasesDomain.name, __dirname);
  }

  async getModels(): Promise<ReturnType<typeof Model>[]> {
    return defaultModels;
  }

  async getMigrations(): Promise<MigrationFileType[]> {
    return defaultMigrations;
  }

  async loadDatabases() {
    this.databases = new Databases();
    return this.databases;
  }

  load(_: DatabaseSettingsType) {
    this.databases = new Databases();
  }

  override async ready(
    options: DomainReadyFunctionArgs<DatabaseSettingsType>
  ): Promise<void> {
    const { settings, domains } = options;
    await buildLogging();
    const settingsWithDefault = defaultSettings(settings);
    const databaseDomains = domains as DatabaseDomainInterface[];
    await Promise.all([
      (await this.loadDatabases()).init(settingsWithDefault, databaseDomains),
      Promise.resolve(super.ready ? super.ready(options) : null),
    ]);
  }

  override async close(): Promise<void> {
    await Promise.all([
      this.databases.close(),
      Promise.resolve(super.close ? super.close() : null),
    ]);
  }
}*/

let databases: Databases | undefined = undefined;
let cachedDatabaseDomains: DatabaseDomainInterface[] | undefined = undefined;

function loadDatabases(databaseDomains?: DatabaseDomainInterface[]) {
  if (Array.isArray(databaseDomains)) cachedDatabaseDomains = databaseDomains;
  if (!databases) databases = new Databases();
  return [databases, cachedDatabaseDomains] as const;
}

const databaseDomainModifier = domain<{
  getModels: () => Promise<any> | any;
  getMigrations: () => Promise<any> | any;
}>('@palmares/database', __dirname, {});

export { databaseDomainModifier };

export default domain('@palmares/database', __dirname, {
  modifiers: [databaseDomainModifier] as const,
  commands: {
    makemigrations: {
      description:
        'Create the migrations automatically based on your created models',
      positionalArgs: undefined,
      keywordArgs: {
        empty: {
          description: 'Creates an empty migration',
          hasFlag: true,
          type: 'string',
          canBeMultiple: true,
        },
      },
      handler: async (options: DomainHandlerFunctionArgs) => {
        const [databases] = loadDatabases();
        await buildLogging();
        await makeMigrations(databases, options);
      },
    },
    migrate: {
      description: 'Run the pending migrations on your database',
      syntax: '',
      positionalArgs: undefined,
      keywordArgs: undefined,
      handler: async (options: DomainHandlerFunctionArgs) => {
        const [databases] = loadDatabases();
        await buildLogging();
        await migrate(databases, options);
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  load: async (_: DatabaseSettingsType) => {
    return async (
      options: DomainReadyFunctionArgs<DatabaseSettingsType, any>
    ) => {
      await buildLogging();
      const databaseDomains = options.domains as DatabaseDomainInterface[];
      loadDatabases(databaseDomains);
    };
  },
  ready: async (
    options: DomainReadyFunctionArgs<DatabaseSettingsType, any>
  ) => {
    const [databases, databaseDomains] = loadDatabases();
    const settingsWithDefault = defaultSettings(options.settings);
    if (databases && databaseDomains)
      await databases.init(settingsWithDefault, databaseDomains);
  },
  close: async () => {
    const [databases] = loadDatabases();
    if (databases) await Promise.all([databases.close()]);
  },
  getMigrations: async () => defaultMigrations,
  getModels: async () => defaultModels,
});
