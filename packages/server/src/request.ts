import { HeadersType, PathParamsType, QueryParamsType } from "./types";

/**
 * Should follow this api: https://developer.mozilla.org/en-US/docs/Web/API/Request
 */
export default class Request {
  readonly method!: string;
  readonly host!: string;
  readonly path!: string;
  readonly params: PathParamsType = {};
  readonly query: QueryParamsType = {};
  readonly headers: HeadersType = {};
  readonly contentType!: string;
  readonly body!: any;

  constructor(method: string, host: string, path: string, query: { [key: string]: string }, headers: { [key: string]: string }, contentType: string, body: any) {
    this.method = method;
    this.path = path;
    this.host = host;
    this.query = query;
    this.headers = headers;
    this.contentType = contentType;
    this.body = body;
  }

  async new(method:string, host: string, path: string, query: { [key: string]: string }, headers: { [key: string]: string }, contentType: string, body: any) {
    return new Request(method, host, path, query, headers, contentType, body);
  }
}
