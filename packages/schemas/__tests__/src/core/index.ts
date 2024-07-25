import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';
import { testDomainModifier } from '@palmares/tests';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

//import * as models from './models';
import { db } from '../settings';

export default domain('testingDrizzle', __dirname, {
  commands: {
    drizzleMigrate: {
      description: 'Migrate the database using drizzle',
      keywordArgs: undefined,
      positionalArgs: undefined,
      handler: () => {
        migrate(db, { migrationsFolder: './.drizzle/migrations' });
      },
    }
  },
  modifiers: [testDomainModifier] as const,
  //getMigrations: () => [],
  //getModels: () => models,
  getTests: () => [__dirname + '/test.test.ts'],
});
