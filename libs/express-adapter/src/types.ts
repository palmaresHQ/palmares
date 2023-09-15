import { ServerSettingsType } from '@palmares/server';
import type { IRouterHandler, Express, json } from 'express';

export type CustomSettingsForExpress = {
  middlewares: Parameters<IRouterHandler<any>>[0][];
  jsonParser?: Parameters<typeof json>[0];
  additionalBehaviour?: (app: Express) => void;
};
export type ServerSettingsTypeExpress = ServerSettingsType<CustomSettingsForExpress>;
