import {
  HTTP_200_OK,
  HTTP_302_FOUND,
  HTTP_500_INTERNAL_SERVER_ERROR,
  isRedirect,
  isServerError,
  isSuccess,
} from './status';
import { FileLike } from './utils';
import {
  DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_HTML,
  DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_JSON,
  DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_STREAM,
  DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_TEXT,
  DEFAULT_RESPONSE_HEADERS_CONTENT_DISPOSITION_KEY,
  DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY,
  DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY,
} from '../defaults';
import { formDataLikeFactory } from '../request/utils';

import type {
  RedirectionStatusCodes,
  StatusCodes} from './status';
import type { ResponseTypeType } from './types';
import type Request from '../request';
import type { FormDataLike } from '../request/types';

export default class Response<
  TBody extends
    | unknown
    | undefined
    | ArrayBuffer
    | Blob
    | FileLike
    | (() => AsyncGenerator<any, any, any> | Generator<any, any, any>)
    | string
    | object = undefined,
  TResponse extends {
    status?: StatusCodes;
    responses?: Record<string, (...args: any[]) => Response<any, any> | Promise<Response<any, any>>> | undefined;
    headers?: { [key: string]: string } | unknown;
    context?: object | unknown;
  } = {
    status: undefined;
    responses: undefined;
    headers: undefined;
    context: undefined;
  }
