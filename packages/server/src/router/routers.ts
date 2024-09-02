import { TlsOptions } from 'tls';

import type {
  AlreadyDefinedMethodsType,
  DefaultRouterType,
  DefineAlreadyDefinedMethodsType,
  ExtractIncludes,
  HandlerType,
  MergeParentAndChildPathsType,
  MergeParentMiddlewaresType,
  MethodTypes,
  RouterOptionsType,
  ValidatedFullPathType,
  ValidatedMiddlewaresType
} from './types';
import type { Middleware } from '../middleware';
import type { RequestMethodTypes } from '../request/types';
import type { Domain, Narrow } from '@palmares/core';

type ExtractTRouteTreesFromChildren<
  TRouters extends readonly (DefaultRouterType | Omit<DefaultRouterType, any>)[],
  TResult = unknown
> = TRouters extends readonly [infer TRouterFirst, ...infer TRestRouters]
  ? TRouterFirst extends BaseRouter<any, any, any, any, any, infer TRootTRouteTree>
    ? TRestRouters extends readonly (DefaultRouterType | Omit<DefaultRouterType, any>)[]
      ? ExtractTRouteTreesFromChildren<TRestRouters, TResult & TRootTRouteTree>
      : TResult & TRootTRouteTree
    : TResult
  : TResult;

/**
 * This is the core of the types and for the application to work.
 *
 * For types:
 * - this class is used to keep track of all of the children as well as the parent.
 * - By keeping track of children and parent we can pretty much merge everything together and work nicely
 * with middleware, the handlers, and the path.
 * - Let's say for example that we defined a middleware on the parent that changes the Request, this change
 * should also be applied to the children routes. The same applies for the path, let's say that we defined a
 * custom parameter for the path on the parent, like an id.
 *
 * This should be applied to the children as well.
 * - Yu might ask, "but why a parent router keeping track of it's children is important?". Because of the
 * typing when using the router.
 * We want to know which routes we can "call", and what are the headers, data and basically everything else
 * we should send to them.
 *
 * For the application to work:
 * - Pretty much a router is a tree. One router is connected to another router, that is connected to another
 * router and so on. But basically
 * ALL applications will have just one route as entrypoint.
 * - Understand that the root router will know all the handlers, so you don't need to traverse everything everytime.
 */
export class BaseRouter<
  TParentRouter extends DefaultRouterType | undefined = undefined,
  TChildren extends readonly DefaultRouterType[] | undefined = undefined,
  TMiddlewares extends readonly Middleware<any>[] = never[],
  TRootPath extends string | undefined = undefined,
  TAlreadyDefinedHandlers extends
    | AlreadyDefinedMethodsType<TRootPath extends string ? TRootPath : '', readonly Middleware[]>
    | unknown = unknown,
  TRootRoutesTree = unknown
