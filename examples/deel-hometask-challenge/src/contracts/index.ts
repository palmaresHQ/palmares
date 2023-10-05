import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';
import { serverDomainModifier } from '@palmares/server';

import routes from './routes';
import { Contract } from './models';
import * as migrations from './migrations';

export default domain('contracts', __dirname, {
  modifiers: [databaseDomainModifier, serverDomainModifier] as const,
  getRoutes: async () => routes,
  getMigrations: async () => migrations,
  getModels: async () => [Contract],
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
