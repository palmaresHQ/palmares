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
  middlewares: Middleware[] = [];
  nestedPaths: { [key: string]: HandlersOfRouterType[]; } = {};
  #wasHandlersFoundForRouter = false;

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
      if (Array.isArray(argument)) {
        for (const router of argument) {
          await this.#formatRouter(await router);
        }
      } else {
        await this.#formatHandler(argument as VariableControllerType);
      }
    }
  }

  async #formatHandler(handler: VariableControllerType) {
    if (this.#wasHandlersFoundForRouter === false) {
      const handlerEntries = Object.entries(handler);
      for (const [methodType, controller] of handlerEntries) {
        this.handlers.push({
          methodType: methodType as HTTPMethodEnum,
          handler: controller.handler,
          path: controller.path,
          custom: controller.custom
        })
      }
      this.#wasHandlersFoundForRouter = true;
    } else {
      throw new MoreThanOneHandlerForSamePathError();
    }
  }

  /** */
  async #formatRouter(router: Router) {
    for (const handler of router.handlers) {
      const isPathDefinedInHandler = typeof handler.path === 'string';
      const combinedPaths = `${this.path}${router.path}${isPathDefinedInHandler ? handler.path : ''}`;
      this.nestedPaths[combinedPaths] = (this.nestedPaths[combinedPaths] || []).concat(handler);
    }

    for(const [path, handlers] of Object.entries(router.nestedPaths)) {
      this.nestedPaths[`${this.path}${path}`] = handlers;
    }
  }

  async getBaseRoutes() {
    const nestedPaths = Object.entries(this.nestedPaths);
    const allRoutes: BaseRoutesType[] = [[this.path, this.handlers], ...nestedPaths];
    const baseRoutes: BaseRoutesType[]  = [];

    allRoutes.forEach(([path, handlers]) => {
      const hasAnyHandlerForPath = handlers.length > 0;
      if (hasAnyHandlerForPath) baseRoutes.push([path, handlers]);
    });
    return baseRoutes;
  }
}

export default async function path<A extends Array<RouterParametersType>>(path: string, ...args: A): Promise<Router> {
  return Router.new(path, ...args)
}
