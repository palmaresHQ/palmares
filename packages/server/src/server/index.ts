import { logging, LOGGING_APP_START_SERVER } from "@palmares/core";

import { NotImplementedServerException } from "./exceptions";
import { ServerSettingsType } from "../types";
import { HandlersOfRouterType } from "../routers/types";
import ServerRoutes from "./routes";

export default class Server {
  serverInstance!: any;
  settings: ServerSettingsType;
  routes: ServerRoutes;

  constructor(settings: ServerSettingsType, routes?: typeof ServerRoutes) {
    this.settings = settings;
    this.routes = new (routes as typeof ServerRoutes)(this);
  }

  async load() {
    throw new NotImplementedServerException('load');
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

export { ServerRoutes };
