import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';
import { serverDomainModifier } from '@palmares/server';

import * as models from './models';
import route from './routes';

export default domain('inventory', import.meta.dirname, {
  modifiers: [databaseDomainModifier, serverDomainModifier] as const,
  getModels: async () => models as any,
  getMigrations: async () => [],
  getRoutes: () => route
});
