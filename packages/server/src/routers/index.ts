import Controller from "../controllers";
import { HTTPMethodEnum } from "../controllers/enums";
import { VariableControllerType } from "../controllers/types";
import { MoreThanOneHandlerForSamePathError } from "./exceptions";
import { BaseRoutesType, RouterParametersType, HandlersOfRouterType } from "./types";
import Middleware from "../middlewares";

/**
 * The objective here is to get all of the handlers as a single object this way it becomes really easy to add the routes to
 * the custom server instance.
 */
export class Router {
  path: string;
  handlers: HandlersOfRouterType[] = [];
  middlewares: typeof Middleware[] = [];
  nestedPaths: { [key: string]: HandlersOfRouterType[]; } = {};
  #wasHandlersFoundForRouter = false;
  #indexToAddMiddleware = 0;

  constructor(path: string) {
    this.path = path;
  }

  static async new(path: string, ...args: RouterParametersType[]) {
    const routerInstance = new Router(path);
    await routerInstance.formatArguments(args);
    return routerInstance;
  }

  async formatArguments(args: RouterParametersType[]) {
    for (const argument of args) {
      const isOfTypeRouter = argument instanceof Router;
      const isOfTypeMiddleware = (argument as typeof Middleware).prototype instanceof Middleware;

      if (Array.isArray(argument)) {
        for (const router of argument) {
          await this.#formatRouter(await router);
        }
      } else if (isOfTypeRouter) {
        await this.#formatRouter(argument);
      } else if (isOfTypeMiddleware) {
        await this.#formatMiddleware(argument as typeof Middleware);
      } else {
        await this.#formatHandler(argument as VariableControllerType);
      }
    }
  }

