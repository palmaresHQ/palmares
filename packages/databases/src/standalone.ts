import { domain, setDefaultStd } from '@palmares/core';

import { makeMigrations, migrate } from './commands';
import { loadDatabases } from './domain';
import { defaultSettings } from './settings';

import type { DatabaseAdapter } from './engine';
import type { DatabaseDomainInterface } from './interfaces';
import type { model as BaseModel } from './models';
import type { DatabaseSettingsType } from './types';
import type { Std } from '@palmares/core';

/**
 * Standalone database setup to be able to use it without Palmares framework.
 *
 * This tries to be as light weight as possible. What we do
 */
export function setDatabaseConfig(
  settings: DatabaseSettingsType & {
    std: Std | undefined;
    locations: {
      name: string;
      path: string;
      getModels: (
        engineInstance: DatabaseAdapter
      ) =>
        | Promise<Record<string, ReturnType<typeof BaseModel>> | ReturnType<typeof BaseModel>[]>
        | Record<string, ReturnType<typeof BaseModel>>
        | ReturnType<typeof BaseModel>[];
      getMigrations: () => Promise<any> | any;
    }[];
  }
) {
  if (settings.std) setDefaultStd(settings.std);

  const domains: DatabaseDomainInterface[] = [];
  for (const location of settings.locations) {
    const newDomainConstructor = domain(location.name, location.path, {
      getModels: location.getModels,
      getMigrations: location.getMigrations
    } as any);
    const initializedDomain = new newDomainConstructor() as DatabaseDomainInterface;

    domains.push(initializedDomain);
  }

  const [databases] = loadDatabases(domains);
  databases.settings = settings;

  return {
    makeMigrations: (args: { isEmpty?: true; useTs?: true }) =>
      makeMigrations(databases, {
        settings: settings as any,
        commandLineArgs: {
          keywordArgs: {
            useTs: typeof args.useTs === 'boolean' ? args.useTs : true,
            empty: args.isEmpty || false
          },
          positionalArgs: {}
        },
        domains: domains
      }),
    migrate: () =>
      migrate(databases, {
        settings: settings as any,
        domains: domains,
        commandLineArgs: {
          keywordArgs: {},
          positionalArgs: {}
        }
      }),
    load: async () => {
      const settingsWithDefault = defaultSettings(settings);
      await databases.init(settingsWithDefault, domains);
      // eslint-disable-next-line ts/no-unnecessary-condition
      if (databases) await Promise.all([databases.close()]);
    }
  };
}
