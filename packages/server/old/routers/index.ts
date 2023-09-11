/* eslint-disable prettier/prettier */
import { HTTPMethodEnum } from '../controllers/enums';
import { VariableControllerType } from '../controllers/types';
import { MoreThanOneHandlerForSamePathError } from './exceptions';
import {
  BaseRoutesType,
  RouterParametersType,
  HandlersOfRouterType,
} from './types';
import Middleware from '../middlewares';

/**
 * The objective here is to get all of the handlers as a single object this way it becomes really easy to add the routes to
 * the custom server instance.
 */
export class Router {
  path!: string;
  handlers: HandlersOfRouterType[] = [];
  middlewares: typeof Middleware[] = [];
  nestedPaths: { [key: string]: HandlersOfRouterType[] } = {};
  #wasHandlersFoundForRouter = false;

  static async new(path: string, ...args: RouterParametersType[]) {
    const routerInstance = new Router();

    const isPathAString = typeof path === 'string';
    if (isPathAString) routerInstance.path = path as string;

    await routerInstance._formatArguments(args);
    return routerInstance;
  }

  private async _formatArguments(args: RouterParametersType[]) {
    for (const argument of args) {
      const isOfTypeRouter = argument instanceof Router;
      const isOfTypeMiddleware =
        (argument as typeof Middleware).prototype instanceof Middleware;

      if (argument instanceof Promise) {
        const router = await argument;
        if (router instanceof Router) {
          await this.#formatRouter(router);
        } else {
          await this.#formatRouter(router.default);
        }
      } else if (isOfTypeRouter) {
        await this.#formatRouter(argument);
      } else if (isOfTypeMiddleware) {
        await this.#formatMiddleware(argument as typeof Middleware);
      } else {
        await this._formatHandler(argument as VariableControllerType);
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
  private async _formatHandler(
    handler: VariableControllerType,
    addMultiple = false
  ): Promise<void> {
    if (this.#wasHandlersFoundForRouter === false || addMultiple) {
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
            options: {},
          });
        } else {
          const isControllerMiddlewaresDefined = Array.isArray(
            controller.middlewares
          );
          const middlewaresOfTheController = isControllerMiddlewaresDefined
            ? [
                ...middlewares,
                ...(controller.middlewares as typeof Middleware[]),
              ]
            : [...middlewares];

          this.handlers.push({
            methodType: methodType as HTTPMethodEnum,
            handler: controller.handler,
            middlewares: middlewaresOfTheController,
            path: controller.path,
            options: controller.options,
          });
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
      if (!handler.middlewares.includes(middleware))
        handler.middlewares.splice(0, 0, middleware);
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
      const combinedPaths = `${this.path}${router.path}${
        isPathDefinedInHandler ? handler.path : ''
      }`;
      for (const middleware of this.middlewares) {
        if (!handler.middlewares.includes(middleware))
          handler.middlewares.splice(0, 0, middleware);
      }
      this.nestedPaths[combinedPaths] = (
        this.nestedPaths[combinedPaths] || []
      ).concat(handler);
    }

    for (const [path, handlers] of Object.entries(router.nestedPaths)) {
      const combinedPaths = `${this.path}${path}`;
      this.nestedPaths[combinedPaths] = handlers;
      for (const handler of handlers) {
        for (const middleware of this.middlewares) {
          if (!handler.middlewares.includes(middleware))
            handler.middlewares.splice(0, 0, middleware);
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
    const allRoutes: BaseRoutesType[] = [
      [this.path as string, this.handlers],
      ...nestedPaths,
    ];
    const baseRoutes: BaseRoutesType[] = allRoutes.filter(([_, handlers]) => {
      const hasAnyHandlerForPath: boolean = handlers.length > 0;
      return hasAnyHandlerForPath;
    });
    return baseRoutes;
  }
}

export async function includes<A extends Array<RouterParametersType>>(
  ...args: A
): Promise<Router> {
  return Router.new('', ...args);
}

export async function path<A extends Array<RouterParametersType>>(
  path: string,
  ...args: A
): Promise<Router> {
  return Router.new(path, ...args);
}
//---------------------------------
type ExtractRouterPaths<
  TRootRouter,
  TPaths extends [string, CustomRouter<any, any>][] = []
> = TRootRouter extends CustomRouter<infer TPath, any, infer TChild>
  ? TChild extends CustomRouter
    ? TPath extends ``
      ? TPaths
      : ExtractRouterPaths<TChild, [...TPaths, [TPath, TRootRouter]]>
    : TPaths
  : TPaths;

type GetTypeByString<TString extends string> = TString extends 'number'
  ? number
  : string;

type ExtractStringWithoutSpaces<TString extends string> =
  TString extends ` ${infer TRest}`
    ? ExtractStringWithoutSpaces<`${TRest}`>
    : TString extends `${infer TRest} `
    ? ExtractStringWithoutSpaces<`${TRest}`>
    : TString;

type ExtractUrlParams<TPath extends string> =
  TPath extends `${string}<${infer TParam}:${infer TType}>${infer TRest}`
    ? {
        [key in TParam]: GetTypeByString<
          ExtractStringWithoutSpaces<
            TType extends `${string}(${string}):${infer TTypeOfRegex}`
              ? TTypeOfRegex
              : TType
          >
        >;
      } & ExtractUrlParams<TRest>
    : unknown;

type ExtractRouterPathsStrings<TRootRouter> = TRootRouter extends CustomRouter<
  infer TPath,
  any,
  infer TChild
>
  ? TChild extends CustomRouter
    ? TPath extends ``
      ? never
      : TPath | ExtractRouterPathsStrings<TChild>
    : never
  : never;

type Teste = ExtractUrlParams<'/teste/<hello: (/d+):number>'>;
type Teste2 = ExtractRouterPathsStrings<typeof teste>;

class Request<
  TRoutePath extends string = string,
  TRequest extends {
    Data?: unknown;
    Headers?: object | unknown;
    Cookies?: object | unknown;
    Context?: unknown;
  } = {
    Data: unknown;
    Headers: unknown;
    Cookies: unknown;
    Context: unknown;
  }
> {
  params!: ExtractUrlParams<TRoutePath>;
  data!: TRequest['Data'];
  headers!: TRequest['Headers'];
  cookies!: TRequest['Cookies'];
  context!: TRequest['Context'];
}

class Middleware2 {
  request:
    | ((
        request: Request<
          string,
          { Data: any; Headers: any; Cookies: any; Context: any }
        >
      ) =>
        | Promise<
            Request<
              string,
              { Data: any; Headers: any; Cookies: any; Context: any }
            >
          >
        | Request<
            string,
            { Data: any; Headers: any; Cookies: any; Context: any }
          >)
    | undefined = undefined;
}

function middleware<
  TRouter extends CustomRouter<any, any, any, any>,
  TRouterMiddlewares = TRouter extends CustomRouter<
    any,
    any,
    infer TInferMiddlewares,
    any
  >
    ? TInferMiddlewares extends readonly Middleware2[]
      ? TInferMiddlewares
      : never
    : never,
  TRequestFunction =
    | ((
        request: TRouterMiddlewares extends readonly Middleware2[]
          ? ExtractRequests<TRouter['path'], TRouterMiddlewares>
          : undefined
      ) =>
        | Promise<
            Request<
              string,
              { Data: any; Headers: any; Cookies: any; Context: any }
            >
          >
        | Request<
            string,
            { Data: any; Headers: any; Cookies: any; Context: any }
          >)
    | undefined
>(options: { request: TRequestFunction }) {
  type TypeValidRequestFunction = TRequestFunction extends (
    request: Request<
      string,
      { Data: any; Headers: any; Cookies: any; Context: any }
    >
  ) =>
    | Promise<
        Request<string, { Data: any; Headers: any; Cookies: any; Context: any }>
      >
    | Request<string, { Data: any; Headers: any; Cookies: any; Context: any }>
    ? TRequestFunction
    : undefined;

  return class extends Middleware2 {
    request = options.request as TypeValidRequestFunction;
  };
}

function nestedMiddleware<TRouter extends CustomRouter<any, any, any, any>>() {
  return <
    TRouterMiddlewares = TRouter extends CustomRouter<
      any,
      any,
      infer TInferMiddlewares,
      any
    >
      ? TInferMiddlewares extends readonly Middleware2[]
        ? TInferMiddlewares
        : never
      : never,
    TRequestFunction =
      | ((
          request: TRouterMiddlewares extends readonly Middleware2[]
            ? ExtractRequests<TRouter['path'], TRouterMiddlewares>
            : Request
        ) =>
          | Promise<
              Request<
                string,
                { Data: any; Headers: any; Cookies: any; Context: any }
              >
            >
          | Request<
              string,
              { Data: any; Headers: any; Cookies: any; Context: any }
            >)
      | undefined
  >(options: {
    request: TRequestFunction;
  }) => {
    type TypeValidRequestFunction = TRequestFunction extends (
      request: Request<
        string,
        { Data: any; Headers: any; Cookies: any; Context: any }
      >
    ) =>
      | Promise<
          Request<
            string,
            { Data: any; Headers: any; Cookies: any; Context: any }
          >
        >
      | Request<string, { Data: any; Headers: any; Cookies: any; Context: any }>
      ? TRequestFunction
      : undefined;

    return class extends Middleware2 {
      request = options.request as TypeValidRequestFunction;
    };
  };
}

type Router2 = ReturnType<typeof middleware1['request']>;
const teste: Router2 = {};
class CustomRouter<
  TParentRouter extends CustomRouter<any, any, any> | undefined = undefined,
  TChildren extends
    | readonly CustomRouter<any, any, any>[]
    | undefined = undefined,
  TMiddlewares extends readonly Middleware2[] = [],
  TRootPath extends string | undefined = undefined
> {
  __wasCreatedFromNested = false;
  path!: TRootPath;
  children?: TChildren;
  #middlewares: TMiddlewares = [] as unknown as TMiddlewares;

  constructor(path: TRootPath, children?: TChildren) {
    this.path = path;
    this.children = children;
  }

  static new<TPath extends string | undefined = undefined>(path: TPath) {
    const newRouter = new CustomRouter<undefined, [], [], TPath>(path);
    newRouter.path = path;
    return newRouter;
  }

  static newNested<
    TParentRouter extends
      | CustomRouter<any, any, any, any>
      | undefined = undefined
  >() {
    return <
      TPath extends string | undefined = undefined,
      TFullPath = TParentRouter extends CustomRouter<
        any,
        any,
        any,
        infer TRootPath
      >
        ? `${TRootPath}${TPath}`
        : TPath,
      TMiddlewares = TParentRouter extends CustomRouter<
        any,
        any,
        infer TParentMiddlewares,
        any
      >
        ? TParentMiddlewares
        : readonly Middleware2[]
    >(
      path: TPath
    ) => {
      type TValidatedMiddlewares = TMiddlewares extends readonly Middleware2[]
        ? TMiddlewares
        : readonly Middleware2[];
      type TValidatedFullPath = TFullPath extends string | undefined
        ? TFullPath
        : TPath;

      const validatedPath = path as TValidatedFullPath;
      const newRouter = new CustomRouter<
        TParentRouter,
        [],
        TValidatedMiddlewares,
        TValidatedFullPath
      >(validatedPath);
      newRouter.path = validatedPath;
      newRouter.__wasCreatedFromNested = true;
      return newRouter;
    };
  }

  include<
    TIncludes extends readonly CustomRouter<any, any, any, any>[] | undefined
  >(children: TIncludes) {
    for (const childRouter of children || []) {
      if (childRouter.__wasCreatedFromNested === false)
        console.warn(
          'You should use `.newNested` instead of `.new` for creating a nested router.'
        );
    }
    this.children = children as any;
    return this as unknown as CustomRouter<
      TParentRouter,
      TIncludes,
      TMiddlewares,
      TRootPath
    >;
  }

  middle<TRouterMiddlewares extends readonly Middleware2[]>(
    middlewares: TRouterMiddlewares
  ) {
    (this.#middlewares as unknown as Middleware2[]).push(...middlewares);
    return this as unknown as CustomRouter<
      TParentRouter,
      TChildren,
      [...TMiddlewares, ...TRouterMiddlewares],
      TRootPath
    >;
  }

  get(
    handler: (
      request: ExtractRequests<
        TRootPath extends string ? TRootPath : string,
        TMiddlewares
      >
    ) => any
  ) {
    return this;
  }
}

const CustomMiddie = nestedMiddleware<typeof rootRouter>()({
  request: (request) => {
    return request as Request<
      string,
      {
        Headers: {
          teste: string;
        };
      }
    > &
      typeof request;
  },
});

// O outro middleware modifica o header do request
const CustomMiddie2 = middleware({
  request: (request) => {
    const customReq = request as Request<
      string,
      {
        Headers: {
          ['x-custom-header']: string;
        };
        Context: {
          user: number;
        };
      }
    >;
    return customReq;
  },
});
const middleware2 = new CustomMiddie2();
const middleware1 = new CustomMiddie();
const rootRouter = CustomRouter.new('/test').middle([middleware2] as const);

const rootMiddleware = rootRouter.middle([middleware1] as const);

export type router = typeof rootRouter;

// Isso aqui é um router que foi criado de forma aninhada. Ele tem relação com o rootRouter. Dessa maneira,
// se tenho parâmetros no rootRouter, eles também estarão presentes no router2 e no router3.
// Imagina que essas rotas estarão em outro arquivo, só preciso importar o tipo.
const router2 = CustomRouter.newNested<typeof rootRouter>()(
  '/<hello: (/d+):number>'
);
const router3 = CustomRouter.newNested<typeof rootRouter>()('/test3');
// Aqui estou incluindo os dois routers criados de forma aninhada no rootRouter. Isso é o que eu export
const router = rootRouter.include([router2, router3]);

rootMiddleware.get((request) => {
  request.context;
  request.headers['x-custom-header'];
  request.context.user;
});

type ExtractRequests<
  TPath extends string,
  TMiddlewares extends readonly Middleware2[],
  TFinalRequest extends Request<string, any> = Request
> = TMiddlewares extends readonly [
  infer TFirstMiddie,
  ...infer TRestMiddlewares
]
  ? TFirstMiddie extends Middleware2
    ? TFirstMiddie['request'] extends (
        request: Request<
          string,
          { Data: any; Context: any; Headers: any; Cookies: any }
        >
      ) => Promise<infer TRequest> | infer TRequest
      ? TRequest extends Request<string, any>
        ? ExtractRequests<
            TPath,
            TRestMiddlewares extends readonly Middleware2[]
              ? TRestMiddlewares
              : [],
            Request<
              TPath,
              {
                Data: TRequest['data'] & TFinalRequest['data'];
                Headers: TRequest['headers'] & TFinalRequest['headers'];
                Cookies: TRequest['cookies'] & TFinalRequest['cookies'];
                Context: TRequest['context'] & TFinalRequest['context'];
              }
            >
          >
        : never
      : never
    : TFinalRequest
  : TFinalRequest;

//const router2 = rootRouter.new<typeof router['path'], '/test'>('/test');
//const router = CustomRouter.new('/test/<hello: number>').include([router2]);

type ExtractRoutes<TNestedRouters> = TNestedRouters extends CustomRouter<
  infer TParentPath,
  infer TPath
>[]
  ? TPath extends `/${string}` | ''
    ? {
        parent: TParentPath;
        path: TPath;
      }
    : {
        parent: '';
        path: '';
      }
  : {
      parent: '';
      path: '';
    };

type ExtractType<TType extends string> = TType extends 'string'
  ? string
  : TType extends 'number'
  ? number
  : TType extends 'boolean'
  ? boolean
  : `${TType}`;

type Handlers<TPath extends string> = {
  [key in HTTPMethodEnum]?: TPath;
};

type ExtractSpaces<
  TString extends string,
  TFullString extends string = ''
> = TString extends `${infer TFirst}${infer TSecond}`
  ? ExtractSpaces<
      TSecond,
      TFirst extends ' ' ? TFullString : `${TFullString}${TFirst}`
    >
  : TFullString;

type ExtractRouterParameters<
  TPath extends string,
  TParams = undefined
> = TPath extends `/${infer TParameter}/${infer TRest}`
  ? TParameter extends
      | `<${infer TParameterName}:${infer TType}>`
      | `<${infer TParameterName}: ${infer TType}>`
    ? ExtractRouterParameters<
        `/${TRest}`,
        TParams extends undefined
          ? { [key in TParameterName]: ExtractType<TType> }
          : { [key in TParameterName]: ExtractType<TType> } & TParams
      >
    : ExtractRouterParameters<`/${TRest}`, TParams>
  : TParams;
