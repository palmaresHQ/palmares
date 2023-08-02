import type { Middleware2 } from '../middleware';
import type { F } from 'ts-toolbelt';
import type {
  AlreadyDefinedMethodsType,
  DefaultRouterType,
  DefineAlreadyDefinedMethodsType,
  HandlerType,
  MergeParentAndChildPathsType,
  MergeParentMiddlewaresType,
  MethodTypes,
  ValidatedFullPathType,
  ValidatedMiddlewaresType,
} from './types';

type ExtractIncludes<
  TIncludes extends readonly (
    | DefaultRouterType
    | Omit<DefaultRouterType, any>
  )[],
  TRouters extends readonly DefaultRouterType[]
> = TIncludes extends readonly [infer TFirstRouter, ...infer TRestRouters]
  ? TRestRouters extends readonly (
      | DefaultRouterType
      | Omit<DefaultRouterType, any>
    )[]
    ? TFirstRouter extends DefaultRouterType
      ? ExtractIncludes<
          TRestRouters extends readonly (
            | DefaultRouterType
            | Omit<DefaultRouterType, any>
          )[]
            ? TRestRouters
            : [],
          [...TRouters, TFirstRouter]
        >
      : TFirstRouter extends Omit<infer TRouter, any>
      ? TRouter extends DefaultRouterType
        ? ExtractIncludes<
            TRestRouters extends readonly (
              | DefaultRouterType
              | Omit<DefaultRouterType, any>
            )[]
              ? TRestRouters
              : [],
            [...TRouters, TRouter]
          >
        : TRouters
      : TRouters
    : TRouters
  : TRouters;

/**
 * This is the core of the types and for the application to work.
 *
 * For types:
 * - this class is used to keep track of all of the children as well as the parent.
 * - By keeping track of children and parent we can pretty much merge everything together and work nicely with middleware,
 * the handlers, and the path.
 * - Let's say for example that we defined a middleware on the parent that changes the Request, this change should also be applied
 * to the children routes. The same applies for the path, let's say that we defined a custom parameter for the path on the parent, like an id.
 * This should be applied to the children as well.
 * - Yu might ask, "but why a parent router keeping track of it's children is important?". Because of the typing when using the router.
 * We want to know which routes we can "call", and what are the headers, data and basically everything else we should send to them.
 *
 * For the application to work:
 * Pretty much a router is a tree. One router is connected to another router, that is connected to another router and so on. But basically
 * ALL applications will have just one route as entrypoint.
 */
export class BaseRouter<
  TParentRouter extends DefaultRouterType | undefined = undefined,
  TChildren extends readonly DefaultRouterType[] | undefined = undefined,
  TMiddlewares extends readonly Middleware2[] = [],
  TRootPath extends string | undefined = undefined,
  TAlreadyDefinedHandlers extends
    | AlreadyDefinedMethodsType<
        TRootPath extends string ? TRootPath : '',
        readonly Middleware2[]
      >
    | unknown = unknown
