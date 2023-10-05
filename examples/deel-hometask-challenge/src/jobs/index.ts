import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';

import { Jobs } from './models';
import * as migrations from './migrations';

export default domain('jobs', __dirname, {
  modifiers: [databaseDomainModifier] as const,
  getMigrations: async () => migrations,
  getModels: async () => [Jobs],
  commands: {
    seedDb: {
      description: 'Seed the database with some data. Used for testing.',
      keywordArgs: undefined,
      positionalArgs: undefined,
      handler: async () => {
        console.log('Seeding the database...');
        // Do something else
      },
    },
  },
});
