import { Router } from "../routers";
import { ClassHandler, VariableControllerType } from "./types";
import { HTTPMethodEnum } from "./enums";

const enumsAsString = Object.keys(HTTPMethodEnum);

/**
 * Controllers are just an specialized router. It offers the same functionality
 * as a Router but also offers the ability to set other custom properties.
 */
export default class Controller extends Router {
  [key: string]: ClassHandler | unknown;

  /**
   * This is used for retrieving all of the handlers of the controller so it can be either used
   * to create a router from the controller or to loop through the handlers to extend them in a
   * certain way.
   *
   * By creating this method you are able to add custom functionality to the handlers of the controller
   * you can add custom middleware automatically, add custom parameters and so on...
   *
   * @returns - An array of the handlers of the controller.
   */
  async getHandlersOfController(): Promise<ClassHandler[]> {
    const namesOfRouterProperties = Object.getOwnPropertyNames(this);
    const handlers: ClassHandler[] = [];

    for (const key of namesOfRouterProperties) {
      const value = this[key];
      const isProbablyAKeyHandler = typeof value === 'object' && Object.keys(value as object).length > 0;
      if (isProbablyAKeyHandler) {
        const keysOfHandler = Object.keys(value as object);
        const isDefinitelyAKeyHandler = keysOfHandler
          .every(keyOfHandler => [...enumsAsString, 'path', 'middlewares', 'options'].includes(keyOfHandler));
        if (isDefinitelyAKeyHandler) {
          handlers.push(value as ClassHandler)
        }
      }
    }
    return handlers;
  }

  /**
   * This should be called in your `path` like so:
   * ```
   * path("/<hello>", ExampleController.new())
   * ```
   *
   * This serves as a constructor for the controller because we bypass the "only one"
   * handler by router and instead enable to create multiple handlers on the Router.
   *
   * @returns - A promise that resolves to the controller which is the router.
   */
  static async new(): Promise<Router> {
    const router = new this();
    for (const handler of await router.getHandlersOfController()) {
      const { path, middlewares, options, ...handlers } = handler;
      const handlerEntries = Object.entries(handlers);
      handlerEntries.forEach(([key, handler]) => {
        const isHandlerOfTypeFunctionController = typeof handler === 'function';
        if (isHandlerOfTypeFunctionController) {
          const handlersAsVariableController = handlers as VariableControllerType
          handlersAsVariableController[key as HTTPMethodEnum]= {
            path: '',
            options: options,
            middlewares: middlewares,
            handler: handler,
          }
        } else {
          if (path) handler.path = `${path}${handler.path || ''}`;
          if (middlewares) handler.middlewares = (handler.middlewares || []).concat(middlewares);
          if (options) handler.options = { ...handler.options, ...options as object };
        }
      });
      await router._formatHandler(handlers, true);
    }
    return router;
  }
}
