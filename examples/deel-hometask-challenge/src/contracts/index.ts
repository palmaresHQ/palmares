import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';
import { serverDomainModifier } from '@palmares/server';

import * as migrations from './migrations';
import * as asModels from './models';
import routes from './routes';

export default domain('contracts', __dirname, {
  modifiers: [databaseDomainModifier, serverDomainModifier] as const,
  getRoutes: async () => routes,
  getMigrations: async () => migrations,
  getModels: async () => asModels,
});
