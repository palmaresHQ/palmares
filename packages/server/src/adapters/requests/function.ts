import { ServerRequestAdapter } from './class';

import type { ServerAdapter } from '..';
import type { Request } from '../../request';
import type { FormDataLike } from '../../request/types';
import type { ServerRouterAdapter } from '../routers';
import type { ServerlessAdapter } from '../serverless';

/**
 * Functional approach to creating a server adapter instead of the default class/inheritance approach.
 */
export function serverRequestAdapter<
  TUrlMethodFunction extends ServerRequestAdapter['url'],
  TMethodFunction extends ServerRequestAdapter['method'],
  THeadersFunction extends ServerRequestAdapter['headers'],
  TParamsFunction extends ServerRequestAdapter['params'],
  TQueryFunction extends ServerRequestAdapter['query'],
  TToJsonFunction extends ServerRequestAdapter['toJson'],
  TToFormDataFunction extends ServerRequestAdapter['toFormData'],
  TToArrayBufferFunction extends ServerRequestAdapter['toArrayBuffer'],
  TToBlobFunction extends ServerRequestAdapter['toBlob'],
  TToTextFunction extends ServerRequestAdapter['toText'],
  TToRawFunction extends ServerRequestAdapter['toRaw']
>(args: {
  /**
   * This should return the full concatenated url of the request, with domain and path.
   *
   * @example
   * ```ts
   * import { Request } from 'express';
   *
   * url: (_, serverRequestAndResponseData: { req: Request }) => {
   *   const { req } = serverRequestAndResponseData;
   *   return `${req.protocol}://${req.get('host')}${req.originalUrl}`;
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _serverRequestAndResponseData - The server request and response data that you have defined on
   * {@link ServerRouterAdapter.parseHandler} or {@link ServerRouterAdapter.parseHandlers} on the router.
   */
  url: TUrlMethodFunction;
  /**
   * This should return the method of the request. Casing doesn't matter, it should just follow this guide:
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
   *
   * @example
   * ```ts
   * import { Request } from 'express';
   *
   * method: (_server, serverRequestAndResponseData) => {
   *    const { req } = serverRequestAndResponseData as { req: Request };
   *    return req.method;
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _serverRequestAndResponseData - The server request and response data that you have defined on
   * {@link ServerRouterAdapter.parseHandler} or {@link ServerRouterAdapter.parseHandlers} on the router.
   *
   * @returns - The method of the request.
   */
  method: TMethodFunction;
  /**
   * Translates the headers from the server request to the headers of the request to the API. This is lazy loaded,
   * so it will only parse the headers when the user actually needs it.
   * In other words, it is a proxy, so you just need to extract each value of the header one by one. What is
   * expected is the user to pass the key of the header like that:
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
   *
   * We don't make assumptions so we do not transform it to lowerCase by default. Depending of your framework
   * you are totally free to do this for better parsing.
   *
   * @example
   * ```ts
   * import { Request } from 'express';
   *
   * headers: (_, serverRequestAndResponseData: { req: Request }, key) => {
   *    const lowerCasedKey = key.toLowerCase();
   *    const { req } = serverRequestAndResponseData;
   *
   *    return req.headers[lowerCasedKey];
   * },
   * ```
   *
   * @param _server -  The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _serverRequestAndResponseData - The server request and response data that you have defined on
   * {@link ServerRouterAdapter.parseHandler} or {@link ServerRouterAdapter.parseHandlers} on the router.
   * @param _key - The key of the header that the user wants to extract.
   *
   * @returns - The value of the header if it exists, otherwise undefined.
   */
  headers: THeadersFunction;
  /**
   * Translates the params from the server request to the params of the request to the API. This is lazy loaded, so
   * it will only parse the params when the user actually needs it.
   * In other words, it is a proxy, so you just need to extract each value of the param one by one. What is expected
   * is the user to pass the key of the param like that: https://expressjs.com/en/4x/api.html#req.params
   *
   * You don't need to worry about parsing, we parse it on our side, but if you do parse, no problem, we will
   * just ignore parsing on our end. But please note that this might introduce unexpected behavior to users. So make
   * sure to document it.
   *
   * @example
   * ```ts
   * import { Request } from 'express';
   *
   * params: (_, serverRequestAndResponseData: { req: Request }, key) => {
   *   const { req } = serverRequestAndResponseData;
   *   return req.params[key];
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _serverRequestAndResponseData - The server request and response data that you have defined on
   * {@link ServerRouterAdapter.parseHandler} or {@link ServerRouterAdapter.parseHandlers} on the router.
   * @param _key - The key of the param that the user wants to extract.
   *
   * @returns - The value of the param if it exists, otherwise undefined.
   */
  params?: TParamsFunction;
  /**
   * Translates the query from the server request to the query of the request to the API. This is lazy loaded, so it
   * will only parse the query when the user actually needs it.
   * In other words, it is a proxy, so you just need to extract each value of the query one by one. What is expected
   * is the user to pass the key of the query like that: https://expressjs.com/en/4x/api.html#req.query
   *
   * You don't need to worry about parsing, we parse it on our side, but if you do parse, no problem, we will just
   * ignore parsing on our end. But please note that this might introduce unexpected behavior to users. So make sure to
   * document it.
   *
   * @example
   * ```ts
   * import { Request } from 'express';
   *
   * query: (_, serverRequestAndResponseData: { req: Request }, key) => {
   *  const { req } = serverRequestAndResponseData;
   *  return req.query[key];
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _serverRequestAndResponseData - The server request and response data that you have defined on
   * {@link ServerRouterAdapter.parseHandler} or {@link ServerRouterAdapter.parseHandlers} on the router.
   * @param _key - The key of the query that the user wants to extract.
   *
   * @returns - The value of the query if it exists, otherwise undefined.
   */
  query: TQueryFunction;
  /**
   * When the request is a `application/json` request, this should return the parsed json. This is called when the
   * user calls the {@link Request.json} method.
   *
   * If you want to let users pass custom options to the {@link Request.json} method, you can override the
   * {@link customToJsonOptions} static method.
   * The user will then need to call this method (for intellisense) in order to pass custom options.
   *
   * @example
   * ```ts
   * import express, { Request } from 'express';
   *
   * toJson: (_, serverRequestAndResponseData: { req: Request }, options: Parameters<typeof express.json>) => {
   *   const { req } = serverRequestAndResponseData;
   *
   *   return new Promise((resolve) => {
   *     express.json(options)(req, undefined, () => {
   *      resolve(req.body);
   *     });
   *   });
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _serverRequestAndResponseData - The server request and response data that you have defined on
   * {@link ServerRouterAdapter.parseHandler} or {@link ServerRouterAdapter.parseHandlers} on the router.
   * @param _options - Any type of custom options that you want to be able to pass when converting to json.
   * If you want to support custom options, please override the {@link customToJsonOptions} static method.
   *
   * @returns - A promise that resolves to the parsed json.
   */
  toJson: TToJsonFunction;
  /**
   * This should return something when the request Content-Type is a `multipart/form-data` or
   * `application/x-www-form-urlencoded` request. This is lazy loaded, so it will only parse the data when you
   * actually need it.
   * Transforms the data to a FormData-like instance. FormData is not available on Node.js and other runtimes,
   * so in order to support it we have created a FormData-like class that follows the same api as the original FormData.
   *
   * see: https://developer.mozilla.org/en-US/docs/Web/API/FormData
   *
   * Because it's a custom class, we add some useful stuff like the ability to lazy load the data, so it will only
   * parse the data when you actually need it.
   *
   * @example
   * ```ts
   * import express, { Request } from 'express';
   *
   * toFormData: (server, serverRequestAndResponseData, formDataConstructor, isUrlEncoded, options) => {
   *   const serverInstanceAndSettings = servers.get(server.serverName);
   *   const { req, res } = serverRequestAndResponseData as { req: Request; res: Response };
   *
   *   return new Promise((resolve) => {
   *     let formDataOrUrlEncodedParser = isUrlEncoded
   *       ? serverInstanceAndSettings?.urlEncodedParser
   *       : serverInstanceAndSettings?.formDataParser;
   *
   *     if (isUrlEncoded && serverInstanceAndSettings && !serverInstanceAndSettings?.urlEncodedParser) {
   *       const urlEncodedParserSettings = serverInstanceAndSettings.settings.customServerSettings?.urlEncodedOptions;
   *
   *       serverInstanceAndSettings.urlEncodedParser = express.urlencoded({
   *         ...urlEncodedParserSettings,
   *         extended: true,
   *       });
   *      formDataOrUrlEncodedParser = serverInstanceAndSettings.urlEncodedParser;
   *    } else if (serverInstanceAndSettings && !serverInstanceAndSettings?.formDataParser) {
   *      const formDataParserSettings = serverInstanceAndSettings.settings.customServerSettings?.multerOptions;
   *
   *      serverInstanceAndSettings.formDataParser = multer(formDataParserSettings);
   *      formDataOrUrlEncodedParser = serverInstanceAndSettings.formDataParser;
   *    }
   *
   *    let middleware:
   *      | ReturnType<typeof express.urlencoded>
   *      | ReturnType<ReturnType<typeof multer>[keyof ReturnType<typeof multer>]>
   *      | undefined = undefined;
   *    if (isUrlEncoded && !formDataOrUrlEncodedParser) formDataOrUrlEncodedParser =
   *      express.urlencoded({ extended: true });
   *    else if (!isUrlEncoded && !formDataOrUrlEncodedParser) formDataOrUrlEncodedParser = multer();
   *
   *    const optionsOfParser = (options?.options || []) as any[];
   *    if (!isUrlEncoded) {
   *      const formDataParser = formDataOrUrlEncodedParser as ReturnType<typeof multer>;
   *      if (options && !isUrlEncoded) middleware =
   *        (formDataParser[options.type as keyof ReturnType<typeof multer>] as any)(...optionsOfParser);
   *      if (!middleware) middleware = formDataParser.any();
   *    } else middleware = formDataOrUrlEncodedParser as ReturnType<typeof express.urlencoded>;
   *
   *    middleware(req, res, () => {
   *      const formData = new formDataConstructor({
   *        getKeys: () => {
   *          const bodyKeys = Object.keys(req.body || {}) || [];
   *          if (req?.files) {
   *            if (Array.isArray(req.files)) {
   *              for (const file of req.files) bodyKeys.push(file.fieldname);
   *            } else bodyKeys.push(...Object.keys(req.files));
   *          }
   *          if (req?.file) bodyKeys.push(req.file.fieldname);
   *          return bodyKeys;
   *      },
   *      getValue: (name) => {
   *        const bodyKeys = Object.keys(req.body || {});
   *        for (const key of bodyKeys) {
   *          if (key === name)
   *            return [
   *              {
   *                value: req.body[key],
   *                filename: undefined,
   *              },
   *            ];
   *        }
   *
   *        if (req?.files) {
   *          if (Array.isArray(req.files)) {
   *            const files = [];
   *            for (const file of req.files) {
   *              if (file.fieldname === name)
   *                files.push({
   *                  value: new File([file.buffer], file.originalname, { type: file.mimetype }),
   *                  filename: file.originalname,
   *                });
   *            }
   *            return files;
   *          } else {
   *            const files = req.files[name];
   *            const filesArray = [];
   *
   *            for (const file of files) {
   *              if (file.fieldname === name)
   *                filesArray.push({
   *                  value: new File([file.buffer], file.originalname, { type: file.mimetype }),
   *                  filename: file.originalname,
   *                });
   *            }
   *            return filesArray;
   *          }
   *        }
   *
   *        if (req?.file)
   *          if (req.file.fieldname === name)
   *            return [
   *              {
   *                value: new File([req.file.buffer], req.file.originalname, { type: req.file.mimetype }),
   *                filename: req.file.originalname,
   *              },
   *            ];
   *         return [];
   *      },
   *    });
   *    resolve(formData);
   *   });
   *  });
   * }
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} adapter.
   * @param _serverRequestAndResponseData - The server request and response data that you have defined on
   * {@link ServerRouterAdapter.parseHandler} or {@link ServerRouterAdapter.parseHandlers} on the router.
   * @param _formDataConstructor - The constructor of the FormData-like class. It's a class so you should use
   * it like this: `new formDataConstructor()`. You can pass a custom proxyCallback, this will lazy load the
   * values when you actually need it. {@link FormDataLike}
   * @param _isUrlEncoded - Whether or not the request is a `application/x-www-form-urlencoded` request. If not,
   * it's a `multipart/form-data` request.
   * @param _options - Any type of custom options that you want to be able to pass when converting to FormData.
   * If you want to support custom options, please override the {@link customToFormDataOptions} static method.
   *
   * @returns -A promise that resolves to a FormData-like instance.
   */
  toFormData: TToFormDataFunction;
  /**
   * This should return the parsed ArrayBuffer of the request. This is called when the user calls the
   * {@link Request.arrayBuffer} method.
   *
   * If you want to let users pass custom options to the {@link Request.arrayBuffer} method, you can override
   * the {@link customToArrayBufferOptions} static method. The user will then need to call this method
   * (for intellisense) in order to pass custom options.
   *
   * @example
   * ```ts
   * import express, { Request } from 'express';
   *
   * toArrayBuffer: (_, serverRequestAndResponseData: { req: Request }, options: Parameters<typeof express.raw>) => {
   *  const { req } = serverRequestAndResponseData;
   *  return new Promise((resolve) => {
   *    express.raw(options)(req, undefined, () => {
   *      resolve(new ArrayBuffer([req.body]));
   *    });
   *   });
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _serverRequestAndResponseData - The server request and response data that you have defined on
   * {@link ServerRouterAdapter.parseHandler} or {@link ServerRouterAdapter.parseHandlers} on the router.
   * @param _options - Any type of custom options that you want to be able to pass when converting to ArrayBuffer.
   * If you want to support custom options, please override the {@link customToArrayBufferOptions} static method.
   *
   * @returns - A promise that resolves to the parsed ArrayBuffer.
   */
  toArrayBuffer: TToArrayBufferFunction;
  /**
   * This should return the parsed Blob of the request. This is called when the user calls the {@link Request.blob}
   * method. If you want to let users pass custom options to the {@link Request.blob} method, you can override the
   * {@link customToBlobOptions} static method. The user will then need to call this method (for intellisense) in
   * order to pass custom options.
   *
   * @example
   * ```ts
   * import express, { Request } from 'express';
   *
   * toBlob: (_, serverRequestAndResponseData: { req: Request }, options: Parameters<typeof express.raw>) => {
   *   const { req } = serverRequestAndResponseData;
   *   return new Promise((resolve) => {
   *     express.raw(options)(req, undefined, () => {
   *       resolve(new Blob([req.body]));
   *     });
   *   });
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _serverRequestAndResponseData - The server request and response data that you have defined on
   * {@link ServerRouterAdapter.parseHandler} or {@link ServerRouterAdapter.parseHandlers} on the router.
   * @param _options - Any type of custom options that you want to be able to pass when converting to Blob.
   * If you want to support custom options, please override the {@link customToBlobOptions} static method.
   *
   * @returns - A promise that resolves to the parsed Blob.
   */
  toBlob: TToBlobFunction;
  /**
   * Translates the request to a string. Should be used for text/plain requests.
   *
   * If you want to let users pass custom options to the {@link Request.text} method, you can override the
   * {@link customToTextOptions} static method. The user will then need to call this method (for intellisense)
   * in order to pass custom options.
   *
   * @example
   * ```ts
   * import express, { Request } from 'express';
   *
   * toText: (_, serverRequestAndResponseData: { req: Request }, options: Parameters<typeof express.raw>) => {
   *   const { req } = serverRequestAndResponseData;
   *   return new Promise((resolve) => {
   *     express.text(options)(req, undefined, () => {
   *       resolve(req.body);
   *     });
   *  });
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _serverRequestAndResponseData - The server request and response data that you have defined on
   * {@link ServerRouterAdapter.parseHandler} or {@link ServerRouterAdapter.parseHandlers} on the router.
   * @param _options - Any type of custom options that you want to be able to pass when converting to raw.
   * If you want to support custom options, please override the {@link customToTextOptions} static method.
   *
   * @returns A promise that resolves to a string.
   */
  toText: TToTextFunction;
  /**
   * This should return the parsed raw data of the request. This is called when the user calls the
   * {@link Request.raw} method. This should just return whatever you have on the body
   * of the request. You don't need to parse or anything like that.
   *
   * If you want to let users pass custom options to the {@link Request.raw} method, you can override the
   * {@link customToRawOptions} static method. The user will then need to call this method (for intellisense)
   * in order to pass custom options.
   *
   * @example
   * ```ts
   * import express, { Request } from 'express';
   *
   * toRaw: (_, serverRequestAndResponseData: { req: Request }, options: Parameters<typeof express.raw>) => {
   *   const { req } = serverRequestAndResponseData;
   *   return new Promise((resolve) => {
   *     express.raw(options)(req, undefined, () => {
   *       resolve(req.body);
   *    });
   *  });
   * },
   * ```
   *
   * @param _server - The {@link ServerAdapter} or {@link ServerlessAdapter} instance.
   * @param _serverRequestAndResponseData - The server request and response data that you have defined on
   * {@link ServerRouterAdapter.parseHandler} or {@link ServerRouterAdapter.parseHandlers} on the router.
   * @param _options - Any type of custom options that you want to be able to pass when converting to raw.
   * If you want to support custom options, please override the {@link customToRawOptions} static method.
   *
   * @returns - A promise that resolves to the parsed raw data.
   */
  toRaw: TToRawFunction;
}) {
  class CustomServerRequestAdapter extends ServerRequestAdapter {
    url = args.url;
    method = args.method;
    headers = args.headers;
    params = args.params;
    query = args.query;

    toJson = args.toJson;
    toFormData = args.toFormData;
    toArrayBuffer = args.toArrayBuffer;
    toBlob = args.toBlob;
    toText = args.toText;
    toRaw = args.toRaw;
  }

  return CustomServerRequestAdapter as {
    new (): ServerRequestAdapter & {
      url: TUrlMethodFunction;
      method: TMethodFunction;
      headers: THeadersFunction;
      params: TParamsFunction;
      query: TQueryFunction;
      toJson: TToJsonFunction;
      toFormData: TToFormDataFunction;
      toArrayBuffer: TToArrayBufferFunction;
      toBlob: TToBlobFunction;
      toText: TToTextFunction;
      toRaw: TToRawFunction;
    };
  };
}
