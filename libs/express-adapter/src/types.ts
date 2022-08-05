import { Request as ERequest, Response, NextFunction } from "express";
import { OptionsJson, Options, OptionsText, OptionsUrlencoded } from "body-parser";
import { Request } from "@palmares/server";

export type HTTPMethodTypes = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options' | 'trace' | 'connect';

export type ExpressSettingsType = {
  JSON_OPTIONS?: OptionsJson;
  RAW_OPTIONS?: Options;
  TEXT_OPTIONS?: OptionsText;
  URLENCODED_OPTIONS?: OptionsUrlencoded;
}

export type ExpressMiddlewareHandlerType = (req: ERequest, res: Response, next: NextFunction) => Promise<void> | void;

export type ExpressRequest<O = unknown, D= any> = Request<ERequest, { res: Response } & O, D>
