import { serverRequestAdapter } from '@palmares/server';
import { File } from 'buffer';
import express from 'express';
import { type Request, type Response } from 'express';
import multer from 'multer';

import { servers } from './server';

import type { ToFormDataOptions } from './types';

export const requestAdapter = serverRequestAdapter({
  customToFormDataOptions<TType extends keyof ReturnType<typeof multer>>(args: ToFormDataOptions<TType>) {
    return args;
  },
  // eslint-disable-next-line ts/require-await
  toRaw: async (_, __, _serverRequestAndResponseData, _options) => {
    return undefined;
  },
  toArrayBuffer: async (
    server,
    _,
    serverRequestAndResponseData: { req: Request; res: Response },
    options: Parameters<typeof express.raw>[0] = {}
  ) => {
    const serverInstanceAndSettings = servers.get(server.serverName);
    const { req, res } = serverRequestAndResponseData;

    return new Promise((resolve) => {
      let rawBodyParser = serverInstanceAndSettings?.bodyRawParser;
      if (serverInstanceAndSettings && !serverInstanceAndSettings.bodyRawParser) {
        const rawBodyParserSettings = {
          ...(serverInstanceAndSettings.settings.customServerSettings?.bodyRawOptions || {}),
          // eslint-disable-next-line ts/no-unnecessary-condition
          ...(options || {})
        };

        serverInstanceAndSettings.bodyRawParser = express.raw(rawBodyParserSettings);
        rawBodyParser = serverInstanceAndSettings.bodyRawParser;
      }
      if (!rawBodyParser) rawBodyParser = express.raw();

      rawBodyParser(req, res, () => {
        resolve(new Blob([req.body]).arrayBuffer());
      });
    });
  },
  toBlob: async (
    server,
    _,
    serverRequestAndResponseData: { req: Request },
    options: Parameters<typeof express.raw>[0] = {}
  ) => {
    const serverInstanceAndSettings = servers.get(server.serverName);
    const { req, res } = serverRequestAndResponseData as { req: Request; res: Response };

    return new Promise((resolve) => {
      let rawBodyParser = serverInstanceAndSettings?.bodyRawParser;
      if (serverInstanceAndSettings && !serverInstanceAndSettings.bodyRawParser) {
        const rawBodyParserSettings = {
          ...(serverInstanceAndSettings.settings.customServerSettings?.bodyRawOptions || {}),
          // eslint-disable-next-line ts/no-unnecessary-condition
          ...(options || {})
        };

        serverInstanceAndSettings.bodyRawParser = express.raw(rawBodyParserSettings);
        rawBodyParser = serverInstanceAndSettings.bodyRawParser;
      }
      if (!rawBodyParser) rawBodyParser = express.raw();

      rawBodyParser(req, res, () => {
        resolve(new Blob([req.body]));
      });
    });
  },
  toJson: async (
    server,
    _,
    serverRequestAndResponseData: { req: Request },
    options: Parameters<typeof express.json>[0] = {}
  ) => {
    const serverInstanceAndSettings = servers.get(server.serverName);
    const { req, res } = serverRequestAndResponseData as { req: Request; res: Response };
    return new Promise((resolve) => {
      let jsonParser = serverInstanceAndSettings?.jsonParser;
      if (serverInstanceAndSettings && !serverInstanceAndSettings.jsonParser) {
        const jsonParserSettings = {
          ...(serverInstanceAndSettings.settings.customServerSettings?.jsonOptions || {}),
          // eslint-disable-next-line ts/no-unnecessary-condition
          ...(options || {})
        };

        serverInstanceAndSettings.jsonParser = express.json(jsonParserSettings);
        jsonParser = serverInstanceAndSettings.jsonParser;
      }
      if (!jsonParser) jsonParser = express.json();

      jsonParser(req, res, () => {
        resolve(req.body);
      });
    });
  },
  /**
   * Since express doesn't have a built-in method for parsing form data, we use multer for this. Multer is from express
   * so it should serve most use cases.
   *
   * This handles both `multipart/form-data` and `application/x-www-form-urlencoded` requests. So this, by default, uses
   * both the `multer` and `urlencoded` methods from express.
   */
  toFormData: async (
    server,
    _serverInstance,
    serverRequestAndResponseData: { req: Request; res: Response },
    formDataConstructor,
    isUrlEncoded,
    options: ToFormDataOptions<'any' | 'array' | 'fields' | 'none' | 'single'>
  ) => {
    const serverInstanceAndSettings = servers.get(server.serverName);
    const { req, res } = serverRequestAndResponseData as { req: Request; res: Response };

    return new Promise((resolve) => {
      let formDataOrUrlEncodedParser = isUrlEncoded
        ? serverInstanceAndSettings?.urlEncodedParser
        : serverInstanceAndSettings?.formDataParser;

      if (isUrlEncoded && serverInstanceAndSettings && !serverInstanceAndSettings.urlEncodedParser) {
        const urlEncodedParserSettings = serverInstanceAndSettings.settings.customServerSettings?.urlEncodedOptions;

        serverInstanceAndSettings.urlEncodedParser = express.urlencoded({
          ...urlEncodedParserSettings,
          extended: true
        });
        formDataOrUrlEncodedParser = serverInstanceAndSettings.urlEncodedParser;
      } else if (serverInstanceAndSettings && !serverInstanceAndSettings.formDataParser) {
        const formDataParserSettings = serverInstanceAndSettings.settings.customServerSettings?.multerOptions;

        serverInstanceAndSettings.formDataParser = multer(formDataParserSettings);
        formDataOrUrlEncodedParser = serverInstanceAndSettings.formDataParser;
      }

      let middleware:
        | ReturnType<typeof express.urlencoded>
        | ReturnType<ReturnType<typeof multer>[keyof ReturnType<typeof multer>]>
        | undefined = undefined;
      if (isUrlEncoded && !formDataOrUrlEncodedParser)
        formDataOrUrlEncodedParser = express.urlencoded({ extended: true });
      else if (!isUrlEncoded && !formDataOrUrlEncodedParser) formDataOrUrlEncodedParser = multer();

      const optionsOfParser = (options.options || []) as any[];
      if (!isUrlEncoded) {
        const formDataParser = formDataOrUrlEncodedParser as ReturnType<typeof multer>;
        // eslint-disable-next-line ts/no-unnecessary-condition
        if (options && !isUrlEncoded)
          middleware = (formDataParser[options.type as keyof ReturnType<typeof multer>] as any)(...optionsOfParser);

        if (!middleware) middleware = formDataParser.any();
      } else middleware = formDataOrUrlEncodedParser as ReturnType<typeof express.urlencoded>;

      middleware(req, res, () => {
        const formData = new formDataConstructor({
          getKeys: () => {
            // eslint-disable-next-line ts/no-unnecessary-condition
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
                    filename: undefined
                  }
                ];
            }

            if (req.files) {
              if (Array.isArray(req.files)) {
                const files = [];
                for (const file of req.files) {
                  if (file.fieldname === name)
                    files.push({
                      value: new File([file.buffer as any], file.originalname, { type: file.mimetype }),
                      filename: file.originalname
                    });
                }
                return files;
              } else {
                const files = req.files[name];
                const filesArray = [];

                for (const file of files) {
                  if (file.fieldname === name)
                    filesArray.push({
                      value: new File([file.buffer as any], file.originalname, { type: file.mimetype }),
                      filename: file.originalname
                    });
                }
                return filesArray;
              }
            }

            if (req.file)
              if (req.file.fieldname === name)
                return [
                  {
                    value: new File([req.file.buffer as any], req.file.originalname, { type: req.file.mimetype }),
                    filename: req.file.originalname
                  }
                ];

            return [];
          }
        });
        resolve(formData);
      });
    });
  },
  toText: async (
    server,
    _,
    serverRequestAndResponseData: { req: Request; res: Response },
    options: Parameters<typeof express.text>[0] = {}
  ) => {
    const serverInstanceAndSettings = servers.get(server.serverName);
    const { req, res } = serverRequestAndResponseData;

    return new Promise((resolve) => {
      let textParser = serverInstanceAndSettings?.textParser;
      if (serverInstanceAndSettings && !serverInstanceAndSettings.textParser) {
        const textParserSettings = {
          ...(serverInstanceAndSettings.settings.customServerSettings?.textOptions || {}),
          // eslint-disable-next-line ts/no-unnecessary-condition
          ...(options || {})
        };

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
  headers: (_, __, serverRequestAndResponseData: { req: Request; res: Response }, key) => {
    const lowerCasedKey = key.toLowerCase();
    const serverRequestAndResponseDataWithCachedHeaders = serverRequestAndResponseData as {
      req: Request;
      res: Response;
      headers?: Record<string, string | undefined>;
    };
    const { req } = serverRequestAndResponseData as { req: Request; headers?: Record<string, string> };

    // eslint-disable-next-line ts/no-unnecessary-condition
    if (!req.headers) return undefined;
    if (
      serverRequestAndResponseDataWithCachedHeaders.headers &&
      serverRequestAndResponseDataWithCachedHeaders.headers[lowerCasedKey]
    )
      return serverRequestAndResponseDataWithCachedHeaders.headers[lowerCasedKey];
    if (!serverRequestAndResponseDataWithCachedHeaders.headers)
      serverRequestAndResponseDataWithCachedHeaders.headers = {};
    serverRequestAndResponseDataWithCachedHeaders.headers[lowerCasedKey] =
      req.headers[lowerCasedKey] === 'string'
        ? req.headers[lowerCasedKey]
        : Array.isArray(req.headers[lowerCasedKey])
          ? req.headers[lowerCasedKey].join(',')
          : undefined;
    return serverRequestAndResponseDataWithCachedHeaders.headers[lowerCasedKey];
  },
  params: (_, __, serverRequestAndResponseData, key) => {
    const { req } = serverRequestAndResponseData as { req: Request; params?: Record<string, any> };

    // eslint-disable-next-line ts/no-unnecessary-condition
    if (!req.params) return undefined;
    if (serverRequestAndResponseData.params && serverRequestAndResponseData.params[key])
      return serverRequestAndResponseData.params[key];
    if (!serverRequestAndResponseData.params) serverRequestAndResponseData.params = {};
    serverRequestAndResponseData.params[key] = req.params[key];
    return serverRequestAndResponseData.params[key];
  },
  query: (_, __, serverRequestAndResponseData, key) => {
    const { req } = serverRequestAndResponseData as { req: Request; query?: Record<string, any> };

    // eslint-disable-next-line ts/no-unnecessary-condition
    if (!req.query) return undefined;
    if (serverRequestAndResponseData.query && serverRequestAndResponseData.query[key])
      return serverRequestAndResponseData.query[key];
    if (!serverRequestAndResponseData.query) serverRequestAndResponseData.query = {};
    serverRequestAndResponseData.query[key] = req.query[key];
    return serverRequestAndResponseData.query[key];
  },
  method: (_, __, serverRequestAndResponseData) => {
    const { req } = serverRequestAndResponseData as { req: Request };
    return req.method;
  },
  url: (_, __, serverRequestAndResponseData) => {
    const { req } = serverRequestAndResponseData as { req: Request };
    return req.url;
  }
});
