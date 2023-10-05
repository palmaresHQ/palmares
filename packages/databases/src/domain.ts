import { DomainReadyFunctionArgs, DomainHandlerFunctionArgs, domain } from '@palmares/core';

import { DatabaseSettingsType } from './types';
import { makeMigrations, migrate } from './commands';
import defaultSettings from './settings';
import { defaultMigrations, defaultModels } from './defaults';
import Databases from './databases';
import { DatabaseDomainInterface } from './interfaces';

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
      syntax: '',
      positionalArgs: undefined,
      keywordArgs: undefined,
      handler: async (options: DomainHandlerFunctionArgs) => {
        const [databases] = loadDatabases();
        await migrate(databases, options);
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
  getModels: async () => {
    return defaultModels;
  },
});
