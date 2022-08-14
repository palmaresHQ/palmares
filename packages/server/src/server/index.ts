import { logging, LOGGING_APP_START_SERVER } from "@palmares/core";

import { NotImplementedServerException } from "./exceptions";
import { ServerSettingsType } from "../types";
import ServerRoutes from "./routes";
import ServerResponses from "./responses";
import ServerRequests from "./requests";
import Middleware from "../middlewares";
import { FunctionControllerType } from "../controllers/types";
import { HandlersType } from "./types";

export default class Server {
  serverInstance!: any;
  settings: ServerSettingsType;
  routes: ServerRoutes;
  requests: ServerRequests;
  responses: ServerResponses;
  #rootMiddlewares: typeof Middleware[] = [];

  constructor(
    settings: ServerSettingsType,
    routes?: typeof ServerRoutes,
    requests?: typeof ServerRequests,
    responses?: typeof ServerResponses
  ) {
    this.settings = settings;
    this.routes = new (routes as typeof ServerRoutes)(this);
    this.requests = new (requests as typeof ServerRequests)(this, this.routes);
    this.responses = new (responses as typeof ServerResponses)(this, this.routes);
  }

  /**
   * Retrieves all of the root middlewares and caches it so if multiple calls happens we don't need to
   * retrieve it every time.
   *
   * Root middlewares are middlewares that are called for every route in the application, it'll be here
   * were you will add security middlewares like cors, helmet and so on.
   *
   * @returns - An array of all of the root middleware classes of the application.
   */
  async getRootMiddlewares() {
    const rootMiddlewares = (this.settings.MIDDLEWARES || []);
    const wasDefaultMiddlewaresInitialized = rootMiddlewares.length === this.#rootMiddlewares.length;
    if (!wasDefaultMiddlewaresInitialized) {
      for (const middleware of rootMiddlewares) {
        let middlewareKls = middleware as typeof Middleware;
        const isAPromise = middleware instanceof Promise;
        if (isAPromise) middlewareKls = (await middleware).default;
        this.#rootMiddlewares.push(middlewareKls);
      }
    }
    return this.#rootMiddlewares;
  }

  /**
   * Since this will probably need to be loaded inside of a loop we retrieve it as an async generator which
   * will probably load everything faster than if it wasn't like this.
   *
   * @yields - The data retrieved from the `load` method inside of the middleware.
   */
  async *getLoadedRootMiddlewares<R = unknown>(): AsyncGenerator<R> {
    const rootMiddlewares = await this.getRootMiddlewares();
    let index = 0;
    while (index < rootMiddlewares.length) {
      const middleware = rootMiddlewares[index];
      const loadedMiddlewareData = await middleware.load<R>(this);
      index++;
      if (loadedMiddlewareData !== undefined) yield loadedMiddlewareData;
    }
  }

  async load() {
    throw new NotImplementedServerException(this.constructor.name, 'load');
  }

  async load404(handler: HandlersType) {
    throw new NotImplementedServerException(this.constructor.name, 'load404');
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
