// @ts-nocheck
import { domain } from '@palmares/core';
import { serverDomainModifier } from '@palmares/server';
import { databaseDomainModifier } from '@palmares/databases';

import { usersRoute } from './server';
import * as models from './database';

export default domain('orders', import.meta.dirname, {
  modifiers: [databaseDomainModifier, serverDomainModifier] as const,
  getRoutes: async () => usersRoute,
  getModels: async () => [models.User, models.Company],
  getMigrations: async () => []
});
