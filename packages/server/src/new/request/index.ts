import type { ExtractUrlParamsFromPathType } from './types';

export default class Request<
  TRoutePath extends string = string,
  TRequest extends {
    Method?: 'GET' | 'POST';
    Data?: unknown;
    Headers?: object | unknown;
    Cookies?: object | unknown;
    Context?: unknown;
  } = {
    Data: unknown;
    Headers: unknown;
    Cookies: unknown;
    Context: unknown;
  }
> {
  params!: ExtractUrlParamsFromPathType<TRoutePath>;
  data!: TRequest['Data'];
  headers!: TRequest['Headers'];
  cookies!: TRequest['Cookies'];
  context!: TRequest['Context'];

  extend<
    TNewRequest extends {
      Method?: 'GET' | 'POST';
      Data?: unknown;
      Headers?: object | unknown;
      Cookies?: object | unknown;
      Context?: unknown;
    } = {
      Data: unknown;
      Headers: unknown;
      Cookies: unknown;
      Context: unknown;
    }
  >() {
    return new Request<
      TRoutePath,
      {
        Method: TRequest['Method'];
        Data: TRequest['Data'] & TNewRequest['Data'];
        Headers: TRequest['Headers'] & TNewRequest['Headers'];
        Cookies: TRequest['Cookies'] & TNewRequest['Cookies'];
        Context: TRequest['Context'] & TNewRequest['Context'];
      }
    >();
  }
}
