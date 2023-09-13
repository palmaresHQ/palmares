import { ServerSettingsType } from '@palmares/server';
import type { IRouterHandler } from 'express';

export type CustomSettingsForExpress = { middlewares: Parameters<IRouterHandler<any>>[0][] };
export type ServerSettingsTypeExpress = ServerSettingsType<CustomSettingsForExpress>;
