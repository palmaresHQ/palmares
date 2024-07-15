import { domain } from '@palmares/core';
import { testDomainModifier } from '@palmares/tests';
import { databaseDomainModifier } from '@palmares/databases';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import * as models from './models';
import { db } from '../settings';

export default domain('testingDatabases', __dirname, {
  commands: {
    migrate: {
      description: 'Migrate the database using drizzle',
      keywordArgs: undefined,
      positionalArgs: undefined,
      handler: async () => {
        migrate(db, { migrationsFolder: './.drizzle/migrations' });
      },
    }
  },
  modifiers: [testDomainModifier, databaseDomainModifier] as const,
  getMigrations: () => [],
  getModels: () => models,
  getTests: () => [__dirname + '/test.test.ts'],
});
