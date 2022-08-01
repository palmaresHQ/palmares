import { Domain, SettingsType, logging } from "@palmares/core";
import { Router } from "../routers";
import { BaseRoutesType } from "../routers/types";

import Server from "../server";
import { RootRouterTypes, ServerSettingsType } from "../types";
import { LOGGING_APP_STOP_SERVER } from "../utils";

/**
 * This is the app, the app instance is responsible for loading the http server.
 * An http server is a server that can handle multiple http requests.
 *
 * By default this overrides many of the things defined on the core, like the `domains`.
 * It's on here that we call the `ready` and `close` methods of the domains.
 */
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

  /**
   * Initialize the app, this will load the settings, initialize the server and call `ready` function
   * inside of the domains. This ready function is called when the application starts. Although we define
   * it in the `core` we call it here because we are initializing the app.
   *
   * @param settings - The settings of the application. Those are the server settings with the data needed
   * for this application.
   * @param domains - All of the domains of the application, including the domain of the server.
   */
  async initialize(settings: ServerSettingsType, domains: Domain[]): Promise<void> {
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

  async getRoutes(): Promise<BaseRoutesType[]> {
    const promisedRouters = await this.#getRootRouter();
    const routers = await Promise.all(promisedRouters);
    const routes = await Promise.all([...routers.map(async (router) => await router.getBaseRoutes())]);
    return routes.flat();
  }

  async startRoutes() {
    const routes = await this.getRoutes();
    await this.server.routes.initialize(routes);
  }

  async start() {
    await this.startRoutes();

    await this.server.init();

    await this.#configureCleanup();
  }

  async close() {
    await this.server.close();
  }
}
