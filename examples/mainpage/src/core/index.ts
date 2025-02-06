import { domain } from '@palmares/core';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import * as models from './database';
import * as migrations from './migrations';
import { usersRoute } from './server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default domain('orders', __dirname, {
  // eslint-disable-next-line ts/require-await
  getRoutes: async () => usersRoute,
  // eslint-disable-next-line ts/require-await
  getModels: async () => [models.User, models.Company],
  getTests: () => [__dirname + '/tests.ts'],
  // eslint-disable-next-line ts/require-await
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
