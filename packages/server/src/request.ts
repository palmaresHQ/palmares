import { PathParamsParser, RawParamsType } from "./server/types";
import { FormattedQueryParamsType, HeadersType, PathParamsType, QueryParamsType } from "./types";
import { snakeCaseToCamelCase } from "./utils";

/**
 * Should follow this api: https://developer.mozilla.org/en-US/docs/Web/API/Request
 */
export default class Request<R = any, O = any, D = any> {
  readonly method!: string;
  readonly host!: string;
  readonly path!: string;
  readonly userAgent!: string;
  readonly contentType!: string;
  readonly body!: D;
  readonly originalRequest!: R;
  #pathParamsParser?: PathParamsParser;
  #hasTranslatedHeaders = false;
  #cachedHeaders?: HeadersType;
  #headers: HeadersType = {};
  #cachedQuery?: FormattedQueryParamsType;
  #query: QueryParamsType = {};
  #cachedPathParams?: PathParamsType;
  #pathParams: RawParamsType = {};
  options = {} as O;

  constructor(
    method: string,
    host: string,
    path: string,
    pathParams: RawParamsType,
    query: QueryParamsType,
    headers: HeadersType,
    contentType: string,
    userAgent: string,
    body: D,
    originalRequest: R
  ) {
    this.method = method;
    this.path = path;
    this.host = host;
    this.#pathParams = pathParams;
    this.#query = query;
    this.#headers = headers;
    this.contentType = contentType;
    this.userAgent = userAgent;
    this.body = body;
    this.originalRequest = originalRequest;
  }

  /**
   * Why use this instead of the default headers of the req from the framework we are using?
   *
   * We use this so we can have a pattern no matter what framework we are using. The pattern is:
   * - The key of the header is camelCase, all of them.
   *
   *
   * You can add new headers by defining it as:
   * - request.headers = {
   *    "X-Custom-Header": "value";
   *   }
   *
   * @returns - The headers of the request camel cased.
   */
  get headers() {
    if (!this.#hasTranslatedHeaders) this.headers = this.#headers;
    return this.#cachedHeaders as HeadersType;
  }

  /**
   * You can add new headers by defining it as:
   * - request.headers = {
   *    "X-Custom-Header": "value";
   *   }
   *
   * @param headers - The headers you want to add to the request, can be snake_cased or hyphen-cased.
   * We will convert it to camelCase.
   */
  set headers(headers: HeadersType) {
    if (!this.#cachedHeaders) this.#cachedHeaders = {};
    const headerEntries: [string, string][] = Object.entries(headers);
    for (const [key, value] of headerEntries) {
      const newKey = `${key.charAt(0).toLowerCase()}${snakeCaseToCamelCase(key).slice(1)}`;
      this.#cachedHeaders[newKey] = value;
    }
  }

  /**
   * Retrieves the query parameters of the request JSON parsed. This way if you pass custom objects to the query parameters
   * you will retrieve them as objects instead of strings.
   *
   * This is also nice because booleans and numbers will be parsed by default.
   *
   * @returns - The query parameters of the request JSON parsed.
   */
  get query() {
    if (!this.#cachedQuery) {
      this.#cachedQuery = {};
      const queryParamsEntries: [string, string | undefined][] = Object.entries(this.#query);
      for (const [key, value] of queryParamsEntries) {
        if (value) {
          const newKey = `${key.charAt(0).toLowerCase()}${snakeCaseToCamelCase(key).slice(1)}`;
          this.#cachedQuery[newKey] = JSON.parse(value);
        }
      }
    }
    return this.#cachedQuery as FormattedQueryParamsType;
  }

  /**
   * IMPORTANT: You must call _appendPathParamsParser to register the parser before using this method.
   *
   * This will return the path parameters of the request if they exist.
   *
   * Sometimes we want our path parameters to be formatted in a certain way, like a number or a string,
   * for that the framework offer two strategies: `string` and `number`. String is the default one. String will match
   * anything, `number` will only match numbers, and besides that we also support custom regexes.
   *
   * This method is how we parse those path parameters, the `number` one will always convert the path
   * parameter to a number so this is why we need the parser defined before calling this function.
   *
   * @returns - The path parameters of the request.
   */
  get params() {
    if (!this.#cachedPathParams && this.#pathParamsParser) {
      this.#cachedPathParams = this.#pathParamsParser(this.#pathParams);
    }
    return (this.#cachedPathParams ? this.#cachedPathParams : this.#pathParams) as PathParamsType;
  }

  /**
   * This will append the parser of the path parameters to the request.
   *
   * This way when we get the params we will parse the values. This is particularly useful when we want to
   * parse ids from the path parameters to numbers.
   *
   * @param pathParamsParser - The parser of the path parameters.
   */
  async _appendPathParamsParser(pathParamsParser: PathParamsParser) {
    this.#pathParamsParser = pathParamsParser;
  }

  static async new<R = any>(
    method:string,
    host: string,
    path: string,
    pathParams: RawParamsType,
    query: QueryParamsType,
    headers: HeadersType,
    contentType: string,
    userAgent: string,
    body: any,
    originalRequest: R
  ) {
    return new Request<R>(
      method.toUpperCase(),
      host,
      path,
      pathParams,
      query,
      headers,
      contentType,
      userAgent,
      body,
      originalRequest
    );
  }
}
