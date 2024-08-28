import type { BaseRouter } from './routers';
import type { Middleware } from '../middleware';
import type { ExtractRequestsFromMiddlewaresForServer, MiddlewareOptions } from '../middleware/types';
import type Request from '../request';
import type { RequestMethodTypes } from '../request/types';
import type Response from '../response';
import type { StatusCodes } from '../response/status';
import type { Narrow } from '@palmares/core';

export type MethodTypes = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

export type MergeParentAndChildPathsType<
  TParentRouter extends BaseRouter<any, any, any, any, any>,
  TPathFromChild extends string
> =
  TParentRouter extends BaseRouter<any, any, any, infer TRootPath, any>
    ? TRootPath extends `${infer InferedRootPath}?${infer InferedQueryParams}`
      ? TPathFromChild extends `${infer InferedPathFromChild}?${infer InferedQueryParamsFromChild}`
        ? `${InferedRootPath}${InferedPathFromChild}?${InferedQueryParams}&${InferedQueryParamsFromChild}`
        : `${InferedRootPath}${TPathFromChild}?${InferedQueryParams}`
      : TPathFromChild extends `${infer InferedPathFromChild}?${infer InferedQueryParamsFromChild}`
        ? `${TRootPath}${InferedPathFromChild}?${InferedQueryParamsFromChild}`
        : `${TRootPath}${TPathFromChild}`
    : TPathFromChild;

export type ValidatedFullPathType<TMergedPath, TPathFromChild> = TMergedPath extends string | undefined
  ? TMergedPath
  : TPathFromChild;

export type MergeParentMiddlewaresType<TParentRouter extends BaseRouter<any, any, any, any, any>> =
  TParentRouter extends BaseRouter<any, any, infer TParentMiddlewares, any, any>
    ? TParentMiddlewares extends readonly Middleware[]
      ? TParentMiddlewares['length'] extends 0
        ? []
        : TParentMiddlewares
      : []
    : [];

// This is used for creating a new router from a parent router, it will add the middlewares from the parent router
// to the child router
export type ValidatedMiddlewaresType<TMiddlewares> = TMiddlewares extends readonly Middleware[] ? TMiddlewares : [];

export type DefaultRouterType = BaseRouter<any, any, any, any, any>;

/**
 * Used for extracting the request type all the way from the root router to the handler, it knows where the request
 * has passed, to which middlewares.
 * This way we have a fully typesafe request object without writing a single type
 *
 * @generics TRootPath - The path from the router, this is the full path by joining all the routers together.
 * @generics TMiddlewares - All the middlewares used by the router, from the root router to the handler. This will be
 * recursive, and it's used for inferring the request type.
 * @generics TMethod - The method used for the handler. Eg. 'GET' | 'POST', etc.
 * @generics TResponses - The responses that the handler can return. This is used for documentation and also will exist
 * on the request object so you can retrieve it at any time and throw passing the parameters you want.
 */
export type RequestOnHandlerType<
  TRootPath extends string,
  TMiddlewares extends readonly Middleware[],
  TMethod extends RequestMethodTypes = RequestMethodTypes,
  TResponses extends
    | Record<string, (...args: any[]) => Response<any, any> | Promise<Response<any, any>>>
    | undefined = undefined
> = TMiddlewares['length'] extends 0
  ? Request<TRootPath, any>
  : ExtractRequestsFromMiddlewaresForServer<TRootPath, TMiddlewares, TMethod, TResponses>;

/**
 * This is used for defining the handler function. It will automatically infer the request type based on the
 * middlewares used.
 *
 * @generics TRootPath - The path from the router, this is the full path by joining all the routers together.
 * @generics TMiddlewares - All the middlewares used by the router, from the root router to the handler. This will be
 * recursive, and it's used for inferring the request type.
 * @generics TMethod - The method used for the handler. Eg. 'GET' | 'POST', etc.
 * @generics TResponses - The responses that the handler can return. This is used for inferring the response type.
 * Instead of using `Response.json()` the user will be able to use
 * `401: () => Response.json({ message: 'Something bad happened' }, { status: 404 })`
 */
export type HandlerType<
  TRootPath extends string,
  TMiddlewares extends readonly (Middleware | never)[],
  TMethod extends RequestMethodTypes = RequestMethodTypes,
  TResponses extends
    | Record<string, (...args: any[]) => Response<any, any> | Promise<Response<any, any>>>
    | undefined = undefined
> = (
  request: RequestOnHandlerType<TRootPath, TMiddlewares, TMethod, TResponses>
) => ExtractPossibleResponsesOfHandlerType<
  RequestOnHandlerType<TRootPath, TMiddlewares, TMethod, TResponses>['responses']
>;

/**
 * This is used for validating the response of the handler. If a response is defined on the handler or any
 * of the middlewares, if the response of the handler is not the one defined, it will error out.
 *
 * This is useful for validation. Suppose we want to guarantee that a response always follow a certain
 * structure, we can define it on the middlewares and the handler will be forced to follow that response.
 */
type ExtractPossibleResponsesOfHandlerType<
  TPossibleResponses extends Record<string, (...args: any) => Response<any, any>>
