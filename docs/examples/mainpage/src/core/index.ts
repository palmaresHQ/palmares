// @ts-nocheck
import { domain } from '@palmares/core';
import { serverDomainModifier } from '@palmares/server';

import { usersRoute } from './routes';
import { databaseDomainModifier } from '@palmares/databases';
import * as models from './models';

export default domain('orders', import.meta.dirname, {
  modifiers: [databaseDomainModifier, serverDomainModifier] as const,
  getRoutes: async () => usersRoute,
  getModels: async () => [models.User, models.Company],
  getMigrations: async () => []
});
