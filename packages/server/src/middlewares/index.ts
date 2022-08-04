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

  static async load<R = unknown>(server: Server): Promise<R | any> {
    return undefined as unknown as R;
  }

  async init(next: FunctionControllerType) {
    this.#next = next;
  }

  async getResponse(request: Request) {
    return await Promise.resolve(this.#next(request));
  }

  async run(request: Request): Promise<any> {
    return this.getResponse(request);
  }
}
