import { StatusCodes } from './status';

export default class Response<
  TResponse extends {
    Status?: StatusCodes;
    Body?: unknown;
    Headers?: object | unknown;
    Context?: object | unknown;
  } = {
    Status: undefined;
    Body: undefined;
    Headers: undefined;
    Context: undefined;
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

  status!: TResponse['Status'] extends StatusCodes ? TResponse['Status'] : undefined;
  body!: 'Body' extends keyof TResponse ? TResponse['Body'] : undefined;
  headers!: TResponse['Headers'] extends object ? TResponse['Headers'] : undefined;
  context!: TResponse['Context'] extends object ? TResponse['Context'] : undefined;

  constructor(body?: TResponse['Body'], options?: { status?: TResponse['Status'] }) {
    this.body = body as any;
    this.status = options?.status as any;
  }

  clone<
    TNewResponse extends {
      Status?: StatusCodes;
      Body?: unknown;
      Headers?: object | unknown;
      Context?: unknown;
    } = {
      Status: undefined;
      Body: undefined;
      Headers: object | unknown;
      Context: unknown;
    }
  >() {
    return new Response<{
      Status: TNewResponse['Status'] extends StatusCodes ? TNewResponse['Status'] : TResponse['Status'];
      Body: 'Body' extends keyof TNewResponse
        ? TNewResponse['Body']
        : 'Body' extends keyof TResponse
        ? TResponse['Body']
        : undefined;
      Headers: TResponse['Headers'] & TNewResponse['Headers'];
      Context: TResponse['Context'] & TNewResponse['Context'];
    }>();
  }

  serverData<T>(): T {
    return this.__serverRequestAndResponseData;
  }
}
