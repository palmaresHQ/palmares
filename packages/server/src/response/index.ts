import { isSuccess, HTTP_204_NO_CONTENT, HTTP_304_NOT_MODIFIED, HTTP_205_RESET_CONTENT } from "../status";
import { snakeCaseToCamelCase } from "../utils";
import { InvalidCookie, UseSetCookieInstead } from "./exceptions";
import { CookiesType, CookieOptionsType } from "./types";
import Mimes from "../mimes";

/**
 * Should follow this api: https://developer.mozilla.org/en-US/docs/Web/API/Response
 */
export default class Response {
  readonly ok!: boolean;
  readonly cookies: CookiesType = {};
  readonly headers: any = {};
  readonly status!: number;
  readonly contentType!: string;
  #body!: any;

  constructor(
    status: number,
  ) {
    this.ok = isSuccess(status);
    this.status = status;
  }

  /**
   * I don't know much about how headers work on browsers i know mostly that they are defined
   * in with a `Set-Cookie` header and that they have some arguments to it.
   *
   * You can see a full reference for the cookies here:
   * https://developer.mozilla.org/en-Us/docs/Web/HTTP/Headers/Set-Cookie
   *
   * By parsing them it should be easy to work with them in the response instance during the
   * request/response lifecycle, specially on middlewares.
   *
   * This should receive the cookies like `['cookieName1=cookieName1Value', 'cookieName2=cookieName2Value']`
   * send it as raw as possible so we are able to parse it inside of the req/res lifecycle.
   *
   * You might prefer to use the `setCookie` method.
   */
  async parseCookies(rawCookies: string[]) {
    for (const rawCookie of rawCookies) {

      let cookieKey: string | undefined = undefined;
      const splittedRawCookie = rawCookie.split(';');
      const cookieData = {} as CookieOptionsType;

      for (const cookie of splittedRawCookie) {

        const splittedCookie = cookie.split('=');
        const key = splittedCookie[0];
        const isPath = key === 'Path' || key === ' Path';
        const isExpires = key === 'Expires' || key === ' Expires';
        const isMaxAge = key === 'Max-Age' || key === ' Max-Age';
        const isDomain = key === 'Domain' || key === ' Domain';
        const isSecure = key === 'Secure' || key === ' Secure';
        const isHTTPOnly = key === 'HttpOnly' || key === ' HttpOnly';
        const isSameSite = key === 'SameSite' || key === ' SameSite'
        if (isPath) cookieData.path = splittedCookie[1];
        else if (isExpires) cookieData.expires = new Date(splittedCookie[1]);
        else if (isMaxAge) cookieData.maxAge = parseInt(splittedCookie[1]);
        else if (isDomain) cookieData.domain = splittedCookie[1];
        else if (isSecure) cookieData.secure = true;
        else if (isHTTPOnly) cookieData.httpOnly = true;
        else if (isSameSite) cookieData.sameSite = splittedCookie[1];
        else {
          const formattedKey = key.replace(/^(__Secure-)/, '').replace(/^(__Host-)/, '');
          cookieKey = formattedKey;
          this.cookies[formattedKey] = Object.assign(
            this.cookies[formattedKey] || {},
            {
              value: splittedCookie[1]
            }
          );
        }
      }
      const isCookieKeyNotDefined = typeof cookieKey !== 'string';
      if (isCookieKeyNotDefined) throw new InvalidCookie();
      const existingDataOnCookieKey = this.cookies[cookieKey as string];
      this.cookies[cookieKey as string] = { ...existingDataOnCookieKey, ...cookieData};
    }
  }

  /**
   * Sets the cookie on the response lifecycle, if a cookie exists for this key we will override it, if
   * it does not exist, creates a new one.
   *
   * @param key - The key of the cookie.
   * @param value - The value of the cookie.
   * @param options - (optional) Custom options for the cookie like it's max age, the expiration date
   * and so on.
   */
  async setCookie(key: string, value: string, options?: CookieOptionsType) {
    this.cookies[key] = {
      value,
      ...options
    };
  }

  /**
   * Set multiple cookies in "parallel" so you don't need to await multiple async methods.
   *
   * @param cookies - The cookies that you want to set in the response.
   */
  async setManyCookies(cookies: {key: string, value: string, options?: CookieOptionsType}[]) {
    const promises = cookies.map(async (cookie) => {
      await this.setCookie(cookie.key, cookie.value, cookie.options);
    });
    await Promise.all(promises);
  }

  /**
   * Deletes a key from the cookies by only calling `delete` on the object with the key.
   *
   * @param key - The key to the delete from the cookies.
   */
  async removeCookie(key: string) {
    delete this.cookies[key];
  }

  /**
   * Deletes multiple cookies at once.
   *
   * @param keys - All of the cookies you wish to delete.
   */
  async removeManyCookies(keys: string[]) {
    await Promise.all(keys.map(async (key) => this.removeCookie(key)));
  }

  /**
   * Adds a new header key and value if does not exist on the response or changes the existing
   * header value for the existing key.
   *
   * If we are setting the `contentType` we automatically update the `setType` in the response.
   *
   * @param key - The key to update in the headers of the response.
   * @param value - The value to update in the headers of the response
   */
  async setHeader(key: string, value: string) {
    const formattedKey = snakeCaseToCamelCase(key);
    const isContentType = key === 'contentType';
    const isSetCookie = key === 'setCookie';

    if (isContentType) {
      const contentTypeWithStrippedBoundingAndEncoding = value.split(';')[0];
      await this.setType(contentTypeWithStrippedBoundingAndEncoding);
    }
    if (isSetCookie) throw new UseSetCookieInstead();
    this.headers[formattedKey] = value;
  }

