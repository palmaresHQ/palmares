import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';

import { User } from './models';
import * as migrations from './migrations';

export default domain('core', __dirname, {
  modifiers: [databaseDomainModifier] as const,
  getMigrations: async () => migrations,
  getModels: async () => [User],
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
