import { domain } from '@palmares/core';
import { serverDomainModifier } from '@palmares/server';

import router from './routes';

export default domain('responses', __dirname, {
  modifiers: [serverDomainModifier] as const,
  getRoutes: async () => router,
});
