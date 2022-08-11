import { isSuccess } from "../status";
import { snakeCaseToCamelCase } from "../utils";
import { InvalidCookie, UseSetCookieInstead } from "./exceptions";
import { CookiesType, CookieOptionsType } from "./types";
import mimes from "../mimes";

/**
 * Should follow this api: https://developer.mozilla.org/en-US/docs/Web/API/Response
 */
export default class Response {
  readonly ok!: boolean;
  readonly cookies: CookiesType = {};
  readonly headers: any = {};
  readonly status!: number;
  readonly body!: any;
  readonly contentType!: string;

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
   * @param key - The key to update in the headers of the response.
   * @param value - The value to update in the headers of the response
   */
  async setHeader(key: string, value: string) {
    const formattedKey = snakeCaseToCamelCase(key);
    const isSetCookie = key === 'setCookie';
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

  async setType(contentType: string) {
    const mimeType = await (await mimes).getMime(contentType);
    if (mimeType) await this.setHeader('contentType', mimeType);
    else await this.setHeader('contentType', contentType);
  }

  /**
   * Taken from here with some small tweaks and changes:
   * https://github.com/expressjs/express/blob/master/lib/response.js#L111
   */
  async parseBody(body: string | number | boolean | object | Buffer) {
    let contentLength = 0;
    let encoding: string | undefined = undefined;
    let bodyChunk = body;
    let type;

    const hasContentTypeHeader = () => typeof this.headers.contentType === 'string';

    switch (typeof bodyChunk) {
      case 'number':
        if (!hasContentTypeHeader()) await this.setType('txt');
        break;
      case 'boolean':
        if (!hasContentTypeHeader()) await this.setType('txt');
        break;
      case 'string':
        if (!hasContentTypeHeader()) await this.setType('html');
        break;
      case 'object':
        const isBodyNull = bodyChunk === null;
        if (isBodyNull) bodyChunk = ''
        else if (Buffer.isBuffer(bodyChunk)) {
          if (!hasContentTypeHeader()) await this.setType('bin');
        } else {
          // send json;
        }
        break;
    }

    const bodyIsAString = typeof bodyChunk === 'string';
    if (bodyIsAString) {
      encoding = 'utf8';
      const contentType = this.headers.contentType;
      const typeIsAString = typeof type === 'string';
      if (typeIsAString) await this.setHeader('contentType', `${contentType}; charset=UTF-8`);
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

    /*
    // freshness
    if (req.fresh) this.statusCode = 304;

    // strip irrelevant headers
    if (204 === this.statusCode || 304 === this.statusCode) {
      this.removeHeader('Content-Type');
      this.removeHeader('Content-Length');
      this.removeHeader('Transfer-Encoding');
      chunk = '';
    }

    // alter headers for 205
    if (this.statusCode === 205) {
      this.set('Content-Length', '0')
      this.removeHeader('Transfer-Encoding')
      chunk = ''
    }

    if (req.method === 'HEAD') {
      // skip body for HEAD
      this.end();
    } else {
      // respond
      this.end(chunk, encoding);
    }*/
  }

  static async new({ status, headers, body, cookies }: { status: number, headers?: any, body: any, cookies?: string[]}) {
    const response = new this(status);
    if (body) await response.parseBody(body);
    if (cookies) await response.parseCookies(cookies);
    console.log(response.body)
    return response;
  }
}
