import { SettingsType } from "@palmares/core";
import { Server } from '@palmares/server';

import express, { Express } from "express";

export default class ExpressServer extends Server {
  serverInstance!: Express;
  _app!: Express;

  async load(): Promise<void> {
    this.serverInstance = express();
  }

  async init() {
    this.serverInstance.listen(this.settings.PORT, () => {
      super.init()
    });
  }

  async configureRoutes(rootUrlconf: string): Promise<void> {
  }
}
