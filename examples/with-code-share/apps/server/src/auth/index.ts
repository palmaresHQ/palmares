import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';
import { serverDomainModifier } from '@palmares/server';

import * as models from './models';
import route from './routes';

export default domain('auth', import.meta.dirname, {
  modifiers: [databaseDomainModifier, serverDomainModifier] as const,
  getModels: async () => models,
  getMigrations: async () => [],
  getRoutes: () => route
});
