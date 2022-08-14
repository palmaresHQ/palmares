import Response from "./response";
import { BodyTypes } from "./response/types";

/**
 * Use this to throw exceptions inside of your app, like unauthorized users, or unauthenticated or
 * even bad request exceptions.
 *
 * This is a smaller Response class, you can define stuff like the body, the headers, even custom options
 * to the response.
 *
 * But please don't throw exceptions when the code is valid. It should be only used for 500 and 400 codes
 */
export default class HttpException<O = any> extends Error {
  status = 500;
  body: BodyTypes = '';
  headers: object = {};
  options!: O;
  cause?: unknown;

  constructor({
    status,
    body,
    headers,
    options,
    cause,
  }: {
    status?: number,
    body?: BodyTypes,
    options?: O;
    headers?: object
    cause?: Error
  }) {
    super();
    this.name = this.constructor.name;
    if (body) this.body = body;
    if (status) this.status = status;
    if (headers) this.headers = headers;
    if (options) this.options = options;
    if (cause) this.cause = cause
  }

  /**
   * Retrieves the response based on the arguments passed. By default we setup many default arguments
   * so by default we can always create an response.
   *
   * @returns - Returns the response for the request.
   */
  async getResponse() {
    const response = await Response.new(this.status, {
      headers: this.headers,
      body: this.body,
    });
    response.options = this.options;
    return response;
  }
}
