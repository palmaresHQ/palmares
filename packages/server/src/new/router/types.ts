import type { BaseRouter } from './routers';
import type { Middleware2 } from '../middleware';
import { ExtractRequestsFromMiddlewares } from '../middleware/types';

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
  ? `${TRootPath}${TPathFromChild}`
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
> = ExtractRequestsFromMiddlewares<TRootPath, TMiddlewares>;

export type HandlerType<
  TRootPath extends string,
  TMiddlewares extends readonly (Middleware2 | never)[]
> = (request: RequestOnHandlerType<TRootPath, TMiddlewares>) => any;

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
