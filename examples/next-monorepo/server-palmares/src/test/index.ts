import { domain } from '@palmares/core';
import { Response, path, serverDomainModifier } from '@palmares/server';

export default domain('test', __dirname, {
  modifiers: [serverDomainModifier] as const,
  getRoutes: () =>
    path('/test/api')
      .get(async () => {
        return Response.json({ message: 'Hello Serverless!' });
      })
});
