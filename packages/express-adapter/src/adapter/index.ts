import { Adapter, SettingsType } from "@palmares/core";

import express, { Express } from "express";
import http from 'http';

export default class ExpressAdapter extends Adapter {
  app!: Express;
  _app!: Express;

  async load(): Promise<http.RequestListener> {
    this.app = express();
    return this.app
  }

  async init(settings: SettingsType, callback: () => Promise<void>) {
    this.app.listen(settings.PORT, callback)
  }

  async configureRoutes(rootUrlconf: string): Promise<void> {
  }
}
