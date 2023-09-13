import ServerAdapter from '.';

export default class ServerRequestAdapter {
  headers(_server: ServerAdapter, _originalRequest: any, _key: string): any {
    return undefined;
  }

  params(_server: ServerAdapter, _originalRequest: any, _key: string): any {
    return undefined;
  }

  query(_server: ServerAdapter, _originalRequest: any, _key: string): any {
    return undefined;
  }

  body(_server: ServerAdapter, _originalRequest: any): any {
    return undefined;
  }

  cookies(_server: ServerAdapter, _originalRequest: any): any {
    return undefined;
  }
}