> {
  /**
   * This is data sent by the server, you can use it to translate your request and response during the lifecycle of Request/Response.
   *
   * Think like that, on express:
   *
   * ```ts
   * app.use((req, res, next) => {
   *   const serverRequestAndResponseData = { req, res };
   *   await wrappedHandler(serverRequestAndResponseData);
   * });
   * ```
   */
  private __serverRequestAndResponseData: any = undefined;
  private __error: Error | undefined = undefined;

  readonly url: string = '';
  readonly ok: boolean = false;
  readonly redirected: boolean = false;
  readonly type: ResponseTypeType = 'basic';
  readonly bodyUsed: boolean = false;

  readonly responses?: TResponse['responses'];
  statusText!: string;
  status!: TResponse['status'] extends StatusCodes ? TResponse['status'] : undefined;
  body!: TBody;
  headers!: TResponse['headers'] extends object ? TResponse['headers'] : undefined;
  context!: TResponse['context'] extends object ? TResponse['context'] : undefined;

  /**
   * # IMPORTANT
   * We advise you to use the static methods instead of this constructor directly, it will not set the headers and status correctly so it can lead to unexpected behavior.
   * Need to clone a response? Use the {@link Response.clone} method instead.
   *
   * @param body - The body of the response, it doesn't support FormData, but it supports Blob, ArrayBuffer, string and object.
   * @param options - The options of the response.
   */
  constructor(body?: TBody, options?: TResponse & { statusText?: string }) {
    const isAJsonObject =
      typeof body === 'object' &&
      body !== null &&
      !(body instanceof Blob) &&
      !(body instanceof FileLike) &&
      !(body instanceof ArrayBuffer);
    this.body = isAJsonObject ? (JSON.stringify(body) as unknown as TBody) : (body as TBody);
    this.context = options?.context as TResponse['context'] extends object ? TResponse['context'] : undefined;
    this.headers = options?.headers as TResponse['headers'] extends object ? TResponse['headers'] : undefined;
    this.status = options?.status as TResponse['status'] extends StatusCodes ? TResponse['status'] : undefined;
    this.statusText = options?.statusText as string;
    this.ok = options?.status ? isSuccess(options.status) : false;
    this.redirected = options?.status ? isRedirect(options.status) : false;
    this.type = options?.status ? (isServerError(options.status) ? 'error' : 'basic') : 'basic';
  }

  /**
   * This method is a factory method that should be used to send a response with a json body.
   *
   * By default, it will set the status to 200 and set the content-type header to application/json.
   *
   * @example
   * ```ts
   * import { Response, path } from '@palmares/server';
   *
   * path('/users').get(async () => {
   *   const users = await getUsers();
   *   return Response.json(users);
   * });
   * ```
   *
   * @param body - The body to send as json.
   * @param options - The options to pass to the response.
   *
   * @returns - A response with the status set to 200 and the content-type header set to application/json.
   */
  static json<
    TBody extends object | object[],
    TResponse extends {
      status?: StatusCodes;
      headers?: object | unknown;
      context?: object | unknown;
    } = {
      status: undefined;
      headers: undefined;
      context: undefined;
    }
  >(body: TBody, options?: TResponse) {
    const isStatusNotDefined = typeof options?.status !== 'number';
    const hasNotDefinedJsonHeader =
      (options?.headers as any)?.[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY] !==
      DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_JSON;

    // Define default status and statusText.
    if (isStatusNotDefined) {
      if (options) options.status = HTTP_200_OK;
      else options = { status: HTTP_200_OK } as TResponse;
      //options.statusText = typeof options.statusText === 'string' ? options.statusText : 'OK';
    }

    if (hasNotDefinedJsonHeader) {
      if (options) {
        if (options.headers)
          (options.headers as any)[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY] =
            DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_JSON;
        else
          options.headers = {
            [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_JSON,
          };
      } else
        options = {
          headers: { [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_JSON },
        } as TResponse;
    }

    const optionsFormatted = options as {
      context: TResponse['context'] extends object ? TResponse['context'] : undefined;
      headers: (TResponse['headers'] extends object ? TResponse['headers'] : object) & {
        [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: string;
      };
      status: TResponse['status'] extends StatusCodes ? TResponse['status'] : 200 | 201;
    };
    return new Response<TBody, typeof optionsFormatted>(JSON.stringify(body) as unknown as TBody, optionsFormatted);
  }

  /**
   * Streams a response back to the client. Instead of using a ReadableStream (which is not Supported by things like React Native.) We opted to use a generator function instead.
   * You just need to return a generator function that yields chunks of data, and we will stream it back to the client. Seems easy enough, right?
   *
   * @example
   * ```ts
   * import { Response, path } from '@palmares/server';
   *
   * path('/users').get(async () => {
   *   const users = await getUsers();
   *   return Response.stream(function* () {
   *     for (const user of users) {
   *       yield JSON.stringify(user);
   *     }
   *   });
   * });
   * ```
   *
   * @param body - The generator function to stream back to the client.
   * @param options - The options to pass to the response.
   *
   * @returns - A response with the status set to 200 and the content-type header set to application/octet-stream.
   */
  static stream<
    TBody extends () => AsyncGenerator<any, any, any> | Generator<any, any, any>,
    TResponse extends {
      status?: StatusCodes;
      headers?: object | unknown;
      context?: object | unknown;
    } = {
      status: undefined;
      headers: undefined;
      context: undefined;
    }
  >(body: TBody, options?: TResponse & { statusText?: string }) {
    const isStatusNotDefined = typeof options?.status !== 'number';
    const hasNotDefinedStreamHeader =
      (options?.headers as any)?.[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY] !==
      DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_STREAM;

    // Define default status and statusText.
    if (isStatusNotDefined) {
      if (options) options.status = HTTP_200_OK;
      else options = { status: HTTP_200_OK } as TResponse;
      options.statusText = typeof options.statusText === 'string' ? options.statusText : 'OK';
    }

    if (hasNotDefinedStreamHeader) {
      if (options) {
        if (options.headers)
          (options.headers as any)[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY] =
            DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_STREAM;
        else
          options.headers = {
            [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_STREAM,
          };
      } else
        options = {
          headers: { [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_JSON },
        } as TResponse;
    }

    const optionsFormatted = options as {
      context: TResponse['context'] extends object ? TResponse['context'] : undefined;
      headers: (TResponse['headers'] extends object ? TResponse['headers'] : object) & {
        [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: string;
      };
      status: TResponse['status'] extends StatusCodes ? TResponse['status'] : 200 | 201;
    };
    return new Response<TBody, typeof optionsFormatted>(body, optionsFormatted);
  }

  /**
   * Sends a response back to the client, by default it will set the status to 200 and we will try to retrieve the content-type from the Blob body sent.
   * If you also want to send the filename, you can pass it as the second argument using the `filename` key, OR you can send a FileLike object as the body.
   *
   * @example
   * ```ts
   * import { Response, FileLike, path } from '@palmares/server';
   *
   * path('/users').get(async () => {
   *      const blob = new Blob(['Hello, world!'], { type: 'text/plain;charset=utf-8' });
   *      return Response.file(blob, { filename: 'hello.txt' });
   * });
   *
   * // OR
   *
   * path('/users').get(async () => {
   *   const blob = new Blob(['Hello, world!'], { type: 'text/plain;charset=utf-8' });
   *   return Response.file(new FileLike(blob, 'hello.txt'));
   * });
   * ```
   *
   * @example
   * ```ts
   * import { Response, path } from '@palmares/server';
   *
   * path('/users').get(async () => {
   *   const blob = new Blob(['Hello, world!'], { type: 'text/plain;charset=utf-8' });
   *   return Response.file(blob);
   * });
   * ```
   *
   * @example
   * ```ts
   * import { Response, path } from '@palmares/server';
   *
   * path('/users').get(async () => {
   *   const blob = new Blob(['Hello, world!'], { type: 'text/plain;charset=utf-8' });
   *   const arrayBuffer = await blob.arrayBuffer();
   *   return Response.file(arrayBuffer);
   * });
   * ```
   *
   * @param body - The generator function to stream back to the client.
   * @param options - The options to pass to the response.
   *
   * @returns - A response with the status set to 200 and the content-type header set to application/octet-stream.
   */
  static file<
    TBody extends FileLike | ArrayBuffer | Blob,
    TResponse extends {
      status?: StatusCodes;
      headers?: object | unknown;
      context?: object | unknown;
    } = {
      status: undefined;
      headers: undefined;
      context: undefined;
    }
  >(body: TBody, options?: TResponse & { statusText?: string; filename?: string }) {
    // See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition for reference.
    // Also: https://stackoverflow.com/questions/60833644/getting-filename-from-react-fetch-call
    // Also: https://stackoverflow.com/questions/49286221/how-to-get-the-filename-from-a-file-downloaded-using-javascript-fetch-api
    // I concluded we should use Content-Disposition for this.
    const isStatusNotDefined = typeof options?.status !== 'number';
    const hasNotDefinedFileHeader =
      typeof (options?.headers as any)?.[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY] !== 'string' &&
      typeof (options?.headers as any)?.[DEFAULT_RESPONSE_HEADERS_CONTENT_DISPOSITION_KEY] !== 'string';

    // Define default status and statusText.
    if (isStatusNotDefined) {
      if (options) options.status = HTTP_200_OK;
      else options = { status: HTTP_200_OK } as TResponse;
      options.statusText = typeof options.statusText === 'string' ? options.statusText : 'OK';
    }

    if (hasNotDefinedFileHeader && (body instanceof FileLike || body instanceof Blob)) {
      const contentType = body instanceof FileLike ? body.blob.type : body.type;
      const fileName = body instanceof FileLike ? body.name : options?.filename ? options.filename : undefined;
      if (options) {
        if (options.headers) {
          if (!(options.headers as any)[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY])
            (options.headers as any)[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY] = contentType;
          if (!(options.headers as any)[DEFAULT_RESPONSE_HEADERS_CONTENT_DISPOSITION_KEY])
            (options.headers as any)[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY] =
              `attachment` + (fileName ? `; filename="${fileName}"` : '');
        } else {
          options.headers = {
            [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: contentType,
            [DEFAULT_RESPONSE_HEADERS_CONTENT_DISPOSITION_KEY]:
              `attachment` + (fileName ? `; filename="${fileName}"` : ''),
          };
        }
      } else
        options = {
          headers: {
            [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: contentType,
            [DEFAULT_RESPONSE_HEADERS_CONTENT_DISPOSITION_KEY]:
              `attachment` + (fileName ? `; filename="${fileName}"` : ''),
          },
        } as TResponse;
    }

    const optionsFormatted = options as {
      context: TResponse['context'] extends object ? TResponse['context'] : undefined;
      headers: (TResponse['headers'] extends object ? TResponse['headers'] : object) & {
        [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: string;
        [DEFAULT_RESPONSE_HEADERS_CONTENT_DISPOSITION_KEY]: string;
      };
      status: TResponse['status'] extends StatusCodes ? TResponse['status'] : 200 | 201;
    };
    return new Response<TBody extends FileLike ? TBody['blob'] : TBody, typeof optionsFormatted>(
      body as TBody extends FileLike ? TBody['blob'] : TBody,
      optionsFormatted
    );
  }

  /**
   * This method should be used to redirect to another page.
   * By default, it will set the status to 302 and set the location header to the url passed as argument.
   *
   * @param url - The url to redirect to.
   * @param options - The options to pass to the response.
   *
   * @example
   * ```ts
   * import { Response, path } from '@palmares/server';
   *
   * path('/login').post(async (request) => {
   *   const { username, password } = await request.json();
   *   if (username === 'admin' && password === 'admin') return Response.redirect('/admin');
   *   return Response.redirect('/login');
   * });
   * ```
   *
   * @returns - A response with the status set to 302 and the location header set to the url passed as argument.
   */
  static redirect<
    TUrl extends string,
    TResponse extends {
      status?: RedirectionStatusCodes;
      headers?: object | unknown;
      context?: object | unknown;
    } = {
      status: undefined;
      headers: undefined;
      context: undefined;
    }
  >(url: TUrl, options?: TResponse) {
    if (options) {
      if (options.headers) (options.headers as any)[DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY] = url;
      else options.headers = { [DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY]: url };
    } else options = { headers: { [DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY]: url } } as TResponse;

    options.status = HTTP_302_FOUND;

    const optionsFormatted = options as {
      context: TResponse['context'] extends object ? TResponse['context'] : undefined;
      headers: TResponse['headers'] extends object
        ? TResponse['headers']
        : object & {
            [DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY]: TUrl;
          };
      status: TResponse['status'] extends StatusCodes ? TResponse['status'] : 302;
    };
    return new Response<undefined, typeof optionsFormatted>(undefined, optionsFormatted);
  }

  /**
   * Factory method to create a response with a html body. This will set the content-type header to text/html.
   *
   * @example
   * ```
   * import { Response, path } from '@palmares/server';
   *
   * path('/users').get(async () => {
   *    return Response.html('<h1>Hello World</h1>');
   * });
   * ```
   *
   * @param htmlBody - The html body to send as a string.
   * @param options - The options to pass to the response object.
   *
   * @returns - A response with the status set to 200 and the content-type header set to text/html.
   */
  static html<
    TResponse extends {
      status?: StatusCodes;
      headers?: object | unknown;
      context?: object | unknown;
    } = {
      status: undefined;
      headers: undefined;
      context: undefined;
    }
  >(htmlBody: string, options?: TResponse & { statusText?: string }) {
    const isStatusNotDefined = typeof options?.status !== 'number';
    const hasNotDefinedJsonHeader =
      (options?.headers as any)?.[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY] !==
      DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_HTML;

    if (isStatusNotDefined) {
      if (options) options.status = HTTP_200_OK;
      else options = { status: HTTP_200_OK } as TResponse;
      options.statusText = typeof options.statusText === 'string' ? options.statusText : 'OK';
    }

    if (hasNotDefinedJsonHeader) {
      if (options) {
        if (options.headers)
          (options.headers as any)[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY] =
            DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_HTML;
        else
          options.headers = {
            [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_HTML,
          };
      } else
        options = {
          headers: { [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_HTML },
        } as TResponse;
    }

    const optionsFormatted = options as {
      context: TResponse['context'] extends object ? TResponse['context'] : undefined;
      headers: (TResponse['headers'] extends object ? TResponse['headers'] : object) & {
        [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: 'text/html';
      };
      status: TResponse['status'] extends StatusCodes ? TResponse['status'] : 200 | 201;
    };
    return new Response<string, typeof optionsFormatted>(htmlBody, optionsFormatted);
  }

  /**
   * Factory method to create a response with a html body. This will set the content-type header to text/html.
   *
   * @example
   * ```
   * import { Response, path } from '@palmares/server';
   *
   * path('/users').get(async () => {
   *    return Response.html('<h1>Hello World</h1>');
   * });
   * ```
   *
   * @param htmlBody - The html body to send as a string.
   * @param options - The options to pass to the response object.
   *
   * @returns - A response with the status set to 200 and the content-type header set to text/html.
   */
  static text<
    TResponse extends {
      status?: StatusCodes;
      headers?: object | unknown;
      context?: object | unknown;
    } = {
      status: undefined;
      headers: undefined;
      context: undefined;
    }
  >(text: string, options?: TResponse & { statusText?: string }) {
    const isStatusNotDefined = typeof options?.status !== 'number';
    const hasNotDefinedJsonHeader =
      (options?.headers as any)?.[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY] !==
      DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_TEXT;

    if (isStatusNotDefined) {
      if (options) options.status = HTTP_200_OK;
      else options = { status: HTTP_200_OK } as TResponse;
      options.statusText = typeof options.statusText === 'string' ? options.statusText : 'OK';
    }

    if (hasNotDefinedJsonHeader) {
      if (options) {
        if (options.headers)
          (options.headers as any)[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY] =
            DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_TEXT;
        else
          options.headers = {
            [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_TEXT,
          };
      } else
        options = {
          headers: { [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_TEXT },
        } as TResponse;
    }

    const optionsFormatted = options as {
      context: TResponse['context'] extends object ? TResponse['context'] : undefined;
      headers: (TResponse['headers'] extends object ? TResponse['headers'] : object) & {
        [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: 'plain/text';
      };
      status: TResponse['status'] extends StatusCodes ? TResponse['status'] : 200 | 201;
    };
    return new Response<string, typeof optionsFormatted>(text, optionsFormatted);
  }

  /**
   * This method should be used to send a response with a 500 status code. It will NOT call the error handler.
   *
   * @example
   * ```ts
   * import { Response, path } from '@palmares/server';
   *
   * path('/users').get(async () => {
   *   const users = await getUsers();
   *   return Response.error();
   * });
   * ```
   *
   * @returns - A response with the status set to 500.
   */
  static error() {
    return new Response<undefined, { status: StatusCodes }>(undefined, { status: HTTP_500_INTERNAL_SERVER_ERROR });
  }

  /**
   * You know? Sometimes s*it happens, and you need to send an error back to the client. This method is used so you can retrieve the error metadata. This is helpful on the `handler500` on your settings.
   * You can also extract errors on custom middlewares so you can properly handle them.
   *
   * @example
   * ```ts
   * import { middleware, Response, path } from '@palmares/server';
   *
   * const validationMiddleware = middleware({
   *   response: (response) => {
   *     const error = response.error();
   *     if (error) {
   *      // Do something with the error.
   *     }
   *     return response;
   *   }
   * });
   *
   *
   * path('/users').get(async () => {
   *    const users = await getUsers();
   *    throw new Error('Something went wrong');
   * }).middlewares([validationMiddleware]);
   * ````
   *
   * @returns - The error object.
   */
  error<TError extends Error = Error>() {
    return this.__error as TError;
  }

  /**
   * This method should be used to throw a {@link Response}. Throwing a Response will not trigger the `handler500` function.
   *
   * Use it when you want to throw stuff like 404, 403, 401, etc. This is a syntatic sugar for `throw Response(response)`.
   *
   * @example
   * ```ts
   * import { Response, path, HTTP_404_NOT_FOUND } from '@palmares/server';
   *
   * function fetchUsersOrThrow() {
   *   const users = await getUsers();
   *   if (!users) Response.json({ message: 'Users not found' }, { status: HTTP_404_NOT_FOUND }).throw();
   *   return users;
   * }
   *
   * path('/users').get(async () => {
   *    const users = await fetchUsersOrThrow();
   *    return Response.json(users);
   * });
   *
   */
  throw() {
    throw this;
  }

  /**
   * This is similar to the {@link Request.clone()} method. By default it will modify the response in place, but you can set
   * the `inPlace` option to false to return a new response.
   *
   * @param args - The arguments to pass to the new response.
   * @param options - The options to pass to the new response.
   */
  clone<
    TNewResponse extends {
      body?: object;
      status?: StatusCodes;
      headers?: object | unknown;
      context?: object | unknown;
    } = {
      body: never;
      status: undefined;
      headers: undefined;
      context: undefined;
    }
  >(args?: TNewResponse, options?: { inPlace: boolean }) {
    const isInPlace = options?.inPlace !== false;
    const newResponse = isInPlace
      ? this
      : new Response<
          TNewResponse['body'] extends never ? TBody : TNewResponse['body'],
          {
            status: TNewResponse['status'] extends StatusCodes ? TNewResponse['status'] : TResponse['status'];
            headers: TNewResponse['headers'] extends object ? TNewResponse['headers'] : TResponse['headers'];
            context: TNewResponse['context'] extends object
              ? TNewResponse['context'] & TResponse['context']
              : TResponse['context'];
          }
        >(args?.body ? args.body : (this.body as any), {
          headers: args?.headers ? args.headers : (this.headers as any),
          status: args?.status ? args.status : (this.status as any),
          context: args?.context ? { ...args.context, ...this.context } : this.context,
        });

    newResponse.__serverRequestAndResponseData = this.__serverRequestAndResponseData;
    (newResponse as any).url = this.url;

    if (args?.status) {
      (newResponse as any).ok = isSuccess(args.status);
      (newResponse as any).redirected = isRedirect(args.status);
      (newResponse as any).type = isServerError(args.status) ? 'error' : 'basic';
    }
    return newResponse;
  }

  /**
   * This method is used to get the underlying server data. This is similar to {@link Request.serverData()} method. This is useful usually on middlewares, not on handlers.
   * This is the underlying serverData. The documentation of this should be provided by the framework you are using underlined with Palmares.
   * So, the idea is simple, when a request is made, the underlying framework will call a callback we provide passing the data it needs to handle both
   * the request and the response. For Express.js for example this will be an object containing both the `req` and `res` objects. If for some reason you need
   * some data or some functionality we do not support by default you can, at any time, call this function and get this data.
   *
   * ### IMPORTANT
   *
   * It's not up for us to document this, ask the library author of the adapter to provide a documentation and properly type this.
   *
   * ### IMPORTANT2
   *
   * Understand that when you create a new instance of response we will not have the server data attached to it, so calling this method will return undefined.
   * You should use the request to attach the server data to the response. This method is useful for middlewares, and only that.
   *
   * @example
   * ```ts
   * // on settings.ts
   * import { ExpressServerAdapter } from '@palmares/express-adapter';
   * import ServerDomain from '@palmares/server';
   *
   * export default defineSettings({
   *   //...other configs,
   *   installedDomains: [
   *     [
   *       ServerDomain,
   *       {
   *          servers: {
   *            default: {
   *              server: ExpressServerAdapter,
   *              // ...other configs,
   *            },
   *          },
   *       },
   *    ],
   *  ],
   * });
   *
   * // on controllers.ts
   * import { middleware, path } from '@palmares/server';
   * import type { Request, Response } from 'express';
   *
   * const request = new Request();
   * request.serverData(); // undefined
   *
   * path('/test').get((request) => {
   *   const response = Response.json({ hello: 'World' });
   *   response.serverData(); // undefined, we have not appended the server data just yet, you should use request for that.
   *   return response
   * }).middlewares([
   *   middleware({
   *     response: (response) => {
   *       response.serverData(); // { req: Request, res: Response }
   *     }
   *   })
   * });
   * ```
   *
   * @returns - The underlying server data.
   */
  serverData<T>(): T {
    return this.__serverRequestAndResponseData;
  }

  /**
   * This method will extract the body of the response as a json object.
   * If the response is not a json response, it will return undefined.
   *
   * @example
   * ```ts
   * import { Response, path } from '@palmares/server';
   *
   * path('/users').get(async () => {
   *  const users = await getUsers();
   *  const response = Response.json(users);
   *  await response.json(); // This will return the users object.
   *  return response;
   * });
   * ```
   *
   * @returns - The body of the response as a json object.
   */
  // eslint-disable-next-line ts/require-await
  async json() {
    const isNotAJsonResponse =
      (this.headers as any)?.[DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY] !==
        DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_JSON && typeof this.body !== 'string';
    if (isNotAJsonResponse) return undefined as TBody;
    return JSON.parse(this.body as string) as TBody;
  }

  /**
   * This method will extract the body of the response as a string.
   *
   * @example
   * ```ts
   * import { Response, path } from '@palmares/server';
   *
   * path('/users').get(async () => {
   *    const users = await getUsers();
   *    const response = Response.json(users);
   *    await response.text(); // This will return the users object as a string.
   *    return response;
   * });
   * ```
   *
   * @returns - The body of the response as a string.
   */
  async text() {
    if (typeof this.body === 'object') return JSON.stringify(this.body);
    else if (typeof this.body === 'string') return this.body;
    else if (this.body instanceof Blob) return (this.body as Blob).text();
    else return undefined;
  }

  async arrayBuffer() {
    if (this.body instanceof ArrayBuffer) return this.body;
    else if (this.body instanceof Blob) return this.body.arrayBuffer();
    else return undefined;
  }

  // eslint-disable-next-line ts/require-await
  async blob() {
    if (this.body instanceof Blob) return this.body;
    else if (this.body instanceof ArrayBuffer) return new Blob([this.body]);
    else return undefined;
  }

  /**
   * You can use this method to get the body of the response as a FormData, you cannot send FormData though, we don't currently support it.
   *
   * @example
   * ```ts
   * import { Response, path } from '@palmares/server';
   *
   * path('/users').post(async (request) => {
   *    const formData = await request.formData();
   *    const response = new Response(formData);
   *
   *    await response.formData() // This will return the formData passed as argument.
   *
   *    return response;
   * });
   * ```
   *
   * @returns - The body of the response as a {@link FormDataLike} object.
   */
  // eslint-disable-next-line ts/require-await
  async formData() {
    const formDataLike = formDataLikeFactory();
    if (this.body instanceof formDataLike) return this.body;
    else if (typeof this.body === 'object') {
      return new formDataLike({
        getKeys: () => Object.keys(this.body as object),
        getValue: (key: string) => (this.body as any)[key],
      });
    } else return undefined;
  }
}
