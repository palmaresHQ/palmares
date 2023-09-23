import { FileLike, pathNested, Response } from '@palmares/server';

import type { blobRouter, jsonRouter, textRouter, streamRouter, arrayBufferRouter } from './routes';

export const blobResponseController = pathNested<typeof blobRouter>()('').get(async () => {
  const blob = new Blob(['Hello, world!'], { type: 'text/plain;charset=utf-8' });
  return Response.file(blob);
});

export const arrayBufferController = pathNested<typeof arrayBufferRouter>()('').get(async () => {
  const blob = new Blob(['Hello, world!'], { type: 'text/plain;charset=utf-8' });
  const arrayBuffer = await blob.arrayBuffer();
  return Response.file(arrayBuffer);
});

export const jsonController = pathNested<typeof jsonRouter>()('').get(async () => {
  return Response.json({ hello: 'world' });
});

export const textController = pathNested<typeof textRouter>()('').get(async () => {
  return new Response('Hello, world!');
});

// Test this with $ curl http://localhost:4000/responses/stream --no-buffer
export const streamController = pathNested<typeof streamRouter>()('').get(async () => {
  return Response.stream(async function* () {
    yield 'Hello, ';
    await new Promise((resolve) => setTimeout(resolve, 1000));
    yield 'world!\n';
    await new Promise((resolve) => setTimeout(resolve, 1000));
    yield 'Streaming...\n';
    await new Promise((resolve) => setTimeout(resolve, 1000));
    yield 'is working!';
  });
});

export const fileController = pathNested<typeof streamRouter>()('').get(async () => {
  const blob = new Blob(['Hello, world!'], { type: 'text/plain;charset=utf-8' });
  return Response.file(new FileLike(blob, 'hello.txt'));
});
