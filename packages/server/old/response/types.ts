export type CookieOptionsType = {
  path?: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: boolean | 'lax' | 'strict' | 'none' | undefined;
}

export type BodyTypes = string | number | boolean | object | Buffer;

export type CookiesType = {
  [cookieKey: string]: { value: string } & CookieOptionsType
}
