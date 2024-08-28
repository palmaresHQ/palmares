import type { coreDomain, settings } from './test';
import type { Domain, SettingsType, SettingsType2, defineSettings, domain } from '@palmares/core';
import type { BaseRouter, MethodsRouter } from '@palmares/server';
import type { DefaultRouterType } from 'packages/server/dist/cjs/types/router/types';

type ExtractRoutesFromRouter<
  TRouters extends readonly MethodsRouter<any, any, any, any, any>[],
  TPaths extends string = ''
> = `${TPaths}${TRouters extends [infer TFirstRouter, ...infer TRestRouters]
  ? TFirstRouter extends MethodsRouter<any, infer TChildren, infer TMiddlewares, infer TPath, infer TDefinedHandlers>
    ? TChildren extends readonly MethodsRouter<any, any, any, any, any>[]
      ?
          | ExtractRoutesFromRouter<TChildren, TPath extends string ? TPath : ''>
          | (TDefinedHandlers extends undefined
              ? never
              : ExtractRoutesFromRouter<
                  TRestRouters extends readonly MethodsRouter<any, any, any, any, any>[] ? TRestRouters : [],
                  TPath extends string ? TPath : ''
                >)
      : ''
    : ''
  : ''}`;

type ExtractRouteFromDomain<TDomain extends typeof Domain | ReturnType<typeof domain>> =
  InstanceType<TDomain> extends { getRoutes: () => infer TRoutes }
    ? ExtractRoutesFromRouter<
        [Awaited<TRoutes> extends MethodsRouter<any, any, any, any, any> ? Awaited<TRoutes> : never]
      >
    : never;

type ExtractRoutes<
  TDomainsOrSettings extends readonly (typeof Domain | ReturnType<typeof domain>)[] | SettingsType2<any[]>
> =
  TDomainsOrSettings extends SettingsType2<infer TDomains>
    ? TDomains extends [infer TFirstDomain, ...infer TRestDomains]
      ? TFirstDomain extends typeof Domain
        ? ExtractRouteFromDomain<TFirstDomain>
        : string
      : unknown
    : TDomainsOrSettings extends [infer TFirstDomain, ...infer TRestDomains]
      ? TFirstDomain extends typeof Domain | ReturnType<typeof domain>
        ? ExtractRouteFromDomain<TFirstDomain>
        : number
      : Date;

fetch('');
// eslint-disable-next-line ts/require-await
async function palmaresFetch<
  TDomainsOrSettings extends readonly (typeof Domain | ReturnType<typeof domain>)[] | SettingsType2<any[]>
>(input: ExtractRoutes<TDomainsOrSettings>): Promise<TDomainsOrSettings> {
  return {} as any;
}

export default function defineFetch<
  TDomainsOrSettings extends readonly (typeof Domain | ReturnType<typeof domain>)[] | SettingsType2<any[]>
>() {
  return palmaresFetch<TDomainsOrSettings>;
}

const tFetch = defineFetch<[typeof coreDomain]>();
tFetch('/here/hello');