> =
  | ReturnType<TPossibleResponses[keyof TPossibleResponses]>
  | Response<
      any,
      {
        context?: any;
        headers?: any;
        status?: Exclude<`${StatusCodes}`, keyof TPossibleResponses> extends `${infer TStatusCode extends StatusCodes}`
          ? TStatusCode
          : StatusCodes;
      }
    >
  | Promise<
      | ReturnType<TPossibleResponses[keyof TPossibleResponses]>
      | Response<
          any,
          {
            context?: any;
            headers?: any;
            status?: Exclude<
              `${StatusCodes}`,
              keyof TPossibleResponses
            > extends `${infer TStatusCode extends StatusCodes}`
              ? TStatusCode
              : StatusCodes;
          }
        >
    >;

/**
 * Used for appending the handlers to the router. This way we can then extract all of the handlers of a given router.
 * It is defined by each method it defines.
 *
 * @generics TRootPath - The path from the router, this is the full path by joining all the routers together.
 * @generics TMiddlewares - All the middlewares used by the router, from the root router to the handler.
 * This will be recursive, and it's used for inferring the request type.
 *
 * @returns - An object with all the methods defined in the router.
 */
export type AlreadyDefinedMethodsType<TRootPath extends string, TMiddlewares extends readonly Middleware[]> = {
  [key in MethodTypes]?: {
    handler: HandlerType<TRootPath, TMiddlewares>;
    options?: RouterOptionsType;
  };
};

export type DefineAlreadyDefinedMethodsType<
  TRootPath extends string,
  TMiddlewares extends readonly Middleware[],
  TAlreadyDefinedMethods extends AlreadyDefinedMethodsType<TRootPath, TMiddlewares> | unknown,
  THandler extends HandlerType<TRootPath, TMiddlewares, any, any>,
  TOptions extends RouterOptionsType,
  TMethodType extends MethodTypes
> = TAlreadyDefinedMethods extends object
  ? TAlreadyDefinedMethods & {
      [key in TMethodType]: {
        handler: THandler;
        options?: TOptions;
      };
    }
  : {
      [key in TMethodType]: {
        handler: THandler;
        options?: TOptions;
      };
    };

/**
 * This is responsible for extracting all handlers from a router, a handler is what will effectively be executed when a
 * request is made. This is used for knowing what type of {@link Request} is expected for the handler and what type
 * of {@link Response} will it return.
 *
 * @generics TRouters - A list of {@link BaseRouter} or {@link Omit<BaseRouter, never>} that will be used for extracting
 * the handlers.
 * @generics TFinalHandlers - The final type of the handlers, this is used for recursion and should not be used by
 * the user.
 *
 * @returns - The actual handler function.
 */
export type ExtractAllHandlersType<
  TRouters extends DefaultRouterType[] | Omit<DefaultRouterType, never>[],
  TFinalHandlers extends HandlerType<string, any> = never
> = TRouters extends [infer TFirstRouter, ...infer TRestRouters]
  ? TFirstRouter extends
      | BaseRouter<any, infer TRouterChildren, any, any, infer TDefinedHandlers>
      | Omit<BaseRouter<any, infer TRouterChildren, any, any, infer TDefinedHandlers>, never>
    ?
        | (TDefinedHandlers[keyof TDefinedHandlers] extends { handler: any; options?: any }
            ? TDefinedHandlers[keyof TDefinedHandlers]['handler']
            : never)
        | TFinalHandlers
        | ExtractAllHandlersType<
            TRouterChildren extends DefaultRouterType[] | Omit<DefaultRouterType, never>[] ? TRouterChildren : [],
            TFinalHandlers
          >
        | ExtractAllHandlersType<
            TRestRouters extends DefaultRouterType[] | Omit<DefaultRouterType, never>[] ? TRestRouters : [],
            TFinalHandlers
          >
    : TFinalHandlers
  : TFinalHandlers;

/**
 * This will extract all the routers from a tuple of child routers, we will append those routers to the parent router.
 *
 * @generics TIncludes - A tuple of routers that will be used for extracting the routers. We will traverse through
 * the parent and all it's children.
 * @generics TRouters - The final type of the routers, this is used for recursion and SHOULD NOT be explicitly set.
 *
 * @returns - A union of {@link BaseRouter} instances
 */
export type ExtractIncludes<
  TIncludes extends
    | readonly (DefaultRouterType | Omit<DefaultRouterType, any>)[]
    | Narrow<readonly (DefaultRouterType | Omit<DefaultRouterType, any>)[]>,
  TRouters extends readonly DefaultRouterType[]
> = TIncludes extends readonly [infer TFirstRouter, ...infer TRestRouters]
  ? TRestRouters extends readonly (DefaultRouterType | Omit<DefaultRouterType, any>)[]
    ? TFirstRouter extends DefaultRouterType
      ? ExtractIncludes<
          TRestRouters extends readonly (DefaultRouterType | Omit<DefaultRouterType, any>)[] ? TRestRouters : [],
          [...TRouters, TFirstRouter]
        >
      : TFirstRouter extends Omit<infer TRouter, any>
        ? TRouter extends DefaultRouterType
          ? ExtractIncludes<
              TRestRouters extends readonly (DefaultRouterType | Omit<DefaultRouterType, any>)[] ? TRestRouters : [],
              [...TRouters, TRouter]
            >
          : TRouters
        : TRouters
    : TRouters
  : TRouters;

export type RouterOptionsType<TCustomRouterOptions = any> = MiddlewareOptions & {
  customRouterOptions?: TCustomRouterOptions;
};
