import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';
import { serverDomainModifier } from '@palmares/server';

import { Profile } from './models';
import routes from './routes';
import * as migrations from './migrations';

export default domain('auth', __dirname, {
  modifiers: [databaseDomainModifier, serverDomainModifier] as const,
  getRoutes: async () => routes,
  getMigrations: async () => migrations,
  getModels: async () => [Profile],
});
