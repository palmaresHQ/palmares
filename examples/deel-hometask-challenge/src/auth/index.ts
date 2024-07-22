import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';
import { serverDomainModifier } from '@palmares/server';

import * as migrations from './migrations';
import * as models from './models';
import routes from './routes';

export default domain('auth', __dirname, {
  modifiers: [databaseDomainModifier, serverDomainModifier],
  getRoutes: () => routes,
  getMigrations: () => migrations,
  getModels: () => {
    return models;
  },
});
