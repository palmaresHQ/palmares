import type { BaseRouter } from './routers';
import type { Middleware2 } from '../middleware';
import { ExtractRequestsFromMiddlewaresForServer } from '../middleware/types';
import type Response from '../response';

export type MethodTypes =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'head'
  | 'options';

export type MergeParentAndChildPathsType<
  TParentRouter extends BaseRouter<any, any, any, any, any>,
  TPathFromChild extends string
> = TParentRouter extends BaseRouter<any, any, any, infer TRootPath, any>
  ? TRootPath extends `${infer InferedRootPath}?${infer InferedQueryParams}`
    ? TPathFromChild extends `${infer InferedPathFromChild}?${infer InferedQueryParamsFromChild}`
      ? `${InferedRootPath}${InferedPathFromChild}?${InferedQueryParams}&${InferedQueryParamsFromChild}`
      : `${InferedRootPath}${TPathFromChild}?${InferedQueryParams}`
    : TPathFromChild extends `${infer InferedPathFromChild}?${infer InferedQueryParamsFromChild}`
    ? `${TRootPath}${InferedPathFromChild}?${InferedQueryParamsFromChild}`
    : `${TRootPath}${TPathFromChild}`
  : TPathFromChild;

export type ValidatedFullPathType<TMergedPath, TPathFromChild> =
  TMergedPath extends string | undefined ? TMergedPath : TPathFromChild;

export type MergeParentMiddlewaresType<
  TParentRouter extends BaseRouter<any, any, any, any, any>
> = TParentRouter extends BaseRouter<
  any,
  any,
  infer TParentMiddlewares,
  any,
  any
>
  ? TParentMiddlewares extends readonly Middleware2[]
    ? TParentMiddlewares
    : readonly Middleware2[]
  : readonly Middleware2[];

export type ValidatedMiddlewaresType<TMiddlewares> =
  TMiddlewares extends readonly Middleware2[]
    ? TMiddlewares
    : readonly Middleware2[];

export type DefaultRouterType = BaseRouter<any, any, any, any, any>;

export type RequestOnHandlerType<
  TRootPath extends string,
  TMiddlewares extends readonly Middleware2[]
> = ExtractRequestsFromMiddlewaresForServer<TRootPath, TMiddlewares>;

export type HandlerType<
  TRootPath extends string,
  TMiddlewares extends readonly (Middleware2 | never)[]
> = (
  request: RequestOnHandlerType<TRootPath, TMiddlewares>
) => Response<any> | Promise<Response<any>>;

export type AlreadyDefinedMethodsType<
  TRootPath extends string,
  TMiddlewares extends readonly Middleware2[]
> = {
  [key in MethodTypes]?: HandlerType<TRootPath, TMiddlewares>;
};

export type DefineAlreadyDefinedMethodsType<
  TRootPath extends string,
  TMiddlewares extends readonly Middleware2[],
  TAlreadyDefinedMethods extends
    | AlreadyDefinedMethodsType<TRootPath, TMiddlewares>
    | unknown,
  THandler extends HandlerType<
    TRootPath extends string ? TRootPath : string,
    TMiddlewares
  >,
  TMethodType extends MethodTypes
> = TAlreadyDefinedMethods extends object
  ? TAlreadyDefinedMethods & { [key in TMethodType]: THandler }
  : { [key in TMethodType]: THandler };

/**
 * This is responsible for extracting all handlers from a router, a handler is what will effectively be executed when a request is made.
 * This is used for knowing what type of request is expected for the handler and what type of response will it return for a given method.
 */
export type ExtractAllHandlersType<
  TRouters extends DefaultRouterType[] | Omit<DefaultRouterType, never>[]
> = TRouters extends [infer TFirstRouter, ...infer TRestRouters]
  ? TFirstRouter extends
      | BaseRouter<any, infer TRouterChildren, any, any, infer TDefinedHandlers>
      | Omit<
          BaseRouter<
            any,
            infer TRouterChildren,
            any,
            any,
            infer TDefinedHandlers
          >,
          never
        >
    ?
        | TDefinedHandlers[keyof TDefinedHandlers]
        | (TRouterChildren extends
            | DefaultRouterType[]
            | Omit<DefaultRouterType, never>[]
            ? ExtractAllHandlersType<TRouterChildren>
            : never)
        | (TRestRouters extends
            | DefaultRouterType[]
            | Omit<DefaultRouterType, never>[]
            ? ExtractAllHandlersType<TRestRouters>
            : never)
    : never
  : never;
