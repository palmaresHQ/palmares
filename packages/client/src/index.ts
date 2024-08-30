import type { coreDomain, settings } from './test';
import type { Domain, SettingsType, SettingsType2, defineSettings, domain } from '@palmares/core';
import type { BaseRouter, MethodsRouter } from '@palmares/server';

type GetPathOfRouter<TRouter extends BaseRouter<any, any, any, any, any>> =
  TRouter extends BaseRouter<any, any, any, infer TPath, any> ? TPath : never;

type RemoveSubstringOfRouterPath<TRouter, TString extends string> =
  TRouter extends BaseRouter<any, any, any, any, any>
    ? TString extends `${GetPathOfRouter<TRouter>}${infer TRest}`
      ? TRest
      : TString
    : TString;

type ExtractRoutesFromRouter<
  TRouters extends MethodsRouter<any, any, any, any, any> | Omit<MethodsRouter<any, any, any, any, any>, any>,
  TPaths extends string = ''
> = TRouters extends
  | MethodsRouter<infer TParentRouter, infer TChildren, infer TMiddlewares, infer TPath, infer TDefinedHandlers>
  | Omit<
      MethodsRouter<infer TParentRouter, infer TChildren, infer TMiddlewares, infer TPath, infer TDefinedHandlers>,
      any
    >
  ? TDefinedHandlers extends undefined
    ? TChildren extends readonly (
        | MethodsRouter<any, any, any, any, any>
        | Omit<MethodsRouter<any, any, any, any, any>, any>
      )[]
      ? TChildren['length'] extends 0
        ? `${TPaths}`
        : ExtractRoutesFromRouter<
            TChildren[number],
            `${TPaths}${RemoveSubstringOfRouterPath<TParentRouter, TPath extends string ? TPath : ''>}`
          >
      : `${TPaths}`
    : TChildren extends readonly (
          | MethodsRouter<any, any, any, any, any>
          | Omit<MethodsRouter<any, any, any, any, any>, any>
        )[]
      ? TChildren['length'] extends 0
        ? TDefinedHandlers extends undefined
          ? `${TPaths}${RemoveSubstringOfRouterPath<TParentRouter, TPath extends string ? TPath : ''>}`
          : `${TPaths}${RemoveSubstringOfRouterPath<TParentRouter, TPath extends string ? TPath : ''>}`
        : ExtractRoutesFromRouter<
            TChildren[number],
            `${TPaths}${RemoveSubstringOfRouterPath<TParentRouter, TPath extends string ? TPath : ''>}`
          >
      : `${TPaths}`
  : `${TPaths}`;
/*
    ? TChildren extends readonly MethodsRouter<any, any, any, any, any>[]
      ? TChildren['length'] extends 0
        ? TPath
        : ExtractRoutesFromRouter<
            TChildren[number],
            `${TPaths}${RemoveSubstringOfRouterPath<TParentRouter, TPath extends string ? TPath : ''>}`
          >
      : TPaths
    : TPaths
*/

type ExtractRoutesAndHandlerFromRouter<
  TRouter extends MethodsRouter<any, any, any, any, any, any> | Omit<MethodsRouter<any, any, any, any, any, any>, any>
> = TRouter extends MethodsRouter<any, any, any, any, any, infer TRootPath> ? TRootPath : unknown;

type ExtractRouteFromDomain<TDomain extends typeof Domain | ReturnType<typeof domain>> =
  InstanceType<TDomain> extends { getRoutes: () => infer TRoutes }
    ? ExtractRoutesAndHandlerFromRouter<
        Awaited<TRoutes> extends
          | MethodsRouter<any, any, any, any, any>
          | Omit<MethodsRouter<any, any, any, any, any>, any>
          ? Awaited<TRoutes>
          : never
      >
    : never;

type ExtractRoutesFromDomains<
  TDomainsOrSettings extends
    | readonly ((typeof Domain | ReturnType<typeof domain>) | [typeof Domain | ReturnType<typeof domain>, any])[]
    | SettingsType2<any[]>,
  TResult = unknown
> =
  TDomainsOrSettings extends SettingsType2<infer TDomains>
    ? TDomains extends [infer TFirstDomainOrDomainAndSettings, ...infer TRestDomains]
      ? TFirstDomainOrDomainAndSettings extends typeof Domain | ReturnType<typeof domain>
        ? TRestDomains extends readonly (
            | (typeof Domain | ReturnType<typeof domain>)
            | [typeof Domain | ReturnType<typeof domain>, any]
          )[]
          ? TRestDomains['length'] extends 0
            ? ExtractRouteFromDomain<TFirstDomainOrDomainAndSettings> & TResult
            : ExtractRoutesFromDomains<TRestDomains, ExtractRouteFromDomain<TFirstDomainOrDomainAndSettings> & TResult>
          : ExtractRouteFromDomain<TFirstDomainOrDomainAndSettings> & TResult
        : TFirstDomainOrDomainAndSettings extends [infer TFirstDomain, any]
          ? TFirstDomain extends typeof Domain | ReturnType<typeof domain>
            ? TRestDomains extends readonly (
                | (typeof Domain | ReturnType<typeof domain>)
                | [typeof Domain | ReturnType<typeof domain>, any]
              )[]
              ? TRestDomains['length'] extends 0
                ? ExtractRouteFromDomain<TFirstDomain> & TResult
                : ExtractRoutesFromDomains<TRestDomains, ExtractRouteFromDomain<TFirstDomain> & TResult>
              : ExtractRouteFromDomain<TFirstDomain> & TResult
            : TResult
          : TResult
      : TResult
    : TDomainsOrSettings extends [infer TFirstDomain, ...infer TRestDomains]
      ? TFirstDomain extends typeof Domain | ReturnType<typeof domain>
        ? TRestDomains extends readonly (
            | (typeof Domain | ReturnType<typeof domain>)
            | [typeof Domain | ReturnType<typeof domain>, any]
          )[]
          ? TRestDomains['length'] extends 0
            ? ExtractRouteFromDomain<TFirstDomain>
            : ExtractRoutesFromDomains<TRestDomains, ExtractRouteFromDomain<TFirstDomain> & TResult>
          : ExtractRouteFromDomain<TFirstDomain> & TResult
        : TResult
      : TResult;

// eslint-disable-next-line ts/require-await
function palmaresFetchConstructor<THandlersAndPaths>() {
  return async <TInput extends keyof THandlersAndPaths, TMethod extends keyof THandlersAndPaths[TInput]>(
    input: TInput,
    init?: {
      method?: Uppercase<TMethod extends string ? TMethod : string>;
    }
  ) => {
    return {} as any;
  };
}

export default function defineFetch<
  TDomainsOrSettings extends readonly (typeof Domain | ReturnType<typeof domain>)[] | SettingsType2<any[]>
>() {
  return palmaresFetchConstructor<ExtractRoutesFromDomains<TDomainsOrSettings>>();
}

const tFetch = defineFetch<[typeof coreDomain]>();
tFetch('/here/hello', {
  method: 'GET'
});
fetch('/here/hello', {});
