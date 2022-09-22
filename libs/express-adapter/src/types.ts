import { Request as ERequest, Response, NextFunction } from 'express';
import {
  OptionsJson,
  Options,
  OptionsText,
  OptionsUrlencoded,
} from 'body-parser';
import { Request } from '@palmares/server';

export type HTTPMethodTypes =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'head'
  | 'options'
  | 'trace'
  | 'connect';

export type ExpressSettingsType = {
  JSON_OPTIONS?: OptionsJson;
  RAW_OPTIONS?: Options;
  TEXT_OPTIONS?: OptionsText;
  URLENCODED_OPTIONS?: OptionsUrlencoded;
};

export type ExpressMiddlewareHandlerType = (
  req: ERequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

type RequestType = {
  R?: any;
  V?: any;
  P?: any;
  Q?: any;
  D?: any;
  O?: any;
};

export type ExpressRequest<
  R extends RequestType = { R: ERequest; V: any; P: any; Q: any; D: any }
> = Request<{
  R: ERequest;
  V: { res: Response } & R['V'];
  P: R['P'];
  Q: R['Q'];
  D: R['D'];
  O: R['O'];
}>;
