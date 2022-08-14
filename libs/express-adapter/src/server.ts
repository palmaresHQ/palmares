import express, { Express, Request as ERequest, Response as EResponse } from 'express';

import { HandlersType, Server, ServerSettingsType } from '@palmares/server';

import ExpressRoutes from './routes';
import ExpressRequests from './requests';
import ExpressResponses from './responses';
import { ExpressMiddlewareHandlerType } from './types';

export default class ExpressServer extends Server {
  serverInstance!: Express;
  requests!: ExpressRequests;
  responses!: ExpressResponses;
  routes!: ExpressRoutes;
  _app!: Express;

  constructor(settings: ServerSettingsType) {
    super(settings, ExpressRoutes, ExpressRequests, ExpressResponses);
  }

  async load(): Promise<void> {
    this.serverInstance = express();
    this.serverInstance.use(express.json(this.settings?.CUSTOM_SERVER_SETTINGS?.JSON_OPTIONS));
    this.serverInstance.use(
      express.urlencoded(
        this.settings?.CUSTOM_SERVER_SETTINGS?.URLENCODED_OPTIONS ?
        this.settings?.CUSTOM_SERVER_SETTINGS?.URLENCODED_OPTIONS :
        {extended: true}
      )
    );
    this.serverInstance.use(express.raw(this.settings?.CUSTOM_SERVER_SETTINGS?.RAW_OPTIONS));
    this.serverInstance.use(express.text(this.settings?.CUSTOM_SERVER_SETTINGS?.TEXT_OPTIONS));
    for await (const loadedMiddleware of this.getLoadedRootMiddlewares<ExpressMiddlewareHandlerType>()) {
      this.serverInstance.use(loadedMiddleware);
    }
  }

  async load404(handler: HandlersType<ERequest, EResponse>): Promise<void> {
    this.serverInstance.use(async (req, res) => {
      handler(req, { res })
    })
  }

  async init() {
    this.serverInstance.listen(this.settings.PORT, () => {
      super.init()
    });
  }
}
