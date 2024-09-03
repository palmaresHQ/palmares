import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';
import { serverDomainModifier } from '@palmares/server';

import * as migrations from './migrations';
import { Jobs } from './models';
import routes from './routes';

export default domain('jobs', __dirname, {
  modifiers: [databaseDomainModifier, serverDomainModifier] as const,
  getRoutes: async () => routes,
  getMigrations: async () => migrations,
  getModels: async () => [Jobs]
});
