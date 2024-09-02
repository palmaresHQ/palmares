import type { coreDomain, settings } from './test';
import type { Domain, SettingsType, SettingsType2, defineSettings, domain } from '@palmares/core';
import type { BaseRouter, MethodsRouter, Request } from '@palmares/server';

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

type ExtractBodyFromHandler<THandler> = THandler extends { handler: (request: infer TRequest) => any }
  ? TRequest extends Request<any, { body: infer TBody }>
    ? TBody
    : never
  : never;

type CapitalizeFirstLetter<
  TString extends string,
  TResult extends string = ''
> = TString extends `${infer TFirst}-${infer TRest}`
  ? CapitalizeFirstLetter<TRest, `${TResult extends '' ? '' : `${TResult}-`}${Capitalize<TFirst>}`>
  : `${TResult extends '' ? '' : `${TResult}-`}${Capitalize<TString>}`;

type ExtractHeadersFromHandler<THandler> = THandler extends { handler: (request: infer TRequest) => any }
  ? TRequest extends Request<any, { headers: infer THeaders }>
    ? { [TKey in keyof THeaders as TKey extends string ? CapitalizeFirstLetter<TKey> : never]: THeaders[TKey] }
    : never
  : never;

// eslint-disable-next-line ts/require-await
function palmaresFetchConstructor<THandlersAndPaths>() {
  return async <
    TInput extends keyof THandlersAndPaths,
    TMethod extends Uppercase<keyof THandlersAndPaths[TInput] extends string ? keyof THandlersAndPaths[TInput] : string>
  >(
    input: TInput,
    init: {
      method?: TMethod;
    } & (TMethod extends 'GET'
      ? unknown
      : ExtractBodyFromHandler<
            Lowercase<TMethod> extends keyof THandlersAndPaths[TInput]
              ? THandlersAndPaths[TInput][Lowercase<TMethod>]
              : never
          > extends never
        ? unknown
        : {
            body: ExtractBodyFromHandler<
              Lowercase<TMethod> extends keyof THandlersAndPaths[TInput]
                ? THandlersAndPaths[TInput][Lowercase<TMethod>]
                : never
            >;
          }) &
      (ExtractHeadersFromHandler<
        Lowercase<TMethod> extends keyof THandlersAndPaths[TInput]
          ? THandlersAndPaths[TInput][Lowercase<TMethod>]
          : never
      > extends never
        ? unknown
        : {
            headers: ExtractHeadersFromHandler<
              Lowercase<TMethod> extends keyof THandlersAndPaths[TInput]
                ? THandlersAndPaths[TInput][Lowercase<TMethod>]
                : never
            >;
          })
  ): Promise<
    Awaited<
      Lowercase<TMethod> extends keyof THandlersAndPaths[TInput]
        ? THandlersAndPaths[TInput][Lowercase<TMethod>] extends { handler: (request: any) => infer TResult }
          ? TResult
          : never
        : never
    >
  > => {
    return {} as any;
  };
}

export default function defineFetch<
  TDomainsOrSettings extends readonly (typeof Domain | ReturnType<typeof domain>)[] | SettingsType2<any[]>
>() {
  return palmaresFetchConstructor<ExtractRoutesFromDomains<TDomainsOrSettings>>();
}

const tFetch = defineFetch<[typeof coreDomain]>();
const main = async () => {
  const response = await tFetch('/here/hello', {
    method: 'POST',
    body: {
      name: 'asasd',
      age: 1
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  data.message;
};

fetch('/here/hello', {
  method: ''
});
