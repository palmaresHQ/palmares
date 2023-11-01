import { domain } from '@palmares/core';
import { serverDomainModifier } from '@palmares/server';

import routes from './routes';

export default domain('admin', __dirname, {
  modifiers: [serverDomainModifier] as const,
  getRoutes: async () => routes,
});
