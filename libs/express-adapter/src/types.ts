import type { ServerSettingsType } from '@palmares/server';
import type { Express, IRouterHandler, json, raw, text, urlencoded } from 'express';
import type multer from 'multer';

export type ToFormDataOptions<TType extends keyof ReturnType<typeof multer>> = {
  type: TType;
  options?: Parameters<ReturnType<typeof multer>[TType]>;
};

export type CustomSettingsForExpress = {
  middlewares: Parameters<IRouterHandler<any>>[0][];
  jsonOptions?: Parameters<typeof json>[0];
  textOptions?: Parameters<typeof text>[0];
  bodyRawOptions?: Parameters<typeof raw>[0];
  /**
   * This is used for defining custom options for the `urlencoded` method from express.
   * Generally urlencoded is used when you want to parse the body of a request that is sent with the `application/x-www-form-urlencoded` content type.
   * You can get this data by using the `toBlob` method on the `Request` object.
   */
  urlEncodedOptions?: Parameters<typeof urlencoded>[0];
  multerOptions?: Parameters<typeof multer>[0];
  additionalBehaviour?: (app: Express) => void;
};
export type ServerSettingsTypeExpress = ServerSettingsType<CustomSettingsForExpress>;
