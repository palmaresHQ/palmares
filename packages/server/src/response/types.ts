export type CookieOptionsType = {
  path?: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
}

export type CookiesType = {
  [cookieKey: string]: { value: string } & CookieOptionsType
}
