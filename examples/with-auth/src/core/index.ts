import { domain } from '@palmares/core';
import { Response, path, serverDomainModifier } from '@palmares/server';
import { getAdapters } from 'packages/auth/dist/src/conf';

export default domain('core', import.meta.dirname, {
  modifiers: [serverDomainModifier],

  getRoutes: () =>
    path('/test').get(async () => {
      return getAdapters();
    })
});
