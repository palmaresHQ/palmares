import { ServerSettingsType } from '@palmares/server';

import type { IRouterHandler, Express, json, raw } from 'express';
import type multer from 'multer';

export type ToFormDataOptions<TType extends keyof ReturnType<typeof multer>> = {
  type: TType;
  options?: Parameters<ReturnType<typeof multer>[TType]>;
};

export type CustomSettingsForExpress = {
  middlewares: Parameters<IRouterHandler<any>>[0][];
  jsonOptions?: Parameters<typeof json>[0];
  bodyRawOptions?: Parameters<typeof raw>[0];
  multerOptions?: Parameters<typeof multer>[0];
  additionalBehaviour?: (app: Express) => void;
};
export type ServerSettingsTypeExpress = ServerSettingsType<CustomSettingsForExpress>;
