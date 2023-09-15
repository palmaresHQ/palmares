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
    res.status(status).send(body);
  },
});