> {
  path!: TRootPath;
  protected __parentRouter?: TParentRouter;
  protected __wasCreatedFromNested = false;
  protected __children?: TChildren;
  protected __middlewares: TMiddlewares = [] as unknown as TMiddlewares;
  __handlers: TAlreadyDefinedHandlers =
    undefined as unknown as TAlreadyDefinedHandlers;
  protected __handlersByRoutes: Record<string, TAlreadyDefinedHandlers> = {};

  constructor(path: TRootPath, children?: TChildren) {
    this.path = path;
    this.__children = children;
  }

  static new<TPath extends string | undefined = undefined>(path: TPath) {
    const newRouter = new MethodsRouter<undefined, [], [], TPath, undefined>(
      path
    );
    newRouter.path = path;
    return newRouter;
  }

  static newNested<
    TParentRouter extends BaseRouter<any, any, any, any, any>
  >() {
    return <
      TPath extends string,
      TFullPath = MergeParentAndChildPathsType<TParentRouter, TPath>,
      TMergedMiddlewares = MergeParentMiddlewaresType<TParentRouter>
    >(
      path: TPath
    ) => {
      const newRouter = new MethodsRouter<
        TParentRouter,
        [],
        ValidatedMiddlewaresType<TMergedMiddlewares>,
        ValidatedFullPathType<TFullPath, TPath>,
        undefined
      >(path as ValidatedFullPathType<TFullPath, TPath>);
      newRouter.__wasCreatedFromNested = true;
      return newRouter;
    };
  }

  /**
   * Used for including other routers inside of this router. This way we can construct a tree of routers. And you
   * can use it to use the same middlewares and handlers for multiple routes.
   */
  nested<
    TIncludes extends readonly (
      | DefaultRouterType
      | Omit<DefaultRouterType, never>
    )[]
  >(
    children:
      | TIncludes
      | ((
          router: ReturnType<
            IncludesRouter<
              TParentRouter,
              TChildren,
              TMiddlewares,
              TRootPath,
              undefined
            >['child']
          >
        ) => TIncludes)
  ) {
    const newRouter = new IncludesRouter<
      TParentRouter,
      TChildren,
      TMiddlewares,
      TRootPath,
      undefined
    >(this.path);
    const defineRoutes = (
      childPath: string,
      handlers: TAlreadyDefinedHandlers
    ) => {
      this.__handlersByRoutes[`${this.path}${childPath}`] = handlers;
    };

    const childrenArray =
      typeof children === 'function'
        ? children(newRouter.child())?.map((child) => {
            (child as any).__parentRouter = this;
            (child as any).__wasCreatedFromNested = true;
            defineRoutes(child.path, (child as any).__handlers);
            return child;
          })
        : children.map((child) => {
            (child as any).__parentRouter = this;
            defineRoutes(child.path, (child as any).__handlers);
            return child;
          });

    this.__children = childrenArray as any;

    return this as unknown as MethodsRouter<
      TParentRouter,
      ExtractIncludes<TIncludes, []>,
      TMiddlewares,
      TRootPath,
      TAlreadyDefinedHandlers
    >;
  }

  middlewares<TRouterMiddlewares extends readonly Middleware2[]>(
    middlewares: F.Narrow<TRouterMiddlewares>
  ) {
    middlewares.forEach((middleware) => {
      middleware.request;
    });
    if (typeof this.__middlewares === 'string')
      (this.__middlewares as unknown as Middleware2[]).push(
        ...(middlewares as Middleware2[])
      );
    return this as unknown as MethodsRouter<
      TParentRouter,
      TChildren,
      readonly [...TMiddlewares, ...TRouterMiddlewares],
      TRootPath,
      TAlreadyDefinedHandlers
    >;
  }
}

export class IncludesRouter<
  TParentRouter extends DefaultRouterType | undefined = undefined,
  TChildren extends readonly DefaultRouterType[] | undefined = undefined,
  TMiddlewares extends readonly Middleware2[] = [],
  TRootPath extends string | undefined = undefined,
  TAlreadyDefinedMethods extends
    | AlreadyDefinedMethodsType<
        TRootPath extends string ? TRootPath : '',
        readonly Middleware2[]
      >
    | undefined = undefined
> extends BaseRouter<
  TParentRouter,
  TChildren,
  TMiddlewares,
  TRootPath,
  TAlreadyDefinedMethods
> {
  /**
   * Syntax sugar for creating a nested router inside of the `include` method when passing a function instead of an array.
   *
   * @param path - The path of the route.
   * @returns - The child router.
   */
  child() {
    return MethodsRouter.newNested<
      BaseRouter<
        TParentRouter,
        TChildren,
        TMiddlewares,
        TRootPath,
        TAlreadyDefinedMethods
      >
    >();
  }
}

export class MethodsRouter<
  TParentRouter extends DefaultRouterType | undefined = undefined,
  TChildren extends readonly DefaultRouterType[] | undefined = undefined,
  TMiddlewares extends readonly Middleware2[] = [],
  TRootPath extends string | undefined = undefined,
  TAlreadyDefinedMethods extends
    | AlreadyDefinedMethodsType<
        TRootPath extends string ? TRootPath : '',
        readonly Middleware2[]
      >
    | unknown = unknown
> extends BaseRouter<
  TParentRouter,
  TChildren,
  TMiddlewares,
  TRootPath,
  TAlreadyDefinedMethods
