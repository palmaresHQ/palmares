// @ts-nocheck
import { domain } from '@palmares/core';
import { serverDomainModifier } from '@palmares/server';
import { databaseDomainModifier } from '@palmares/databases';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

import { usersRoute } from './server';
import * as models from './database';
import * as migrations from './migrations';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default domain('orders', __dirname, {
  getRoutes: async () => usersRoute,
  getModels: async () => [models.User, models.Company],
  getTests: () => [__dirname + '/tests.ts'],
  getMigrations: async () => migrations,
  commands: {
    seed: {
      description: 'Seed the database with some data. Used for testing.',
      keywordArgs: undefined,
      positionalArgs: undefined,
      handler: async () => {
        await models.Company.default.set((qs) =>
          qs
            .join(models.User, 'usersOfCompany', (qs) =>
              qs.data(
                {
                  id: 1,
                  firstName: 'Your mom',
                  email: 'sobigitdoesntfit@example.com'
                },
                {
                  id: 2,
                  firstName: 'Your dad',
                  email: 'missing@example.com'
                }
              )
            )
            .data({
              id: 1,
              name: 'Your family',
              isActive: true
            })
        );
      }
    }
  }
});
