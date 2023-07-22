import type { Middleware2 } from '.';
import type Request from '../request';
//import { DefaultRequestType } from '../request/types';

export type ExtractRequestsFromMiddlewares<
  TPath extends string,
  TMiddlewares extends readonly Middleware2[],
  TFinalRequest extends Request<
    any,
    { Data: unknown; Headers: unknown; Cookies: unknown; Context: unknown }
  > = Request<
    string,
    { Data: unknown; Headers: unknown; Cookies: unknown; Context: unknown }
  >
> = TMiddlewares extends readonly [
  infer TFirstMiddie,
  ...infer TRestMiddlewares
]
  ? TFirstMiddie extends Middleware2
    ? TFirstMiddie['request'] extends (
        request: Request<
          string,
          { Data: any; Context: any; Headers: any; Cookies: any }
        >
      ) => Promise<infer TRequest> | infer TRequest
      ? TRequest extends Request<string, any>
        ? ExtractRequestsFromMiddlewares<
            TPath,
            TRestMiddlewares extends readonly Middleware2[]
              ? TRestMiddlewares
              : [],
            TPath extends string
              ? Request<
                  TPath,
                  {
                    Data: TRequest['data'] & TFinalRequest['data'];
                    Headers: TRequest['headers'] & TFinalRequest['headers'];
                    Cookies: TRequest['cookies'] & TFinalRequest['cookies'];
                    Context: TRequest['context'] & TFinalRequest['context'];
                  }
                >
              : TFinalRequest
          >
        : TFinalRequest
      : TFinalRequest
    : TFinalRequest
  : TFinalRequest;
