import { FunctionControllerType } from "../controllers/types";
import Request from "../request";
import Server from "../server";

/**
 * A middleware is a simple class that is responsible for being executed before and after a request is handled.
 *
 * The usage of a middleware in palmares is similar to Django's middleware implementation with a few key differences.
 *
 * 1. All middlewares here should extend from `Middleware`.
 * 2. All middlewares should implement the `.run()` method.
 *
 * 3. The `run()` method should return a promise that resolves to the response of the request.
 *
 * @example
 * ```
 * import { Middleware } from "@palmares/server";
 *
 * export class MyMiddleware extends Middleware {
 *   async run(request: Request) {
 *
 *      // Here will be the code that do something before retrieving the response of the request.
 *
 *      const response = await this.getResponse(request);
 *
 *      // Here is the code that modify the response that is going to be sent to the client.
 *
 *      return response;
 *   }
 * }
 *
 *
 * // Usage
 * path('/my-path', MyMiddleware, {
 *    GET: {
 *       handler: (request) => {
 *         return 'Hello world';
 *       }
 *    }
 * })
 * ```
 */
export default class Middleware {
  #next!: FunctionControllerType;

  /**
   * This is called when we load the application, if you want to add custom functions to the framework that is being used.
   * This is where you are going to define them.
   *
   * For example, to use Express `cors` middleware we should create like the following:
   * ```
   * import cors from 'cors';
   *
   * export class ExpressCorsMiddleware extends ExpressMiddleware {
   *    static async load(server: ExpressServer): Promise<ExpressMiddlewareHandlerType> {
   *      return cors();
   *    }
   * }
   * ```
   *
   * This enables us to use the default middleware in the application. This api might change depending
   * on the framework, we recommend that your framework create a new class that extends `Middleware` and
   * defines how the `load()` method should be implemented.
   *
   * @param server - The server that is being used. Many frameworks might not need this parameter, but some of them
   * can, so we recommend that you always pass it.
   *
   * @returns - A promise that resolves to anything so custom middlewares can be created.
   */
  static async load<R>(server: Server): Promise<R | any> {
    return undefined as unknown as R;
  }

  /**
   * DO NOT OVERRIDE THIS FUNCTION.
   *
   * @deprecated - DO NOT OVERRIDE THIS FUNCTION.
   *
   * This is called when we are converting the middlewares array to a linked list. This is where we are going
   * to pass the handler to be called when we call `getResponse()`.
   *
   * @param next - The next handler to be called when we call `.getResponse()`.
   */
  async init(next: FunctionControllerType) {
    this.#next = next;
  }

  /**
   * This function can be overridden. This function is used to get the response
   * of the request so we can modify the response before it is sent to the client.
   *
   * @param request - The request that is being handled.
   */
  async getResponse(request: Request) {
    return await Promise.resolve(this.#next(request));
  }

  /**
   * Generally speaking, this is the function that should be called when we want to execute the middleware
   * this is where we are going to call the `getResponse()` function and where you should implement your logic
   * for the middleware.
   *
   * @param request - The request that is being handled.
   */
  async run(request: Request): Promise<any> {
    return this.getResponse(request);
  }
}
