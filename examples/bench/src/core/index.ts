import { domain } from '@palmares/core';
import { serverDomainModifier, path, Response } from '@palmares/server';

export default domain('core', __dirname, {
  modifiers: [serverDomainModifier] as const,
  getRoutes: () => path('').nested((path) => [path('').get(async () => Response.text('Hello World!'))]),
});
