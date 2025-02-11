import { serverRequestAdapter } from '@palmares/server';

import type { VercelRequest } from '@vercel/node';

export default serverRequestAdapter({
  url: (
    _serveradapter,
    _server,
    serverRequestAndResponseData: { request: VercelRequest & Request; response: Response }
  ) => {
    return serverRequestAndResponseData.request.url || '';
  },
  headers: (
    _serverAdapter,
    _server,
    serverRequestAndResponseData: { request: VercelRequest & Request; response: Response },
    key
  ) => {
    const headerDataForKey = serverRequestAndResponseData.request.headers[key];
    if (typeof headerDataForKey === 'string') return headerDataForKey;
    return;
  },
  method: (
    _serverAdapter,
    _server,
    serverRequestAndResponseData: { request: VercelRequest & Request; response: Response }
  ) => {
    return serverRequestAndResponseData.request.method || '';
  },
  params: (_serveradapter, _server, _serverRequestAndResponseData: { request: Request; response: Response }, key) => {
    return '';
  },
  query: (
    _serveradapter,
    _server,
    serverRequestAndResponseData: { request: VercelRequest & Request; response: Response },
    key
  ) => {
    const queryDataForKey = serverRequestAndResponseData.request.query[key];
    if (Array.isArray(queryDataForKey)) return queryDataForKey.join(', ');
    if (typeof queryDataForKey === 'string') return queryDataForKey;
    return;
  },
  toArrayBuffer: async (
    _serveradapter,
    _server,
    serverRequestAndResponseData: { request: Request; response: Response }
  ) => {
    const buffer = await (serverRequestAndResponseData.request as any).arrayBuffer();
    return buffer;
  },
  toText: async (_serveradapter, _server, serverRequestAndResponseData: { request: Request; response: Response }) => {
    const text = await (serverRequestAndResponseData.request as any).text();
    return text;
  },
  toFormData: async (
    _serveradapter,
    _server,
    serverRequestAndResponseData: { request: Request; response: Response },
    formDataLike
  ) => {
    const formData = await (serverRequestAndResponseData.request as any).formData();

    return new formDataLike({
      getKeys: () => {
        return Array.from(formData.keys());
      },
      getValue: (key) => {
        const value = formData.getAll(key);
        return value.map((v: string | Blob | undefined | File) => ({
          value: v,
          fileName: ''
        }));
      }
    });
  },
  toRaw: async (_serveradapter, _server, serverRequestAndResponseData: { request: Request; response: Response }) => {
    const buffer = await (serverRequestAndResponseData.request as any).arrayBuffer();
    return buffer;
  },
  toBlob: async (_serveradapter, _server, serverRequestAndResponseData: { request: Request; response: Response }) => {
    const blob = await (serverRequestAndResponseData.request as any).blob();
    return blob;
  },
  toJson: async (_serveradapter, _server, serverRequestAndResponseData: { request: Request; response: Response }) => {
    const json = await (serverRequestAndResponseData.request as any).json();
    return json;
  }
});
