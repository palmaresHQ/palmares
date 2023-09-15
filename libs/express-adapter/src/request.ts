import { serverRequestAdapter } from '@palmares/server';
import express, { type Request, type Response } from 'express';
import { servers } from './server';
import { ServerSettingsTypeExpress } from './types';

export default serverRequestAdapter({
  toArrayBuffer: async (_server, serverRequestAndResponseData: { req: Request }) => {
    const { req } = serverRequestAndResponseData as { req: Request };
    return req.body;
  },
  toBlob: async (_server, serverRequestAndResponseData: { req: Request }) => {
    const { req } = serverRequestAndResponseData as { req: Request };
    return req.body;
  },
  toJson: async (server, serverRequestAndResponseData: { req: Request }) => {
    const serverInstanceAndSettings = servers.get(server.serverName);
    const { req, res } = serverRequestAndResponseData as { req: Request; res: Response };
    return new Promise((resolve) => {
      let jsonParser = serverInstanceAndSettings?.jsonParser;
      if (serverInstanceAndSettings && !serverInstanceAndSettings?.jsonParser) {
        const jsonParserSettings = serverInstanceAndSettings.settings.customServerSettings?.jsonParser;

        serverInstanceAndSettings.jsonParser = express.json(jsonParserSettings);
        jsonParser = serverInstanceAndSettings.jsonParser;
      }
      if (!jsonParser) jsonParser = express.json();

      jsonParser(req, res, () => {
        resolve(req.body);
      });
    });
  },
  toFormData: async (_server, serverRequestAndResponseData: { req: Request }) => {
    const { req } = serverRequestAndResponseData as { req: Request };
    return req.body;
  },
  toText: async (_server, serverRequestAndResponseData: { req: Request }) => {
    const { req } = serverRequestAndResponseData as { req: Request };
    console.log(req.body);
    return req.body;
  },
  cookies: async (_server, serverRequestAndResponseData) => {
    const { req } = serverRequestAndResponseData as { req: Request };
    return req.cookies;
  },
  headers: (_, serverRequestAndResponseData, key) => {
    const { req } = serverRequestAndResponseData as { req: Request; headers?: Record<string, string> };

    if (!req.headers) return undefined;
    if (serverRequestAndResponseData.headers && serverRequestAndResponseData.headers[key])
      return serverRequestAndResponseData.headers[key];
    if (!serverRequestAndResponseData.headers) serverRequestAndResponseData.headers = {};
    serverRequestAndResponseData.headers[key] = req.headers[key];
    return serverRequestAndResponseData.headers[key];
  },
  params: (_server, serverRequestAndResponseData, key) => {
    const { req } = serverRequestAndResponseData as { req: Request; params?: Record<string, any> };

    if (!req.params) return undefined;
    if (serverRequestAndResponseData.params && serverRequestAndResponseData.params[key])
      return serverRequestAndResponseData.params[key];
    if (!serverRequestAndResponseData.params) serverRequestAndResponseData.params = {};
    serverRequestAndResponseData.params[key] = req.params[key];
    return serverRequestAndResponseData.params[key];
  },
  query: (_server, serverRequestAndResponseData, key) => {
    const { req } = serverRequestAndResponseData as { req: Request; query?: Record<string, any> };

    if (!req.query) return undefined;
    if (serverRequestAndResponseData.query && serverRequestAndResponseData.query[key])
      return serverRequestAndResponseData.query[key];
    if (!serverRequestAndResponseData.query) serverRequestAndResponseData.query = {};
    serverRequestAndResponseData.query[key] = req.query[key];
    return serverRequestAndResponseData.query[key];
  },
});
