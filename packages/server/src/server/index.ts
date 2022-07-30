import { logging, LOGGING_APP_START_SERVER } from "@palmares/core";

import { NotImplementedServerException } from "./exceptions";
import { OnlyServerSettingsType, ServerSettingsType } from "../types";
import { HandlersOfRouterType } from "../routers/types";

export default class Server {
  serverInstance!: any;
  settings: ServerSettingsType;

  constructor(settings: ServerSettingsType) {
    this.settings = settings;
  }

  async load() {
    throw new NotImplementedServerException('load');
  }

  async initializeRouters(routes: [string, HandlersOfRouterType[]][]) {
    throw new NotImplementedServerException('initializeRouters');
  }

  async init() {
    logging.logMessage(LOGGING_APP_START_SERVER, {
      appName: this.settings.APP_NAME,
      port: this.settings.PORT
    })
  }

  async close(): Promise<void> {
    return;
  }
}
