import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';
import { testDomainModifier } from '@palmares/tests';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import * as models from './models';
import { db } from '../settings';

export default domain('testingDrizzle', import.meta.dirname, {
  commands: {
    drizzleMigrate: {
      description: 'Migrate the database using drizzle',
      keywordArgs: undefined,
      positionalArgs: undefined,
      handler: () => {
        migrate(db as any, { migrationsFolder: './.drizzle/migrations' });
      }
    }
  },
  modifiers: [testDomainModifier, databaseDomainModifier] as const,
  getMigrations: () => [],
  getModels: () => models,
  getTests: () => [import.meta.dirname + '/drizzle.test.ts']
});
