import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';
import { migrate } from '@palmares/drizzle-engine/better-sqlite3/migrator';
import { testDomainModifier } from '@palmares/tests';

import * as models from './models';
import { db } from '../settings';

export default domain('testingDrizzle1', import.meta.dirname, {
  commands: {
    drizzleMigrate: {
      description: 'Migrate the database using drizzle',
      keywordArgs: undefined,
      positionalArgs: undefined,
      handler: () => {
        migrate(db, { migrationsFolder: './.drizzle/migrations' });
      }
    },
    helloWorld: {
      description: 'Greets you with a hello world message',
      keywordArgs: {
        appName: {
          description: 'Your application name',
          default: null,
          hasFlag: true
        }
      },
      positionalArgs: {
        name: {
          description: 'The name of the person to greet',
          required: true
        }
      },
      handler: ({ commandLineArgs }) => {
        console.log(`Hello ${commandLineArgs.positionalArgs['name']}, welcome to ${commandLineArgs.keywordArgs['appName'] || 'Palmares'}!`);
      }
    },
  },
  modifiers: [testDomainModifier, databaseDomainModifier] as const,
  getMigrations: () => [],
  getModels: () => models,
  getTests: () => [import.meta.dirname + '/drizzle.test.ts']
});