  /**
   * Sets multiple headers to the response so we don't need to await when setting multiple headers to the
   * same response.
   *
   * @param headers - An array with all of the headers you want to add in the response.
   */
  async setManyHeaders(headers: { key: string, value: string }[]) {
    const promises = headers.map(async (header) => {
      await this.setHeader(header.key, header.value);
    });
    await Promise.all(promises);
  }

  /**
   * Removes a specific header from the response.
   *
   * @param header - The header key you want to remove.
   */
  async removeHeader(header: string) {
    const formattedHeader = snakeCaseToCamelCase(header);
    delete this.headers[formattedHeader]
  }

  /**
   * Removes multiple headers from the response so you just need to await once.
   *
   * @param headers - The header keys you want to remove. Example: ['Content-Type', 'Content-Disposition']
   */
  async removeManyHeaders(headers: string[]) {
    await Promise.all(headers.map(async (header) => this.removeHeader(header)));
  }

  /**
   * Sets the content type of the response. By default it accept stuff like `text/plain` or
   * `application/json`.
   *
   * But you can also set stuff like `json`, or `txt`. Be aware that the second approach might have
   * some performance penalties on the first request.
   *
   * @param contentType - The content type of the response.
   */
  async setType(contentType: string) {
    const isAnActualMimeType = contentType.split('/').length > 1;
    if (isAnActualMimeType) await this.setHeader('contentType', contentType);
    else {
      const mimeType = await (await Mimes.new()).getMime(contentType);
      this.setHeader('contentType', mimeType);
    }
  }

  async parseJson(value: object) {
    const json = JSON.stringify(value);
    const isJsonAString = typeof json === 'string';
    if (isJsonAString) {
      return json.replace(/[<>&]/g, function (c) {
        switch (c.charCodeAt(0)) {
          case 0x3c:
            return '\\u003c'
          case 0x3e:
            return '\\u003e'
          case 0x26:
            return '\\u0026'
          default:
            return c
        }
      });
    }
    return json;
  }

  /**
   * Taken from here with some small tweaks and changes (we do not care for Etag here, let
   * middlewares take care of it):
   * https://github.com/expressjs/express/blob/master/lib/response.js#L111
   *
   * For more reference on Etags and why we bypass them: https://stackoverflow.com/a/67929691/13158385
   */
  async parseBody(body: string | number | boolean | object | Buffer) {
    let contentLength = 0;
    let encoding: string | undefined = undefined;
    let bodyChunk = body;

    const hasContentTypeHeader = () => typeof this.headers.contentType === 'string';

    switch (typeof bodyChunk) {
      case 'number':
        if (!hasContentTypeHeader()) await this.setType('text/plain');
        break;
      case 'boolean':
        if (!hasContentTypeHeader()) await this.setType('text/plain');
        break;
      case 'string':
        if (!hasContentTypeHeader()) await this.setType('text/html');
        break;
      case 'object':
        const isBodyNull = bodyChunk === null;
        const isBodyABuffer = Buffer.isBuffer(bodyChunk);
        if (isBodyNull) bodyChunk = ''
        else if (isBodyABuffer) {
          if (!hasContentTypeHeader()) await this.setType('application/octet-stream');
        } else {
          if (!hasContentTypeHeader()) await this.setType('application/json');
          const newBody = await this.parseJson(bodyChunk);
          await this.parseBody(newBody);
        }
        break;
    }

    const bodyIsAString = typeof bodyChunk === 'string';
    if (bodyIsAString) {
      encoding = 'utf8';
      const contentType = this.contentType;
      const contentTypeIsAString = typeof contentType === 'string';
      if (contentTypeIsAString) await this.setHeader('contentType', `${contentType}; charset=UTF-8`);
    }

    const chunkIsNotEmpty = bodyChunk !== undefined;
    if (chunkIsNotEmpty) {
      if (Buffer.isBuffer(bodyChunk)) {
        contentLength = bodyChunk.length;
      } else if ((bodyChunk as string).length < 1000) {
        contentLength = Buffer.byteLength(bodyChunk as any, encoding as any);
      } else {
        bodyChunk = Buffer.from(bodyChunk as any, encoding as any);
        encoding = undefined;
        contentLength = (bodyChunk as Buffer).length;
      }
      await this.setHeader('contentLength', contentLength.toString());
    }

    const isNoContentOrNotModified = [HTTP_204_NO_CONTENT, HTTP_304_NOT_MODIFIED].includes(this.status);
    if (isNoContentOrNotModified) {
      await this.removeManyHeaders([
        'contentType', 'contentLength', 'transferEncoding'
      ]);
      bodyChunk = '';
    }

    const isResetContent = this.status === HTTP_205_RESET_CONTENT;
    if (isResetContent) {
      await Promise.all([
        this.setHeader('contentLength', '0'),
        this.removeHeader('transferEncoding')
      ]);
      bodyChunk = '';
    }
    this.#body = bodyChunk;
  }

  static async new({ status, headers, body, cookies }: { status: number, headers?: any, body?: any, cookies?: string[]}) {
    const response = new this(status);
    if (body) await response.parseBody(body);
    if (cookies) await response.parseCookies(cookies);
    return response;
  }
}