  /**
   * The handler can be formatted in two ways:
   *
   * ```
   * path('\helloWorld', {
   *   GET: {
   *     handler: (request) => {
   *      // Code of the handler here
   *     }
   *   },
   * })
   * ```
   *
   * or it can be created like this:
   * ```
   *  path('\helloWorld', {
   *   GET: (request) => {
   *     // Code of the handler here
   *   },
   * })
   * ```
   *
   * On one format we are able to add more stuff to the request like the path, middlewares, custom data and so on.
   * On the other one, we just pass the handler directly omitting all of the other stuff like a custom path, middlewares,
   * and so on.
   *
   * @param handler - The handler to attach to the handlers and that was defined in the router itself.
   */
  async #formatHandler(handler: VariableControllerType): Promise<void> {
    if (this.#wasHandlersFoundForRouter === false) {
      // Reverse the middlewares so that the last middleware is the first one.
      // (We append the middlewares always on the first index, look for `#formatMiddleware` method)
      const middlewares = this.middlewares.reverse();
      const handlerEntries = Object.entries(handler);
      for (const [methodType, controller] of handlerEntries) {
        const isControllerHandlerAFunction = typeof controller === 'function';
        if (isControllerHandlerAFunction) {
          this.handlers.push({
            methodType: methodType as HTTPMethodEnum,
            handler: controller,
            middlewares,
            path: '',
            custom: {}
          })
        } else {
          const isControllerMiddlewaresDefined = Array.isArray(controller.middlewares);
          const middlewaresOfTheController = isControllerMiddlewaresDefined ?
            [...middlewares, ...controller.middlewares as typeof Middleware[]] :
            [...middlewares];

          this.handlers.push({
            methodType: methodType as HTTPMethodEnum,
            handler: controller.handler,
            middlewares: middlewaresOfTheController,
            path: controller.path,
            custom: controller.custom
          })
        }
      }
      this.#wasHandlersFoundForRouter = true;
    } else {
      throw new MoreThanOneHandlerForSamePathError();
    }
  }

  /**
   * Here we append the middlewares to the handlers and also to the array of middlewares so
   * that we can attach them to the other routers later on.
   *
   * It's important to see that we attach to the middlewares array in the reverse order so that
   * the last middleware will be the first one.
   *
   * @param middleware - The middleware to attach to the handlers and that was defined in the router itself.
   */
  async #formatMiddleware(middleware: typeof Middleware): Promise<void> {
    this.middlewares.splice(0, 0, middleware);
    for (const handler of this.handlers) {
      if (!handler.middlewares.includes(middleware)) handler.middlewares.splice(0, 0, middleware);
    }
  }

  /**
   * This can be rather tricky to understand and to work. The explanation here is simple:
   *
   * To build the routes on the framework we need the routes to be flat. What this means is
   * that this:
   * ```
   * path("/test", [
   *   path("/<hello>", {
   *     GET: {
   *       handler: (request) => {
   *         return "Hello world"
   *       }
   *     }
   *   })
   * ]),
   * ```
   *
   * Will be transformed to something like this
   * ```
   * [
   * '/test/<hello>', [{methodType: 'GET', handler: (request) => "Hello world"]
   * ]
   * ```
   *
   * This means that we combine the path of the nested routers and build a single route we can make calls to.
   * This way we can build the routes really easily inside of the framework that we are using. We won't need
   * custom routers for it to work, we will have everything in a single route. We just need to iterate over
   * all of the routes and the handlers.
   *
   * A router inside a router will be shaped like a tree structure so you need to make sure you understand a little
   * bit how trees works.
   *
   * Middlewares are tied to each handler itself and must keep the ordering on which they were defined.
   *
   * ```
   * path("/test", RootMiddleware, [
   *   path("/<hello>", HelloMiddleware, {
   *     GET: {
   *       middlewares: [HandlerMiddleware],
   *       handler: (request) => {
   *         return "Hello world"
   *       }
   *     }
   *   })
   * ]),
   * ```
   *
   * On the example above the middlewares on the handler should be in the following order:
   * [RootMiddleware, HelloMiddleware, HandlerMiddleware]
   *
   * For the handlers, what we do is that we attach all of the handlers to the `nestedPaths` of
   * the current router node. All of the nestedPaths are combined with the nested paths of the current router node.
   *
   * The example above would be something like:
   * ```
   * Router(
   *   nestedPaths: ['/<hello>', [{methodType: 'GET', handler: (request) => "Hello world"}]]
   * )
   * ```
   *
   * For the `/<hello>` path. And following that we should build the root router node that is for `/test`.
   *
   * What we do is that we combine `/test` with the paths from the `nestedPaths`, so the root router nested
   * paths will be `['/test/<hello>', [{methodType: 'GET', handler: (request) => "Hello world"}]]`.
   *
   * Look that we combined the `/test` with the `/<hello>` paths to build. Then this can be used to build
   * the routes of the application inside of the framework.
   *
   * @param router - The router instance to be formatted.
   */
  async #formatRouter(router: Router): Promise<void> {
    for (const handler of router.handlers) {
      const isPathDefinedInHandler = typeof handler.path === 'string';
      const combinedPaths = `${this.path}${router.path}${isPathDefinedInHandler ? handler.path : ''}`;
      for (const middleware of this.middlewares) {
        if (!handler.middlewares.includes(middleware)) handler.middlewares.splice(0, 0, middleware);
      }
      this.nestedPaths[combinedPaths] = (this.nestedPaths[combinedPaths]|| []).concat(handler);
    }

    for (const [path, handlers] of Object.entries(router.nestedPaths)) {
      const combinedPaths = `${this.path}${path}`;
      this.nestedPaths[combinedPaths] = handlers;
      for (const handler of handlers) {
        for (const middleware of this.middlewares) {
          if (!handler.middlewares.includes(middleware)) handler.middlewares.splice(0, 0, middleware);
        }
      }
    }
  }

  /**
   * To get the base routes we should append the root path and handlers to the nested paths, this way no path is ignored
   * and we are able to build the routes. We only get those routes that have handlers attached to them. This means, routes
   * that actually will actually fire a function.
   *
   * @returns - The base routes of the router.
   */
  async getBaseRoutes() {
    const nestedPaths = Object.entries(this.nestedPaths);
    const allRoutes: BaseRoutesType[] = [[this.path, this.handlers], ...nestedPaths];
    const baseRoutes: BaseRoutesType[] = allRoutes.filter(([_, handlers]) => {
      const hasAnyHandlerForPath: boolean = handlers.length > 0;
      return hasAnyHandlerForPath
    });
    return baseRoutes;
  }
}

export default async function path<A extends Array<RouterParametersType>>(path: string, ...args: A): Promise<Router> {
  return Router.new(path, ...args)
}
