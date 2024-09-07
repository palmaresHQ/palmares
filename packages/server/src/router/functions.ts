import { MethodsRouter } from './routers';

import type { DefaultRouterType } from './types';

/**
 * This function is used to create a router or a controller. Palmares, by default, does not make that distinction,
 * it's up to you when organizing your code to properly differentiate between a router and a controller.
 *
 * So, a Router is pretty much a tree of other Routes, in other words, you can construct your routes in a more sensible
 * way, you can create a route.
 *
 * @example
 * ```
 * import { path, Response } from '@palmares/server';
 *
 * path('/users').get(async (request) => {
 *    return Response.html('<h1>Hello World<h1>');
 * });
 * ```
 *
 * -----------------------------
 *
 * You can also create nested routes:
 *
 * #### IMPORTANT:
 * - You can nest paths without losing track of the parent path, see `pathNested` function.
 *
 * @example
 * ```
 * import { path, Response } from '@palmares/server';
 *
 * path('/users').get(async (request) => {
 *   return Response.html('<h1>Hello World from GET Request<h1>');
 * }).post(async (request) => {
 *   return Response.html('<h1>Hello World From POST Request<h1>');
 * }).nested((path) => [
 *      path('/<id: number>').get(async (request) => {
 *        return Response.html(`<h1>Content ${request.params.id}<h1>`);
 *      })
 * ]);
 * ```
 *
 * -----------------------------
 *
 * You can define url parameters and query parameters and their types like:
 * #### IMPORTANT:
 * - Types supported: number, string, boolean.
 * - Query parameters modifiers: ? (optional), [] (array).
 * **Take notice**: they are lazy loaded and parsed, you can change this in the settings. This means that we will only
 * validate it's contents if you USE it, otherwise it will
 * be ignored.
 *
 * @example
 * ```
 * import { path, Response } from '@palmares/server';
 *
 * path('/<id: number>').get(async (request) => {
 *    return Response.html(`<h1>Content ${request.params.id}<h1>`);
 * });
 *
 * path('/all?filter=string[]?&filterIds=number[]').get(async (request) => {
 *    return Response.html(`<h1>Content ${request.query.filter}<h1>`);
 * });
 * ```
 *
 * @param path - The path of the route.
 *
 * @returns A new router.
 */
export function path<TPath extends string = ''>(path: TPath = '' as TPath) {
  return MethodsRouter.new(path);
}

/**
 * This is more specific version of {@link path} that allows you to nest paths without losing track of the parent path.
 * See {@link path} for more beginner-friendly documentation.
 *
 * So, imagine this problem: you want to define a parent router, your parent router defines query parameters,
 * params, etc.
 *
 * But you want to create the child router without losing track of all of that information. What is the full url? What
 * types are the query parameters? What types are the params? etc.
 *
 * This function solves that problem, it allows you to create a child router without losing track of the parent router
 * by just passing the parent router as a generic.
 *
 * On **routers.ts** file:
 * @example
 * ```ts
 * import { path, Response } from '@palmares/server';
 *
 * import { controller } from './controllers';
 *
 * export const parentRouter = path('/users?filter=string[]?&filterIds=number[]');
 * export default parentRouter.nested([
 *   controller,
 * ]);
 * ```
 *
 * On **controllers.ts** file:
 * @example
 * ```ts
 * import { pathNested, Response } from '@palmares/server';
 *
 * // Notice the import type, we need this because of circular dependencies, since it's a type only it'll work.
 * import type { parentRouter } from './routers';
 *
 * export const controller = pathNested<typeof parentRouter>()().get(async (request) => {
 *   // You will see that Request.params and Request.query are fully typed.
 *   return Response.html(`<h1>Content ${request.query.filter}<h1>`);
 * });
 * ```
 *
 * -----------------------------
 *
 * ## IMPORTANT:
 * Yeah, i know, why can't you just?
 *
 * ```ts
 * export default parentRouter = path('/users?filter=string[]?&filterIds=number[]').nested([
 *   controller,
 * ]);
 * ```
 *
 * This will create a circular dependency in typescript and it'll complain with you. So guarantee that you are not
 * trying not using `.nested` function in the same router you use as parent. Separate them in different variables.
 */
export function pathNested<TParentRouter extends DefaultRouterType>(parentRouter?: TParentRouter) {
  return <TPath extends string = ''>(path: TPath = '' as TPath) => {
    const newRouter = MethodsRouter.newNested<TParentRouter>()(path);
    if (parentRouter) parentRouter.nested([newRouter as any]);
    return newRouter;
  };
}
