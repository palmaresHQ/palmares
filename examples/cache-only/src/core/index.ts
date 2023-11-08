import { domain } from '@palmares/core';
import { cache } from '@palmares/cache'
import { serverDomainModifier, path, Response } from '@palmares/server';

export default domain('core', __dirname, {
  modifiers: [
    serverDomainModifier
  ] as const,
  getRoutes: async () => path('').nested((path)=> [
    path('/test').get(async () => {
        await cache.set('test', 'myvalue')
        return Response.json({ hello: 'world'})
    }),
    path('/get').get(async() => {
      const message = await cache.get('test')
      return Response.json({ value: message})
    })
  ])
});
