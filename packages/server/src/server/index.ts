import { logging, LOGGING_APP_START_SERVER } from "@palmares/core";

import { NotImplementedServerException } from "./exceptions";
import { ServerSettingsType } from "../types";
import ServerRoutes from "./routes";
import ServerResponses from "./responses";
import ServerRequests from "./requests";

export default class Server {
  serverInstance!: any;
  settings: ServerSettingsType;
  routes: ServerRoutes;
  requests: ServerRequests;

  constructor(
    settings: ServerSettingsType,
    routes?: typeof ServerRoutes,
    requests?: typeof ServerRequests,
    responses?: typeof ServerResponses
  ) {
    this.settings = settings;
    this.routes = new (routes as typeof ServerRoutes)(this);
    this.requests = new (requests as typeof ServerRequests)(this, this.routes);
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

export { ServerRoutes, ServerRequests, ServerResponses };
