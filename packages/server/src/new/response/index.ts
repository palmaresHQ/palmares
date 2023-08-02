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
  status!: TResponse['Status'] extends StatusCodes
    ? TResponse['Status']
    : undefined;
  body!: 'Body' extends keyof TResponse ? TResponse['Body'] : undefined;
  headers!: TResponse['Headers'] extends object
    ? TResponse['Headers']
    : undefined;
  context!: TResponse['Context'] extends object
    ? TResponse['Context']
    : undefined;

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
      Status: TNewResponse['Status'] extends StatusCodes
        ? TNewResponse['Status']
        : TResponse['Status'];
      Body: 'Body' extends keyof TNewResponse
        ? TNewResponse['Body']
        : 'Body' extends keyof TResponse
        ? TResponse['Body']
        : undefined;
      Headers: TResponse['Headers'] & TNewResponse['Headers'];
      Context: TResponse['Context'] & TNewResponse['Context'];
    }>();
  }
}
