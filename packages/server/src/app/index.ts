import { Domain, SettingsType, logging } from "@palmares/core";
import { Router } from "../routers";

import Server from "../server";
import { RootRouterTypes, ServerSettingsType } from "../types";
import { LOGGING_APP_STOP_SERVER } from "../utils";

export default class App {
  domains!: Domain[]
  settings!: ServerSettingsType;
  server: Server;
  isClosingServer = false;

  constructor(server: Server) {
    this.server = server;
  }

  /**
   * Configure the cleanup of the server, this will run when the user press Ctrl+C and the server stops running.
   * This will stop the server gracefully instead of hard kill the process.
   *
   * @private
   */
  async #configureCleanup() {
    process.on('SIGINT', async () => {
      await this.#cleanup();
      process.exit(0);
    })
  }

  /**
   * This is the cleanup phase, we will call `close` method on all of the domains so they shut down gracefully.
   *
   * If you need to do any cleanup operation on `close` is where you would need to add this.
   */
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

  async #getRootRouter(): Promise<Router[]> {
    let rootRouter: RootRouterTypes;
    const rootRouterFromSettings = this.settings.ROOT_ROUTER;
    const isPromise = rootRouterFromSettings instanceof Promise;
    if (isPromise) rootRouter = (await rootRouterFromSettings).default;
    else rootRouter = rootRouterFromSettings;

    if (Array.isArray(rootRouter)) return rootRouter;
    else return [rootRouter];
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

  async getRoutes() {
    const promisedRouters = await this.#getRootRouter();
    const routers = await Promise.all(promisedRouters);
    const routes = await Promise.all([...routers.map(async (router) => await router.getBaseRoutes())]);
    return routes.flat();
  }

  async start() {
    const routers = await this.getRoutes();
    await this.server.initializeRouters(routers);
    await this.server.init();
    await this.#configureCleanup();
  }

  async close() {
    await this.server.close();
  }
}
