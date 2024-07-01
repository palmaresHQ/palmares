import { domain } from '@palmares/core';
import { Response, path, serverDomainModifier } from '@palmares/server';

export default domain('auth', __dirname, {
  modifiers: [serverDomainModifier] as const,
  getRoutes: () =>
    path('/auth')
      .get(async () => {
        return Response.json({ message: 'Hello Auth!' });
      })
});
