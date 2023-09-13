import { serverResponseAdapter } from '@palmares/server';

import type { Request, Response } from 'express';

export default serverResponseAdapter({
  body: async (_, __, body) => {
    return body;
  },
  headers: async (_, __, headers) => {
    return headers;
  },
  status: async (_server, _serverRequestAndResponseData, _status) => {
    return _status;
  },
  send: async (_server, serverRequestAndResponseData, status, _headers, body) => {
    console.log('aqui');
    serverRequestAndResponseData.res.status(status).send(body);
  },
});
