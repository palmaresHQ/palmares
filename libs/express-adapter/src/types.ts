import { Request, Response, NextFunction } from "express";
import { OptionsJson, Options, OptionsText, OptionsUrlencoded } from "body-parser";

export type HTTPMethodTypes = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options' | 'trace' | 'connect';

export type ExpressSettingsType = {
  JSON_OPTIONS?: OptionsJson;
  RAW_OPTIONS?: Options;
  TEXT_OPTIONS?: OptionsText;
  URLENCODED_OPTIONS?: OptionsUrlencoded;
}

export type ExpressMiddlewareHandlerType = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
