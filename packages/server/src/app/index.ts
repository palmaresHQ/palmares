import { Domain, SettingsType, logging } from "@palmares/core";

import Server from "../server";
import { ServerSettingsType } from "../types";
import { LOGGING_APP_STOP_SERVER } from "../utils";

export default class App {
  domains!: Domain[]
  settings!: ServerSettingsType;
  server: Server;
  isClosingServer = false;

  constructor(server: Server) {
    this.server = server;
  }

  async #configureCleanup() {
    process.on('SIGINT', async () => {
      await this.#cleanup();
      process.exit(0);
    })
  }

  async #cleanup() {
    if (this.isClosingServer === false) {
      this.isClosingServer = true;
      await logging.logMessage(LOGGING_APP_STOP_SERVER, {
        appName: this.settings.APP_NAME
      });
      await Promise.all(this.domains.map(async (domain) => {
        if (domain.isClosed === false) await domain.close();
      }));
    }
  }

  async initialize(settings: ServerSettingsType, domains: Domain[]) {
    this.settings = settings;
    this.domains = domains;

    const customOptions = {
      app: this
    };
    for (const domain of domains) {
      if (domain.isReady === false) {
        await domain.ready({ settings: settings as SettingsType, domains, customOptions} );
      }
    }
  }

  async start() {
    await this.server.init();
    await this.#configureCleanup();
  }

  async close() {
    await this.server.close();
  }
}
