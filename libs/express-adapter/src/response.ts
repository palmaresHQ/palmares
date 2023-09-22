import { serverResponseAdapter } from '@palmares/server';

import type { Response } from 'express';

export default serverResponseAdapter({
  redirect: async (_server, serverRequestAndResponseData, status, headers, redirectTo) => {
    const { res } = serverRequestAndResponseData as { res: Response };
    if (headers) res.set(headers);
    res.redirect(status, redirectTo);
  },
  send: async (_server, serverRequestAndResponseData, status, headers, body) => {
    const { res } = serverRequestAndResponseData as { res: Response };
    if (headers) res.set(headers);
    if (typeof status === 'number') res.status(status);
    if ((body as unknown as Blob) instanceof Blob) {
      const bodyAsBlob = body as unknown as Blob;
      res.type(bodyAsBlob.type);
      const arrayBuffer = await bodyAsBlob.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } else res.send(body);
  },
});
