import express, { Express } from 'express';

import { Server, ServerSettingsType } from '@palmares/server';

import ExpressRoutes from './routes';
import ExpressRequests from './requests';

export default class ExpressServer extends Server {
  serverInstance!: Express;
  requests!: ExpressRequests;
  routes!: ExpressRoutes;
  _app!: Express;

  constructor(settings: ServerSettingsType) {
    super(settings, ExpressRoutes, ExpressRequests);
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
  }

  async init() {
    this.serverInstance.listen(this.settings.PORT, () => {
      super.init()
    });
  }
}
