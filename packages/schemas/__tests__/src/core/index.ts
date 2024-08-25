import { domain } from '@palmares/core';
import { testDomainModifier, } from '@palmares/tests';
import { databaseDomainModifier } from '@palmares/databases';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import * as models from './models';
import { db } from '../settings';

export default domain('testingDrizzle', __dirname, {
  commands: {
    drizzleMigrate: {
      description: 'Migrate the database using drizzle',
      keywordArgs: undefined,
      positionalArgs: undefined,
      handler: () => {
        migrate(db, { migrationsFolder: './.drizzle/migrations' });
      }
    }
  },
  modifiers: [testDomainModifier, databaseDomainModifier] as const,
  getMigrations: () => [],
  getModels: () => models,
  getTests: () => [
    __dirname + '/test.test.ts',
    __dirname + '/numbers.test.ts',
    __dirname + '/boolean.test.ts',
    __dirname + '/datetime.test.ts',
    __dirname + '/object.test.ts',
    __dirname + '/union.test.ts',
    __dirname + '/array.test.ts',
    __dirname + '/types.test.ts',
    __dirname + '/string.test.ts',
    __dirname + '/model.test.ts'
  ]
});
