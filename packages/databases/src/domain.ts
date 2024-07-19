import { DomainReadyFunctionArgs, DomainHandlerFunctionArgs, domain, SettingsType2 } from '@palmares/core';

import { DatabaseSettingsType } from './types';
import { makeMigrations, migrate } from './commands';
import defaultSettings from './settings';
import { defaultMigrations, defaultModels } from './defaults';
import Databases from './databases';
import { DatabaseDomainInterface } from './interfaces';
import { model as BaseModel } from './models';
import { DatabaseAdapter } from '.';

let databases: Databases | undefined = undefined;
let cachedDatabaseDomains: DatabaseDomainInterface[] | undefined = undefined;

function loadDatabases(databaseDomains?: DatabaseDomainInterface[]) {
  if (Array.isArray(databaseDomains)) cachedDatabaseDomains = databaseDomains;
  if (!databases) databases = new Databases();
  return [databases, cachedDatabaseDomains] as const;
}

const databaseDomainModifier = domain<{
  getModels: (engineInstance: DatabaseAdapter) => Promise<Record<string, ReturnType<typeof BaseModel>> | ReturnType<typeof BaseModel>[]> | Record<string, ReturnType<typeof BaseModel>> | ReturnType<typeof BaseModel>[];
  getMigrations: () => Promise<any> | any;
}>('@palmares/database', __dirname, {});

export { databaseDomainModifier };

export default domain('@palmares/database', __dirname, {
  modifiers: [databaseDomainModifier] as const,
  commands: {
    makemigrations: {
      description: 'Create the migrations automatically based on your created models',
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
        await makeMigrations(databases, options);
      },
    },
    migrate: {
      description: 'Run the pending migrations on your database',
      positionalArgs: undefined,
      keywordArgs: undefined,
      handler: async (options: DomainHandlerFunctionArgs) => {
        const [databases] = loadDatabases();
        await migrate(databases, options);
      },
    },
    ['load-models']: {
      description: 'Load the databases. For some engines, it will just create the models locally',
      positionalArgs: undefined,
      keywordArgs: undefined,
      handler: async (options: DomainHandlerFunctionArgs) => {
        const settingsAsDatabaseSettings = options.settings as DatabaseSettingsType & SettingsType2;
        const [databases] = loadDatabases();
        const settingsWithDefault = defaultSettings(settingsAsDatabaseSettings);
        await databases.init(settingsWithDefault, options.domains as DatabaseDomainInterface[]);
        if (databases) await Promise.all([databases.close()]);
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  load: async (_: DatabaseSettingsType) => {
    return async (options: DomainReadyFunctionArgs<DatabaseSettingsType, any>) => {
      const databaseDomains = options.domains as DatabaseDomainInterface[];
      loadDatabases(databaseDomains);
    };
  },
  ready: async (options: DomainReadyFunctionArgs<DatabaseSettingsType, any>) => {
    const [databases, databaseDomains] = loadDatabases();
    const settingsWithDefault = defaultSettings(options.settings);
    if (databases && databaseDomains) await databases.init(settingsWithDefault, databaseDomains);
  },
  close: async () => {
    const [databases] = loadDatabases();
    if (databases) await Promise.all([databases.close()]);
  },
  getMigrations: async () => defaultMigrations,
  getModels: async (engineInstance: DatabaseAdapter) => {
    if (engineInstance.migrations) return defaultModels;
    else return []
  },
});