> {
  path!: TRootPath;

  protected __domain!: Domain<any>;
  protected __partsOfPath: {
    part: string;
    isUrlParam: boolean;
  }[];
  protected __queryParamsAndPath: {
    path: string;
    params: Map<
      string,
      {
        type: ('number' | 'string' | 'boolean')[];
        isOptional: boolean;
        isArray: boolean;
        regex: RegExp | undefined;
      }
    >;
  } = {
    path: '',
    params: new Map()
  };
  protected __urlParamsAndPath: {
    path: string;
    params: Map<
      string,
      {
        type: ('number' | 'string' | 'boolean')[];
        regex: RegExp | undefined;
      }
    >;
  } = {
    path: '',
    params: new Map()
  };
  protected __completePaths = new Map<
    string,
    {
      middlewares: Middleware[];
      urlParams: BaseRouter['__urlParamsAndPath']['params'];
      queryPath: string;
      urlPath: string;
      queryParams: BaseRouter['__queryParamsAndPath']['params'];
      partsOfPath: {
        part: string;
        isUrlParam: boolean;
      }[];
      router: BaseRouter;
      handlers: {
        [method in MethodTypes]?: {
          handler: HandlerType<string, Middleware[]>;
          options?: RouterOptionsType;
        };
      };
    }
  >();
  protected __parentRouter?: TParentRouter;
  protected __wasCreatedFromNested = false;
  protected __children?: TChildren;
  protected __middlewares: TMiddlewares = [] as unknown as TMiddlewares;
  protected __handlers: TAlreadyDefinedHandlers = undefined as unknown as TAlreadyDefinedHandlers;

  constructor(path: TRootPath, children?: TChildren) {
    this.path = path;
    this.__children = children;
    const { queryPath, urlPath, queryParams, urlParams, partsOfPath } = this.extractUrlAndQueryParametersFromPath(
      path || ''
    );
    this.__partsOfPath = partsOfPath;
    this.__queryParamsAndPath = {
      path: queryPath,
      params: new Map(Object.entries(queryParams))
    };
    this.__urlParamsAndPath = {
      path: urlPath,
      params: new Map(Object.entries(urlParams))
    };
  }

  static new<TPath extends string | undefined = undefined>(path: TPath) {
    const newRouter = new MethodsRouter<undefined, [], [], TPath, undefined, unknown>(path);
    return newRouter;
  }

  static newNested<TParentRouter extends BaseRouter<any, any, any, any, any>>() {
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
  nested<const TIncludes extends readonly (DefaultRouterType | Omit<DefaultRouterType, never>)[]>(
    children:
      | ((
          router: ReturnType<IncludesRouter<TParentRouter, TChildren, TMiddlewares, TRootPath, undefined>['child']>
        ) => Narrow<TIncludes>)
      | Narrow<TIncludes>
  ): MethodsRouter<
    TParentRouter,
    ExtractIncludes<TIncludes, []>,
    TMiddlewares,
    TRootPath,
    TAlreadyDefinedHandlers,
    TRootRoutesTree & ExtractTRouteTreesFromChildren<ExtractIncludes<TIncludes, []>>
  > {
    const newRouter = new IncludesRouter<TParentRouter, TChildren, TMiddlewares, TRootPath, undefined>(this.path);

    const isNested = typeof children === 'function';
    const childrenArray = isNested ? children(newRouter.child() as any) : children;
    const doesChildrenAlreadyExists = Array.isArray(this.__children);

    const formattedChildren = childrenArray.map((child) => {
      (child as any).__wasCreatedFromNested = isNested;
      (child as any).__parentRouter = this;
      this.appendChildToParentRouter(this, child as DefaultRouterType);
      return child;
    }) as any;

    if (doesChildrenAlreadyExists) this.__children = (this.__children as any)?.concat(formattedChildren) || undefined;
    else this.__children = formattedChildren;

    return this as unknown as MethodsRouter<
      TParentRouter,
      ExtractIncludes<TIncludes, []>,
      TMiddlewares,
      TRootPath,
      TAlreadyDefinedHandlers,
      TRootRoutesTree & ExtractTRouteTreesFromChildren<ExtractIncludes<TIncludes, []>>
    >;
  }

  protected appendChildToParentRouter(router: DefaultRouterType, child: DefaultRouterType) {
    // We traverse the tree of routers and parent routers so let's say you define 2 nested routers.
    // One router is between the handler and the other is between the root router and the handler.
    // something like this
    //
    // const rootRouter = path('')
    // const nestedRouter = pathNested<typeof rootRouter>()('/nested')
    // rootRouter.nested([nestedRouter])
    // const handlers = pathNested<typeof nestedRouter>()('/handlers')
    //   .get(() => return new Response())
    // nestedRouter.nested([handlers])
    //
    // Notice that we defined the `nestedRouter` as nested to `rootRouter` and `handlers` as nested to
    // `nestedRouter` just after that. If we don't use this loop here, there is NO WAY that `rootRouter`
    // will be able to know that `handlers` exist. To fix that we use this loop to traverse the hole linked
    // list of routers and parent routers and add the children to the parent routers.
    // eslint-disable-next-line ts/no-unnecessary-condition
    while (router) {
      const fullUrlPath = `${router.__urlParamsAndPath.path}${child.__urlParamsAndPath.path}`;
      const fullQueryPath = `${router.__queryParamsAndPath.path}&${child.__queryParamsAndPath.path}`;

      const existsHandlersOnChild = typeof child.__handlers === 'object' && Object.keys(child.__handlers).length > 0;
      const existsChildHandlersOnChild = child.__completePaths.size > 0;

      if (existsHandlersOnChild) {
        router.__completePaths.set(fullUrlPath, {
          middlewares: router.__middlewares.concat(child.__middlewares),
          partsOfPath: router.__partsOfPath.concat(child.__partsOfPath),
          urlParams: new Map([...router.__urlParamsAndPath.params, ...child.__urlParamsAndPath.params]),
          urlPath: fullUrlPath,
          queryParams: new Map([...router.__queryParamsAndPath.params, ...child.__queryParamsAndPath.params]),
          queryPath: fullQueryPath,
          router: child,
          handlers: child.__handlers
        });
      }

      if (existsChildHandlersOnChild) {
        for (const [childPath, childPathData] of child.__completePaths.entries()) {
          const completePath = `${router.path}${childPath}`;

          router.__completePaths.set(completePath, {
            middlewares: router.__middlewares.concat(childPathData.middlewares),
            partsOfPath: router.__partsOfPath.concat(childPathData.partsOfPath),
            urlParams: new Map([...router.__urlParamsAndPath.params, ...childPathData.urlParams]),
            urlPath: `${fullUrlPath}${childPathData.queryPath}`,
            queryParams: new Map([...router.__queryParamsAndPath.params, ...childPathData.queryParams]),
            queryPath: `${fullQueryPath}&${childPathData.queryPath}`,
            router: child,
            handlers: childPathData.handlers
          });
        }
      }

      router = router.__parentRouter;
    }
  }

  middlewares<const TRouterMiddlewares extends readonly Middleware[]>(
    definedMiddlewares: Narrow<TRouterMiddlewares>
  ): MethodsRouter<
    TParentRouter,
    TChildren,
    readonly [...(TMiddlewares['length'] extends 0 ? [] : TMiddlewares), ...TRouterMiddlewares],
    TRootPath,
    TAlreadyDefinedHandlers,
    TRootRoutesTree
  > {
    const middlewaresAsMutable = this.__middlewares as unknown as Middleware[];
    (this.__middlewares as unknown as Middleware[]) = middlewaresAsMutable.concat(definedMiddlewares as Middleware[]);
    for (const handler of this.__completePaths.values())
      handler.middlewares = (definedMiddlewares as Middleware[]).concat(handler.middlewares);

    return this as any;
  }

  private extractQueryParamsFromPath(
    splittedPath: string[],
    params: Record<
      string,
      {
        type: ('number' | 'string' | 'boolean')[];
        isOptional: boolean;
        isArray: boolean;
        regex?: RegExp;
      }
    >,
    initialIndex: number
  ) {
    let index = initialIndex;
    index++;

    const hasNotReachedEndOrNextQueryParam = () => splittedPath[index] !== '&' && index < splittedPath.length;
    const ignoreSpaces = () => {
      if (splittedPath[index] === ' ') index++;
    };

    while (index < splittedPath.length) {
      let queryParamName = '';
      let queryParamType = '';
      let queryParamRegex = '';
      const queryParamTypes = [];
      let isArray = false;
      let isOptional = false;
      while (hasNotReachedEndOrNextQueryParam()) {
        ignoreSpaces();
        if (splittedPath[index] === '&') index++;
        else if (splittedPath[index] === '=') {
          index++;
          if (splittedPath[index] === '{') {
            index++;
            while (splittedPath[index] !== '}') {
              ignoreSpaces();
              queryParamRegex += splittedPath[index];
              index++;
            }
            index++; // remove the last }
          }
          if (splittedPath[index] === ':') index++;
          while (hasNotReachedEndOrNextQueryParam()) {
            ignoreSpaces();
            if (splittedPath[index] === '?') isOptional = true;
            else if (splittedPath[index] === '[' && splittedPath[index + 1] === ']') {
              isArray = true;
              index = index + 2;
            } else if (splittedPath[index] === '(') {
              index++;
              ignoreSpaces();
              while (splittedPath[index] !== ')' && index < splittedPath.length) {
                ignoreSpaces();
                if (splittedPath[index] === '|') {
                  queryParamTypes.push(queryParamType);
                  queryParamType = '';
                } else {
                  queryParamType += splittedPath[index];
                }
                index++;
              }
              if (splittedPath[index] === ')') queryParamTypes.push(queryParamType);
            } else {
              queryParamType += splittedPath[index];
            }
            index++;
          }
        } else {
          queryParamName += splittedPath[index];
          index++;
        }
      }

      if (queryParamTypes.length === 0) queryParamTypes.push(queryParamType);
      params[queryParamName] = {
        type: queryParamTypes as ('number' | 'string' | 'boolean')[],
        isOptional,
        isArray,
        regex: queryParamRegex && queryParamRegex !== '' ? new RegExp(queryParamRegex) : undefined
      };
      index++;
    }

    return index;
  }

  private extractUrlParamsFromPath(
    splittedPath: string[],
    params: Record<
      string,
      {
        type: ('number' | 'string' | 'boolean')[];
        regex: RegExp;
      }
    >,
    initialIndex: number
  ) {
    let urlParamName = '';
    let urlParamType = '';
    let urlParamRegex = '';
    let index = initialIndex;
    index++;

    const ignoreSpaces = () => {
      if (splittedPath[index] === ' ') index++;
    };

    while (splittedPath[index] !== '>') {
      ignoreSpaces();
      // Either will be a regex or a type.
      if (splittedPath[index] === ':') {
        index++;

        while (splittedPath[index] !== '>') {
          ignoreSpaces();
          if (splittedPath[index] === ':') index++;
          if (splittedPath[index] === '{') {
            index++;
            while (splittedPath[index] !== '}') {
              ignoreSpaces();
              urlParamRegex += splittedPath[index];
              index++;
            }
            index++; // remove the last }
          } else {
            while (splittedPath[index] !== '>') {
              ignoreSpaces();
              urlParamType += splittedPath[index];
              index++;
            }
          }
        }
      } else
        while (splittedPath[index] !== ':') {
          ignoreSpaces();
          urlParamName += splittedPath[index];
          index++;
        }
    }

    params[urlParamName] = {
      type: [urlParamType] as ('number' | 'string' | 'boolean')[],
      regex:
        urlParamRegex !== ''
          ? new RegExp(urlParamRegex)
          : new RegExp(
              urlParamType === 'number'
                ? `^(?<${urlParamName}>\\d+)$`
                : urlParamType === 'boolean'
                  ? `^(?<${urlParamName}>true|false)$`
                  : `^(?<${urlParamName}>\\w+)$`
            )
    };
    index++;
    return index;
  }

  /**
   * This works similarly to a lexer in a programming language, but it's a bit simpler. We split the
   * characters and then we loop through them to find what we want.
   *
   * This means the complexity will grow the bigger the path is.
   */
  private extractUrlAndQueryParametersFromPath(path: string) {
    const urlParams: Record<
      string,
      {
        type: ('number' | 'string' | 'boolean')[];
        regex: RegExp;
      }
    > = {};
    const queryParams: Record<
      string,
      {
        type: ('number' | 'string' | 'boolean')[];
        isArray: boolean;
        isOptional: boolean;
        regex: RegExp;
      }
    > = {};
    const splittedPath = path.split('');
    const pathLength = splittedPath.length;
    const partsOfPath = [];

    let partOfPath = '';
    let queryPath = '';
    let index = 0;

    while (pathLength > index) {
      const isBeginningOfUrlParam = splittedPath[index] === '<';
      const isEnteringQueryParams = splittedPath[index] === '?';
      if (isBeginningOfUrlParam) {
        index = this.extractUrlParamsFromPath(splittedPath, urlParams, index);
        const keysOfUrlParams = Object.keys(urlParams);
        const lastInsertedKey = keysOfUrlParams[keysOfUrlParams.length - 1];
        partsOfPath.push({
          part: lastInsertedKey,
          isUrlParam: true
        });
      } else if (isEnteringQueryParams) {
        const startIndex = index;
        index = this.extractQueryParamsFromPath(splittedPath, queryParams, index);
        queryPath = path.slice(startIndex, index);
      } else if (splittedPath[index] !== '/') {
        partOfPath += splittedPath[index];
        index++;
      } else {
        if (partOfPath !== '') {
          partsOfPath.push({
            part: partOfPath,
            isUrlParam: false
          });
          partOfPath = '';
        }
        index++;
      }
    }
    if (partOfPath !== '')
      partsOfPath.push({
        part: partOfPath,
        isUrlParam: false
      });

    const urlPath = path.replace(queryPath, '');
    return {
      urlParams,
      queryParams,
      urlPath,
      queryPath: queryPath.replace(/^\?/g, ''),
      partsOfPath
    };
  }
}

export class IncludesRouter<
  TParentRouter extends DefaultRouterType | undefined = undefined,
  TChildren extends readonly DefaultRouterType[] | undefined = undefined,
  TMiddlewares extends readonly Middleware[] = [],
  TRootPath extends string | undefined = undefined,
  TAlreadyDefinedMethods extends
    | AlreadyDefinedMethodsType<TRootPath extends string ? TRootPath : '', readonly Middleware[]>
    | undefined = undefined,
  TRootRoutesTree = unknown
> extends BaseRouter<TParentRouter, TChildren, TMiddlewares, TRootPath, TAlreadyDefinedMethods, TRootRoutesTree> {
  /**
   * Syntax sugar for creating a nested router inside of the `include` method when passing a function
   * instead of an array.
   *
   * @param path - The path of the route.
   * @returns - The child router.
   */
  child() {
    return MethodsRouter.newNested<
      BaseRouter<TParentRouter, TChildren, TMiddlewares, TRootPath, TAlreadyDefinedMethods, TRootRoutesTree>
    >();
  }
}

export class MethodsRouter<
  TParentRouter extends DefaultRouterType | undefined = undefined,
  TChildren extends readonly DefaultRouterType[] | undefined = undefined,
  TMiddlewares extends readonly Middleware[] = [],
  TRootPath extends string | undefined = undefined,
  TAlreadyDefinedMethods extends
    | AlreadyDefinedMethodsType<TRootPath extends string ? TRootPath : '', readonly Middleware[]>
    | unknown = unknown,
  TRootRoutesTree = unknown
> extends BaseRouter<TParentRouter, TChildren, TMiddlewares, TRootPath, TAlreadyDefinedMethods, TRootRoutesTree> {
  /*middlewares<const TRouterMiddlewares extends readonly Middleware[]>(
    definedMiddlewares: Narrow<TRouterMiddlewares>
  ): MethodsRouter<
    TParentRouter,
    TChildren,
    readonly [...(TMiddlewares['length'] extends 0 ? [] : TMiddlewares), ...TRouterMiddlewares],
    TRootPath,
    TAlreadyDefinedHandlers,
    TRootRoutesTree
  > {
    const middlewaresAsMutable = this.__middlewares as unknown as Middleware[];
    (this.__middlewares as unknown as Middleware[]) = middlewaresAsMutable.concat(definedMiddlewares as Middleware[]);
    for (const handler of this.__completePaths.values())
      handler.middlewares = (definedMiddlewares as Middleware[]).concat(handler.middlewares);

    return this as any;
  }*/

  get<
    THandler extends HandlerType<
      TRootPath extends string ? TRootPath : string,
      [
        ...(TMiddlewares['length'] extends 0 ? [] : TMiddlewares),
        ...(TOptions['middlewares'] extends readonly Middleware[]
          ? TOptions['middlewares'] extends 0
            ? []
            : TOptions['middlewares']
          : [])
      ],
      'GET',
      TOptions['responses']
    >,
    TOptions extends RouterOptionsType
  >(handler: THandler, options?: TOptions) {
    if (Array.isArray(options?.middlewares)) {
      const middlewaresAsMutable = this.__middlewares as unknown as Middleware[];
      (this.__middlewares as unknown as Middleware[]) = middlewaresAsMutable.concat(
        options.middlewares as Middleware[]
      );
      for (const handler of this.__completePaths.values())
        handler.middlewares = (options.middlewares as Middleware[]).concat(handler.middlewares);
    }

    const existingHandlers = ((this.__handlers as any) ? this.__handlers : {}) as any;
    // we don't want want to keep the `all` handler if it was defined before since
    // we are now defining a handler for a specific method.
    delete existingHandlers.all;
    (this.__handlers as {
      get: {
        handler: THandler;
        options?: TOptions;
      };
    }) = {
      ...existingHandlers,
      get: {
        handler,
        options
      }
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
          TOptions,
          'get'
        >,
        {
          [TKey in TRootPath as TKey extends string | number | symbol ? TKey : never]: DefineAlreadyDefinedMethodsType<
            TRootPath extends string ? TRootPath : string,
            TMiddlewares,
            TAlreadyDefinedMethods,
            THandler,
            TOptions,
            'get'
          >;
        } & TRootRoutesTree
      >,
      keyof TAlreadyDefinedMethods | 'get' | 'all'
    >;
  }

  post<
    THandler extends HandlerType<
      TRootPath extends string ? TRootPath : string,
      [
        ...(TMiddlewares['length'] extends 0 ? [] : TMiddlewares),
        ...(TOptions['middlewares'] extends readonly Middleware[]
          ? TOptions['middlewares'] extends 0
            ? []
            : TOptions['middlewares']
          : [])
      ],
      'POST',
      TOptions['responses'] extends undefined ? undefined : TOptions['responses']
    >,
    const TOptions extends RouterOptionsType
  >(handler: THandler, options?: TOptions) {
    if (Array.isArray(options?.middlewares)) {
      const middlewaresAsMutable = this.__middlewares as unknown as Middleware[];
      (this.__middlewares as unknown as Middleware[]) = middlewaresAsMutable.concat(
        options.middlewares as Middleware[]
      );
      for (const handler of this.__completePaths.values())
        handler.middlewares = (options.middlewares as Middleware[]).concat(handler.middlewares);
    }

    const existingHandlers = ((this.__handlers as any) ? this.__handlers : {}) as any;
    // we don't want want to keep the `all` handler if it was defined before since we
    // are now defining a handler for a specific method.
    delete existingHandlers.all;
    (this.__handlers as {
      post: {
        handler: THandler;
        options?: TOptions;
      };
    }) = {
      ...existingHandlers,
      post: {
        handler,
        options
      }
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
          TOptions,
          'post'
        >,
        {
          [TKey in TRootPath as TKey extends string | number | symbol ? TKey : never]: DefineAlreadyDefinedMethodsType<
            TRootPath extends string ? TRootPath : string,
            TMiddlewares,
            TAlreadyDefinedMethods,
            THandler,
            TOptions,
            'post'
          >;
        } & TRootRoutesTree
      >,
      keyof TAlreadyDefinedMethods | 'post' | 'all'
    >;
  }

  delete<
    THandler extends HandlerType<
      TRootPath extends string ? TRootPath : string,
      [
        ...(TMiddlewares['length'] extends 0 ? [] : TMiddlewares),
        ...(TOptions['middlewares'] extends readonly Middleware[]
          ? TOptions['middlewares'] extends 0
            ? []
            : TOptions['middlewares']
          : [])
      ],
      'DELETE',
      TOptions['responses'] extends undefined ? undefined : TOptions['responses']
    >,
    TOptions extends RouterOptionsType
  >(handler: THandler, options?: TOptions) {
    if (Array.isArray(options?.middlewares)) {
      const middlewaresAsMutable = this.__middlewares as unknown as Middleware[];
      (this.__middlewares as unknown as Middleware[]) = middlewaresAsMutable.concat(
        options.middlewares as Middleware[]
      );
      for (const handler of this.__completePaths.values())
        handler.middlewares = (options.middlewares as Middleware[]).concat(handler.middlewares);
    }

    const existingHandlers = ((this.__handlers as any) ? this.__handlers : {}) as any;
    // we don't want want to keep the `all` handler if it was defined before since
    // we are now defining a handler for a specific method.
    delete existingHandlers.all;
    (this.__handlers as {
      delete: {
        handler: THandler;
        options?: TOptions;
      };
    }) = {
      ...existingHandlers,
      delete: {
        handler,
        options
      }
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
          TOptions,
          'delete'
        >,
        {
          [TKey in TRootPath as TKey extends string | number | symbol ? TKey : never]: DefineAlreadyDefinedMethodsType<
            TRootPath extends string ? TRootPath : string,
            TMiddlewares,
            TAlreadyDefinedMethods,
            THandler,
            TOptions,
            'delete'
          >;
        } & TRootRoutesTree
      >,
      keyof TAlreadyDefinedMethods | 'delete' | 'all'
    >;
  }

  options<
    THandler extends HandlerType<
      TRootPath extends string ? TRootPath : string,
      [
        ...(TMiddlewares['length'] extends 0 ? [] : TMiddlewares),
        ...(TOptions['middlewares'] extends readonly Middleware[]
          ? TOptions['middlewares'] extends 0
            ? []
            : TOptions['middlewares']
          : [])
      ],
      'OPTIONS',
      TOptions['responses']
    >,
    TOptions extends RouterOptionsType
  >(handler: THandler, options?: TOptions) {
    if (Array.isArray(options?.middlewares)) {
      const middlewaresAsMutable = this.__middlewares as unknown as Middleware[];
      (this.__middlewares as unknown as Middleware[]) = middlewaresAsMutable.concat(
        options.middlewares as Middleware[]
      );
      for (const handler of this.__completePaths.values())
        handler.middlewares = (options.middlewares as Middleware[]).concat(handler.middlewares);
    }

    const existingHandlers = ((this.__handlers as any) ? this.__handlers : {}) as any;
    // we don't want want to keep the `all` handler if it was defined before since we
    // are now defining a handler for a specific method.
    delete existingHandlers.all;
    (this.__handlers as {
      options: {
        handler: THandler;
        options?: TOptions;
      };
    }) = {
      ...existingHandlers,
      options: {
        handler,
        options
      }
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
          TOptions,
          'options'
        >,
        {
          [TKey in TRootPath as TKey extends string | number | symbol ? TKey : never]: DefineAlreadyDefinedMethodsType<
            TRootPath extends string ? TRootPath : string,
            TMiddlewares,
            TAlreadyDefinedMethods,
            THandler,
            TOptions,
            'post'
          >;
        } & TRootRoutesTree
      >,
      keyof TAlreadyDefinedMethods | 'options' | 'all'
    >;
  }

  head<
    THandler extends HandlerType<
      TRootPath extends string ? TRootPath : string,
      [
        ...(TMiddlewares['length'] extends 0 ? [] : TMiddlewares),
        ...(TOptions['middlewares'] extends readonly Middleware[]
          ? TOptions['middlewares'] extends 0
            ? []
            : TOptions['middlewares']
          : [])
      ],
      'HEAD',
      TOptions['responses']
    >,
    TOptions extends RouterOptionsType
  >(handler: THandler, options?: TOptions) {
    if (Array.isArray(options?.middlewares)) {
      const middlewaresAsMutable = this.__middlewares as unknown as Middleware[];
      (this.__middlewares as unknown as Middleware[]) = middlewaresAsMutable.concat(
        options.middlewares as Middleware[]
      );
      for (const handler of this.__completePaths.values())
        handler.middlewares = (options.middlewares as Middleware[]).concat(handler.middlewares);
    }

    const existingHandlers = ((this.__handlers as any) ? this.__handlers : {}) as any;
    // we don't want want to keep the `all` handler if it was defined before since
    // we are now defining a handler for a specific method.
    delete existingHandlers.all;
    (this.__handlers as {
      head: {
        handler: THandler;
        options?: TOptions;
      };
    }) = {
      ...existingHandlers,
      head: {
        handler,
        options
      }
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
          TOptions,
          'head'
        >,
        {
          [TKey in TRootPath as TKey extends string | number | symbol ? TKey : never]: DefineAlreadyDefinedMethodsType<
            TRootPath extends string ? TRootPath : string,
            TMiddlewares,
            TAlreadyDefinedMethods,
            THandler,
            TOptions,
            'head'
          >;
        } & TRootRoutesTree
      >,
      keyof TAlreadyDefinedMethods | 'head' | 'all'
    >;
  }

  put<
    THandler extends HandlerType<
      TRootPath extends string ? TRootPath : string,
      [
        ...(TMiddlewares['length'] extends 0 ? [] : TMiddlewares),
        ...(TOptions['middlewares'] extends readonly Middleware[]
          ? TOptions['middlewares'] extends 0
            ? []
            : TOptions['middlewares']
          : [])
      ],
      'PUT',
      TOptions['responses']
    >,
    TOptions extends RouterOptionsType
  >(handler: THandler, options?: TOptions) {
    if (Array.isArray(options?.middlewares)) {
      const middlewaresAsMutable = this.__middlewares as unknown as Middleware[];
      (this.__middlewares as unknown as Middleware[]) = middlewaresAsMutable.concat(
        options.middlewares as Middleware[]
      );
      for (const handler of this.__completePaths.values())
        handler.middlewares = (options.middlewares as Middleware[]).concat(handler.middlewares);
    }

    const existingHandlers = ((this.__handlers as any) ? this.__handlers : {}) as any;
    delete existingHandlers.all;
    (this.__handlers as {
      put: {
        handler: THandler;
        options?: TOptions;
      };
    }) = {
      ...existingHandlers,
      put: {
        handler,
        options
      }
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
          TOptions,
          'put'
        >,
        {
          [TKey in TRootPath as TKey extends string | number | symbol ? TKey : never]: DefineAlreadyDefinedMethodsType<
            TRootPath extends string ? TRootPath : string,
            TMiddlewares,
            TAlreadyDefinedMethods,
            THandler,
            TOptions,
            'put'
          >;
        } & TRootRoutesTree
      >,
      keyof TAlreadyDefinedMethods | 'put' | 'all'
    >;
  }

  patch<
    THandler extends HandlerType<
      TRootPath extends string ? TRootPath : string,
      [
        ...(TMiddlewares['length'] extends 0 ? [] : TMiddlewares),
        ...(TOptions['middlewares'] extends readonly Middleware[]
          ? TOptions['middlewares'] extends 0
            ? []
            : TOptions['middlewares']
          : [])
      ],
      'PATCH',
      TOptions['responses']
    >,
    TOptions extends RouterOptionsType
  >(handler: THandler, options?: TOptions) {
    if (Array.isArray(options?.middlewares)) {
      const middlewaresAsMutable = this.__middlewares as unknown as Middleware[];
      (this.__middlewares as unknown as Middleware[]) = middlewaresAsMutable.concat(
        options.middlewares as Middleware[]
      );
      for (const handler of this.__completePaths.values())
        handler.middlewares = (options.middlewares as Middleware[]).concat(handler.middlewares);
    }

    const existingHandlers = ((this.__handlers as any) ? this.__handlers : {}) as any;
    delete existingHandlers.all;
    (this.__handlers as {
      patch: {
        handler: THandler;
        options?: TOptions;
      };
    }) = {
      ...existingHandlers,
      patch: {
        handler,
        options
      }
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
          TOptions,
          'patch'
        >,
        {
          [TKey in TRootPath as TKey extends string | number | symbol ? TKey : never]: DefineAlreadyDefinedMethodsType<
            TRootPath extends string ? TRootPath : string,
            TMiddlewares,
            TAlreadyDefinedMethods,
            THandler,
            TOptions,
            'patch'
          >;
        } & TRootRoutesTree
      >,
      keyof TAlreadyDefinedMethods | 'patch' | 'all'
    >;
  }

  all<
    THandler extends HandlerType<
      TRootPath extends string ? TRootPath : string,
      [
        ...(TMiddlewares['length'] extends 0 ? [] : TMiddlewares),
        ...(TOptions['middlewares'] extends readonly Middleware[]
          ? TOptions['middlewares'] extends 0
            ? []
            : TOptions['middlewares']
          : [])
      ],
      RequestMethodTypes,
      TOptions['responses']
    >,
    TOptions extends RouterOptionsType
  >(handler: THandler, options?: TOptions) {
    const handlersAsAny = this.__handlers as any;

    // Remove all the methods handlers since we are defining a handler for all methods.
    if (handlersAsAny) for (const key of Object.keys(handlersAsAny)) if (key !== 'all') delete handlersAsAny[key];

    const existingHandlers = ((this.__handlers as any) ? this.__handlers : {}) as any;
    (this.__handlers as {
      all: {
        handler: THandler;
        options?: TOptions;
      };
    }) = {
      ...existingHandlers,
      all: {
        handler,
        options
      }
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
          TOptions,
          MethodTypes
        >,
        {
          [TKey in TRootPath as TKey extends string | number | symbol ? TKey : never]: DefineAlreadyDefinedMethodsType<
            TRootPath extends string ? TRootPath : string,
            TMiddlewares,
            TAlreadyDefinedMethods,
            THandler,
            TOptions,
            MethodTypes
          >;
        } & TRootRoutesTree
      >,
      keyof TAlreadyDefinedMethods | MethodTypes | 'all'
    >;
  }
}
