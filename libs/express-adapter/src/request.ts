import { serverRequestAdapter } from '@palmares/server';
import express from 'express';
import { File } from 'buffer';
import multer from 'multer';

import { servers } from './server';
import type { ToFormDataOptions } from './types';
import { type Request, type Response } from 'express';

export default serverRequestAdapter({
  customToFormDataOptions<TType extends keyof ReturnType<typeof multer>>(args: ToFormDataOptions<TType>) {
    return args;
  },
  toArrayBuffer: async (server, serverRequestAndResponseData: { req: Request; res: Response }) => {
    const serverInstanceAndSettings = servers.get(server.serverName);
    const { req, res } = serverRequestAndResponseData;

    return new Promise((resolve) => {
      let rawBodyParser = serverInstanceAndSettings?.bodyRawParser;
      if (serverInstanceAndSettings && !serverInstanceAndSettings?.bodyRawParser) {
        const rawBodyParserSettings = serverInstanceAndSettings.settings.customServerSettings?.bodyRawOptions;

        serverInstanceAndSettings.bodyRawParser = express.raw(rawBodyParserSettings);
        rawBodyParser = serverInstanceAndSettings.bodyRawParser;
      }
      if (!rawBodyParser) rawBodyParser = express.raw();

      rawBodyParser(req, res, () => {
        resolve(new Blob([req.body]).arrayBuffer());
      });
    });
  },
  toBlob: async (server, serverRequestAndResponseData: { req: Request }) => {
    const serverInstanceAndSettings = servers.get(server.serverName);
    const { req, res } = serverRequestAndResponseData as { req: Request; res: Response };

    return new Promise((resolve) => {
      let rawBodyParser = serverInstanceAndSettings?.bodyRawParser;
      if (serverInstanceAndSettings && !serverInstanceAndSettings?.bodyRawParser) {
        const rawBodyParserSettings = serverInstanceAndSettings.settings.customServerSettings?.bodyRawOptions;

        serverInstanceAndSettings.bodyRawParser = express.raw(rawBodyParserSettings);
        rawBodyParser = serverInstanceAndSettings.bodyRawParser;
      }
      if (!rawBodyParser) rawBodyParser = express.raw();

      rawBodyParser(req, res, () => {
        resolve(req.body);
      });
    });
  },
  toJson: async (server, serverRequestAndResponseData: { req: Request }) => {
    const serverInstanceAndSettings = servers.get(server.serverName);
    const { req, res } = serverRequestAndResponseData as { req: Request; res: Response };

    return new Promise((resolve) => {
      let jsonParser = serverInstanceAndSettings?.jsonParser;
      if (serverInstanceAndSettings && !serverInstanceAndSettings?.jsonParser) {
        const jsonParserSettings = serverInstanceAndSettings.settings.customServerSettings?.jsonOptions;

        serverInstanceAndSettings.jsonParser = express.json(jsonParserSettings);
        jsonParser = serverInstanceAndSettings.jsonParser;
      }
      if (!jsonParser) jsonParser = express.json();

      jsonParser(req, res, () => {
        resolve(req.body);
      });
    });
  },
  toFormData: async (
    server,
    serverRequestAndResponseData: { req: Request; res: Response },
    formDataConstructor,
    options: ToFormDataOptions<'any' | 'array' | 'fields' | 'none' | 'single'>
  ) => {
    const serverInstanceAndSettings = servers.get(server.serverName);
    const { req, res } = serverRequestAndResponseData as { req: Request; res: Response };

    return new Promise((resolve) => {
      let formDataParser = serverInstanceAndSettings?.formDataParser;
      if (serverInstanceAndSettings && !serverInstanceAndSettings?.formDataParser) {
        const formDataParserSettings = serverInstanceAndSettings.settings.customServerSettings?.multerOptions;

        serverInstanceAndSettings.formDataParser = multer(formDataParserSettings);
        formDataParser = serverInstanceAndSettings.formDataParser;
      }
      let upload: ReturnType<ReturnType<typeof multer>[keyof ReturnType<typeof multer>]> | undefined = undefined;
      if (!formDataParser) formDataParser = multer();
      const optionsOfParser = (options?.options || []) as any[];
      if (options) upload = (formDataParser[options.type] as any)(...optionsOfParser);
      if (!upload) upload = formDataParser.any();

      upload(req, res, () => {
        const formData = new formDataConstructor({
          getKeys: () => {
            const bodyKeys = Object.keys(req.body || {}) || [];
            if (req.files) {
              if (Array.isArray(req.files)) {
                for (const file of req.files) bodyKeys.push(file.fieldname);
              } else bodyKeys.push(...Object.keys(req.files));
            }
            if (req.file) bodyKeys.push(req.file.fieldname);
            return bodyKeys;
          },
          getValue: (name) => {
            const bodyKeys = Object.keys(req.body || {});
            for (const key of bodyKeys) {
              if (key === name)
                return [
                  {
                    value: req.body[key],
                    filename: undefined,
                  },
                ];
            }

            if (req.files) {
              if (Array.isArray(req.files)) {
                const files = [];
                for (const file of req.files) {
                  if (file.fieldname === name)
                    files.push({
                      value: new File([file.buffer], file.originalname, { type: file.mimetype }),
                      filename: file.originalname,
                    });
                }
                return files;
              } else {
                const files = req.files[name];
                const filesArray = [];

                for (const file of files) {
                  if (file.fieldname === name)
                    filesArray.push({
                      value: new File([file.buffer], file.originalname, { type: file.mimetype }),
                      filename: file.originalname,
                    });
                }
                return filesArray;
              }
            }

            if (req.file)
              if (req.file.fieldname === name)
                return [
                  {
                    value: new File([req.file.buffer], req.file.originalname, { type: req.file.mimetype }),
                    filename: req.file.originalname,
                  },
                ];

            return [];
          },
        });
        resolve(formData);
      });
    });
  },
  toText: async (server, serverRequestAndResponseData: { req: Request; res: Response }) => {
    const serverInstanceAndSettings = servers.get(server.serverName);
    const { req, res } = serverRequestAndResponseData;

    return new Promise((resolve) => {
      let textParser = serverInstanceAndSettings?.textParser;
      if (serverInstanceAndSettings && !serverInstanceAndSettings?.textParser) {
        const textParserSettings = serverInstanceAndSettings.settings.customServerSettings?.textOptions;

        serverInstanceAndSettings.textParser = express.text(textParserSettings);
        textParser = serverInstanceAndSettings.textParser;
      }
      if (!textParser) textParser = express.text();
      console.log(req.body);
      textParser(req, res, () => {
        resolve(req.body);
      });
    });
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
