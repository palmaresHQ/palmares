import { Domain, SettingsType, logging } from "@palmares/core";

import { ControllerHandlerType, FunctionControllerType } from "./controllers/types";
import { default404handler } from "./defaults";
import { Router } from "./routers";
import { BaseRoutesType } from "./routers/types";
import Server from "./server";
import { RootRouterTypes, ServerSettingsType } from "./types";
import { LOGGING_APP_STOP_SERVER } from "./utils";

/**
 * This is the app, the app instance is responsible for loading the http server.
 * An http server is a server that can handle multiple http requests.
 *
 * By default this overrides many of the things defined on the core, like the `domains`.
 * It's on here that we call the `ready` and `close` methods of each domain so we are able to
 * start the server.
 *
 * The life cycle of the app is:
 * - `load`: Loads the constructor.
 * - `start`: Starts the webserver.
 * - `close`: Stops the webserver.
 */
export default class App {
  domains!: Domain[]
  settings!: ServerSettingsType;
  server: Server;
  isClosingServer = false;
  #cachedRoutes!: BaseRoutesType[];

  constructor(server: Server) {
    this.server = server;
  }

  /**
   * @private
   * Configure the cleanup of the server, this will run when the user press Ctrl+C and the server stops running.
   * This will stop the server gracefully instead of hard kill the process so we are able to do some cleanup.
   */
  async #configureCleanup() {
    process.on('SIGINT', async () => {
      await this.#cleanup();
      process.exit(0);
    });
  }

  /**
   * This is the cleanup phase, we will call `close` method on all of the domains so
   * they shut down gracefully.
   *
   * By default what this does is simply calling all of the `close` methods of the domains.
   */
  async #cleanup() {
    if (this.isClosingServer === false) {
      this.isClosingServer = true;
      await logging.logMessage(LOGGING_APP_STOP_SERVER, {
        appName: this.settings.APP_NAME
      });
      const promises = this.domains.map(async (domain) => {
        if (domain.isClosed === false) await domain.close();
      });
      await Promise.all(promises);
    }
  }

  /**
   * Function used for retrieving the root router. The root router is the router that is responsible for loading
   * all of the routes.
   *
   * To be able to use this framework with multiple web frameworks, we sacrifice the startup time of the server
   * by loading all of the routes in memory. What this means is that we need to transform this:
   * ```ts
   * path('/custom', path('/path', MyController.new()))
   * ```
   *
   * Into this:
   * ```ts
   * const app = express();
   *
   * app.get('/custom/path', MyController.new())
   * ```
   *
   * So all of the routes are flattened into a single array of routes of the application.
   *
   * @returns - The root array of routes of the application.
   */
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
        await domain.ready({ settings: settings as SettingsType, domains, customOptions });
      }
    }
  }

  /**
   * This will retrieves all of the routes of the application flattened. So we are able to iterate over
   * each of them. We cache the routes so if we need them again we don't have to risk iterating over
   * them again.
   *
   * @example
   * ```ts
   * [
   *    [ '/test/<hello>/example/test', [ [Object] ] ],
   *    [ '/test/<hello>/example/<id: number>', [ [Object] ] ]
   * ]
   * ```
   *
   * @returns - The cached flattened routes. The array of routes of the application. On each array
   * the first element is the path and the second element is an array of the handlers of this path.
   * For example '/test/<hello>/example/test', could accept a POST and a GET request. So we will have an
   * array of two objects, one for the POST and one for the GET.
   */
  async getRoutes(): Promise<BaseRoutesType[]> {
    if (!this.#cachedRoutes) {
      const promisedRouters = await this.#getRootRouter();
      const routers = await Promise.all(promisedRouters);
      const routes = await Promise.all([...routers.map(async (router) => {
        return await router.getBaseRoutes()
      })]);
      this.#cachedRoutes = routes.flat();
    }
    return this.#cachedRoutes;
  }

  /**
   * This will start the routes inside of the server instance. We just load them and then call the `initialize`
   * on the ServerRoutes instance. On the actual server we will translate those routes into the actual express
   * or any other framework (like koa or fastify) server so it should be able to handle the requests.
   */
  async #startRoutes() {
    const routes = await this.getRoutes();
    await this.server.routes.initialize(routes);
  }

  /**
   * Method for loading a custom 404 handler inside of the application so instead of showing the default
   * 404 page of the framework we can show our own custom page.
   */
  async #load404() {
    const handler = {
      options: undefined,
      handler: default404handler,
      middlewares: await this.server.getRootMiddlewares(),
    } as ControllerHandlerType;

    if(this.settings.HANDLER_404) {
      const isHandlerAFunction = typeof this.settings.HANDLER_404 === 'function';
      const handlerAsObject = this.settings.HANDLER_404 as { options?: undefined, handler: FunctionControllerType};
      if (!isHandlerAFunction) handler.options = handlerAsObject?.options;
      handler.handler = isHandlerAFunction ? this.settings.HANDLER_404 as FunctionControllerType : handlerAsObject.handler;
    }

    const formattedHandler = await this.server.routes.getHandlerForPath(handler, { is404Handler: true })
    await this.server.load404(formattedHandler);
  }

  /**
   * Method for loading the server instance, this will create a new instance of the server. For express it would
   * be calling:
   *
   * ```ts
   * const app = express();
   * ```
   */
  async load() {
    await this.server.load();
  }

  /**
   * To start the server we must first load the routes, then load the 404 handler and just after that we initialize
   * the application.
   *
   * JUST AS AN EXAMPLE simple way this would be like:
   * @example
   * ```ts
   * // Load the routes - generally speaking this is the what `this.#startRoutes()` does.
   * app.get('/test', (req, res) => { res.send('Hello World') });
   * app.post('/test', (req, res) => { res.send('Hello World') });
   *
   * // Load the 404 handler - generally speaking this is the what `this.#load404()` does.
   * app.use( (req, res) => { res.send('404') });
   *
   * // Initialize the application - generally speaking this is the what `this.server.init()` does.
   * app.listen(3000, () => { console.log('Server started') });
   *
   * // Cleanup function - generally speaking this is the what `this.#configureCleanup()` does.
   * process.on('SIGINT', async () => {
   *  process.exit(0);
   * })
   * ```
   */
  async start() {
    await this.#startRoutes();

    await this.#load404();
    await this.server.init();

    await this.#configureCleanup();
  }

  /**
   * Runs the clean up function of the server when the application stops, most frameworks might not need this
   * but if some framework relies on stopping gracefully it might be needed.
   */
  async close() {
    await this.server.close();
  }
}
