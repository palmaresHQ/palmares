import { HTTPMethodEnum } from "../controllers/enums";
import Middleware from "../middlewares";

/**
 * Factory method that is not exported to create custom decorators in the application.
 *
 * Since we have a lot of http methods, we need to support all of them, most of them
 * have a similar logic so we extracted this logic away in this custom function.
 *
 * @param method - One of the valid `HTTPMethodEnum` methods that are accepted in the application.
 * @param path - The path that the method should be able to handle.
 *
 * @returns - A decorator function that will completely change the structure of the property.
 * It will be
 *
 * From:
 * ```
 * @Get()
 * async customHandler(request: Request) {
 *    return Response.new(200, { body: "hello" });
 * }
 * ```
 *
 * To:
 * ```
 * customHandler = {
 *    async GET(request: Request) {
 *       return Response.new(200, { body: "hello" });
 *    }
 * }
 * ```
 */
function methodDecoratorFactory(method: HTTPMethodEnum, path?: string) {
  return function <T>(target: T, propertyKey: string, descriptor: PropertyDescriptor) {
    const isAFunction = typeof descriptor.value === 'function';

    let handler = descriptor.value.unknown;
    if (isAFunction) {
      handler = descriptor.value;
      descriptor.value = {};
    } else delete descriptor.value.unknown;

    if (path) descriptor.value.path = path;
    descriptor.value[method] = handler;
  };
}

/**
 * Provides a method decorator for the handler to handle `GET` http methods.
 *
 * @param path - Supports a custom path as argument.
 */
export const Get = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.GET, path);

/**
 * Provides a method decorator for the handler to handle `CONNECT` http methods.
 *
 * @param path - Supports a custom path as argument.
 */
export const Connect = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.CONNECT, path);

/**
 * Provides a method decorator for the handler to handle `DELETE` http methods.
 *
 * @param path - Supports a custom path as argument.
 */
export const Delete = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.DELETE, path);

/**
 * Provides a method decorator for the handler to handle `HEAD` http methods.
 * @param path - Supports a custom path as argument.
 */
export const Head = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.HEAD, path);

/**
 * Provides a method decorator for the handler to handle `OPTIONS` http methods.
 *
 * @param path - Supports a custom path as argument.
 */
export const HttpOptions = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.OPTIONS, path);

/**
 * Provides a method decorator for the handler to handle `PATCH` http methods.
 *
 * @param path - Supports a custom path as argument.
 */
export const Patch = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.PATCH, path);

/**
 * Provides a method decorator for the handler to handle `POST` http methods.
 *
 * @param path - Supports a custom path as argument.
 */
export const Post = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.POST, path);

/**
 * Provides a method decorator for the handler to handle `PUT` http methods.
 *
 * @param path - Supports a custom path as argument.
 */
export const Put = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.PUT, path);

/**
 * Provides a method decorator for the handler to handle `TRACE` http methods.
 *
 * @param path - Supports a custom path as argument.
 */
export const Trace = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.TRACE, path);

/**
 * Provides a method decorator for the handler to handle all http methods. You will need
 * to handle it manually inside your handler by using the `request.method`.
 *
 * @param path - Supports a custom path as argument.
 */
export const All = (path?: string) => methodDecoratorFactory(HTTPMethodEnum.ALL, path);

/**
 * Adds custom middlewares to the handler. You can append as many middlewares as you want to the handler.
 * The middlewares on the left side will come first from the middlewares more at the right side so
 *
 * @example
 * ```
 * @Middlewares(CorsMiddleware, AuthenticationMiddleware)
 * async customHandler(request: ExpressRequest)
 * ```
 *
 * Cors middleware will run BEFORE Authentication Middleware
 *
 * @param middlewares - The middleware to add to your handler.
 */
export function Middlewares(...middlewares: typeof Middleware[]) {
  return function <T>(target: T, propertyKey: string, descriptor: PropertyDescriptor) {
    const isAFunction = typeof descriptor.value === 'function';
    if (isAFunction) {
      const handler = descriptor.value;
      descriptor.value = { unknown: handler };
    }
    descriptor.value.middlewares = middlewares;
  }
}

/**
 * Adds custom readonly options to the request so you can use this data for defining properties
 * on how the handler should operate. For example, you could add schemas and then validate those schemas
 * in a custom middleware, or you can add simple stuff like `this is an authenticated handler` so in a custom
 * middleware you need to authenticate the user on this router.
 *
 * @param options - Any custom data of the options.
 */
export function Options<D extends object | undefined>(options: D) {
  return function <T>(target: T, propertyKey: string, descriptor: PropertyDescriptor) {
    const isAFunction = typeof descriptor.value === 'function';
    if (isAFunction) {
      const handler = descriptor.value;
      descriptor.value = { unknown: handler };
    }
    descriptor.value.options = options;
  }
}
