// @ts-nocheck
import { domain } from '@palmares/core';
import { serverDomainModifier } from '@palmares/server';

import routes from './routes';
import * as models from './models';

export default domain('core', import.meta.dirname, {
  /**
   * This doesn't do anything, it just adds type-safety of new methods you need to define on your domain.
   */
  modifiers: [serverDomainModifier, databaseDomainModifier],
  getModels: () => models,
  getRoutes: () => routes
});