> {
  get<
    THandler extends HandlerType<
      TRootPath extends string ? TRootPath : string,
      TMiddlewares
    >
  >(handler: THandler) {
    const existingHandlers = (
      (this.__handlers as any) ? this.__handlers : {}
    ) as any;
    delete existingHandlers.all; // we don't want want to keep the `all` handler if it was defined before since we are now defining a handler for a specific method.
    (this.__handlers as { get: THandler }) = {
      ...existingHandlers,
      get: handler,
    };

    return this as unknown as Omit<
      MethodsRouter<
        TParentRouter,
        TChildren,
        TMiddlewares,
        TRootPath,
        DefineAlreadyDefinedMethodsType<
          TRootPath extends string ? TRootPath : string,
          TMiddlewares,
          TAlreadyDefinedMethods,
          THandler,
          'get'
        >
      >,
      keyof TAlreadyDefinedMethods | 'get' | 'all'
    >;
  }

  post<
    THandler extends HandlerType<
      TRootPath extends string ? TRootPath : string,
      TMiddlewares
    >
  >(handler: THandler) {
    const existingHandlers = (
      (this.__handlers as any) ? this.__handlers : {}
    ) as any;
    delete existingHandlers.all; // we don't want want to keep the `all` handler if it was defined before since we are now defining a handler for a specific method.
    (this.__handlers as { post: THandler }) = {
      ...existingHandlers,
      post: handler,
    };

    return this as unknown as Omit<
      MethodsRouter<
        TParentRouter,
        TChildren,
        TMiddlewares,
        TRootPath,
        DefineAlreadyDefinedMethodsType<
          TRootPath extends string ? TRootPath : string,
          TMiddlewares,
          TAlreadyDefinedMethods,
          THandler,
          'post'
        >
      >,
      keyof TAlreadyDefinedMethods | 'post' | 'all'
    >;
  }

  delete<
    THandler extends HandlerType<
      TRootPath extends string ? TRootPath : string,
      TMiddlewares
    >
  >(handler: THandler) {
    const existingHandlers = (
      (this.__handlers as any) ? this.__handlers : {}
    ) as any;
    delete existingHandlers.all; // we don't want want to keep the `all` handler if it was defined before since we are now defining a handler for a specific method.
    (this.__handlers as { delete: THandler }) = {
      ...existingHandlers,
      delete: handler,
    };

    return this as unknown as Omit<
      MethodsRouter<
        TParentRouter,
        TChildren,
        TMiddlewares,
        TRootPath,
        DefineAlreadyDefinedMethodsType<
          TRootPath extends string ? TRootPath : string,
          TMiddlewares,
          TAlreadyDefinedMethods,
          THandler,
          'delete'
        >
      >,
      keyof TAlreadyDefinedMethods | 'delete' | 'all'
    >;
  }

  options<
    THandler extends HandlerType<
      TRootPath extends string ? TRootPath : string,
      TMiddlewares
    >
  >(handler: THandler) {
    const existingHandlers = (
      (this.__handlers as any) ? this.__handlers : {}
    ) as any;
    delete existingHandlers.all; // we don't want want to keep the `all` handler if it was defined before since we are now defining a handler for a specific method.
    (this.__handlers as { options: THandler }) = {
      ...existingHandlers,
      options: handler,
    };

    return this as unknown as Omit<
      MethodsRouter<
        TParentRouter,
        TChildren,
        TMiddlewares,
        TRootPath,
        DefineAlreadyDefinedMethodsType<
          TRootPath extends string ? TRootPath : string,
          TMiddlewares,
          TAlreadyDefinedMethods,
          THandler,
          'options'
        >
      >,
      keyof TAlreadyDefinedMethods | 'options' | 'all'
    >;
  }

  head<
    THandler extends HandlerType<
      TRootPath extends string ? TRootPath : string,
      TMiddlewares
    >
  >(handler: THandler) {
    const existingHandlers = (
      (this.__handlers as any) ? this.__handlers : {}
    ) as any;
    delete existingHandlers.all; // we don't want want to keep the `all` handler if it was defined before since we are now defining a handler for a specific method.
    (this.__handlers as { options: THandler }) = {
      ...existingHandlers,
      options: handler,
    };

    return this as unknown as Omit<
      MethodsRouter<
        TParentRouter,
        TChildren,
        TMiddlewares,
        TRootPath,
        DefineAlreadyDefinedMethodsType<
          TRootPath extends string ? TRootPath : string,
          TMiddlewares,
          TAlreadyDefinedMethods,
          THandler,
          'head'
        >
      >,
      keyof TAlreadyDefinedMethods | 'head' | 'all'
    >;
  }

  all<
    THandler extends HandlerType<
      TRootPath extends string ? TRootPath : string,
      TMiddlewares
    >
  >(handler: THandler) {
    const handlersAsAny = this.__handlers as any;

    // Remove all the methods handlers since we are defining a handler for all methods.
    for (const key of Object.keys(handlersAsAny))
      if (key !== 'all') delete handlersAsAny[key];

    const existingHandlers = (
      (this.__handlers as any) ? this.__handlers : {}
    ) as any;
    (this.__handlers as { all: THandler }) = {
      ...existingHandlers,
      all: handler,
    };

    return this as unknown as Omit<
      MethodsRouter<
        TParentRouter,
        TChildren,
        TMiddlewares,
        TRootPath,
        DefineAlreadyDefinedMethodsType<
          TRootPath extends string ? TRootPath : string,
          TMiddlewares,
          TAlreadyDefinedMethods,
          THandler,
          MethodTypes
        >
      >,
      keyof TAlreadyDefinedMethods | MethodTypes | 'all'
    >;
  }
}
