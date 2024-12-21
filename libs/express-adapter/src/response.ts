import { FileLike, serverResponseAdapter } from '@palmares/server';

import type { Response } from 'express';

export const responseAdapter = serverResponseAdapter({
  // eslint-disable-next-line ts/require-await
  redirect: async (_, __, serverRequestAndResponseData, status, headers, redirectTo) => {
    const { res } = serverRequestAndResponseData as { res: Response };
    if (headers) res.set(headers);
    res.redirect(status, redirectTo);
  },
  // eslint-disable-next-line ts/require-await
  send: async (_, __, serverRequestAndResponseData, status, headers, body) => {
    const { res } = serverRequestAndResponseData as { res: Response };
    if (headers) {
      res.set(headers);
      if (headers['Content-Type']) res.type(headers['Content-Type']);
    }
    if (typeof status === 'number') res.status(status);
    res.send(body);
  },
  stream: async (_, __, serverRequestAndResponseData, status, headers, body, isAsync) => {
    const { res } = serverRequestAndResponseData as { res: Response };
    if (headers) {
      res.set(headers);
      if (headers['Content-Type']) res.type(headers['Content-Type']);
    }

    if (typeof status === 'number') res.status(status);
    if (isAsync)
      for await (const chunk of body as AsyncGenerator<any, any, any>) {
        res.write(Buffer.from(chunk));
      }
    else
      for (const chunk of body as Generator<any, any, any>) {
        res.write(Buffer.from(chunk));
      }
    res.end();
  },
  sendFile: async (_, __, serverRequestAndResponseData, status, headers, body) => {
    const { res } = serverRequestAndResponseData as { res: Response };
    if (headers) {
      res.set(headers);
      if (headers['Content-Type']) res.type(headers['Content-Type']);
    }
    if (typeof status === 'number') res.status(status);
    if ((body as unknown as Blob) instanceof Blob) {
      const bodyAsBlob = body as unknown as Blob;
      res.type(bodyAsBlob.type);
      const arrayBuffer = await bodyAsBlob.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
      return;
    } else res.send(body);
  }
});
