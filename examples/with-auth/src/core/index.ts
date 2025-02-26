import { domain } from '@palmares/core';
import { Response, path, serverDomainModifier } from '@palmares/server';

export default domain('core', import.meta.dirname, {
  modifiers: [serverDomainModifier],

  getRoutes: () =>
    path('/test').get(async () => {
      return Response.json({ message: 'hello' });
    })
});
