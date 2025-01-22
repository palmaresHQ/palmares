// @ts-nocheck
import { domain } from '@palmares/core';
import { serverDomainModifier } from '@palmares/server';
import { databaseDomainModifier } from '@palmares/databases';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

import { usersRoute } from './server';
import * as models from './database';
import * as migrations from './migrations';

import mainDomain from './core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default domain('orders', __dirname, {
  getRoutes: async () => usersRoute,
  getModels: async () => [models.User, models.Company],
  getMigrations: async () => migrations
});
