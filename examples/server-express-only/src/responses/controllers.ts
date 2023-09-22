import { pathNested, Response } from '@palmares/server';

import type { blobRouter, jsonRouter, textRouter } from '../requests/routes';

export const blobResponseController = pathNested<typeof blobRouter>()('').get(async () => {
  const blob = new Blob(['Hello, world!'], { type: 'text/plain;charset=utf-8' });
  return new Response(blob);
});

export const jsonController = pathNested<typeof jsonRouter>()('').get(async () => {
  return Response.json({ hello: 'world' });
});

export const textController = pathNested<typeof textRouter>()('').get(async () => {
  return new Response('Hello, world!');
});
