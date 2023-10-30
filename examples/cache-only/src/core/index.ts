import { domain } from '@palmares/core';
import { serverDomainModifier, path, Response } from '@palmares/server';

export default domain('core', __dirname, {
  modifiers: [
    serverDomainModifier
  ] as const,
  getRoutes: async () => path('').nested((path)=> [
    path('/test').get(async () => {
        return Response.json({ hello: 'world'})
    })
  ])
});
