import type { Domain, SettingsType2, domain } from '@palmares/core';
import type {
  ExtractQueryParamsFromPathType,
  ExtractUrlParamsFromPathType,
  MethodsRouter,
  Request
} from '@palmares/server';

type ExtractRoutesAndHandlerFromRouter<
  TRouter extends MethodsRouter<any, any, any, any, any, any> | Omit<MethodsRouter<any, any, any, any, any, any>, any>
> = TRouter extends
  | MethodsRouter<any, any, any, any, any, infer TRootPath>
  | Omit<MethodsRouter<any, any, any, any, any, infer TRootPath>, any>
  ? TRootPath
  : unknown;

type ExtractRouteFromDomain<TDomain extends typeof Domain | ReturnType<typeof domain>> =
  InstanceType<TDomain> extends { getRoutes: () => infer TRoutes }
    ? ExtractRoutesAndHandlerFromRouter<
        Awaited<TRoutes> extends
          | MethodsRouter<any, any, any, any, any>
          | Omit<MethodsRouter<any, any, any, any, any>, any>
          ? Awaited<TRoutes>
          : never
      >
    : unknown;

type ExtractRoutesFromDomains<
  TDomainsOrSettings extends
    | readonly (
        | (typeof Domain | ReturnType<typeof domain>)
        | readonly [typeof Domain | ReturnType<typeof domain>, any]
      )[]
    | SettingsType2<any[]>,
  TResult = unknown
> =
  TDomainsOrSettings extends SettingsType2<infer TDomains>
    ? TDomains extends [infer TFirstDomainOrDomainAndSettings, ...infer TRestDomains]
      ? TFirstDomainOrDomainAndSettings extends typeof Domain | ReturnType<typeof domain>
        ? TRestDomains extends readonly (
            | (typeof Domain | ReturnType<typeof domain>)
            | readonly [typeof Domain | ReturnType<typeof domain>, any]
          )[]
          ? TRestDomains['length'] extends 0
            ? ExtractRouteFromDomain<TFirstDomainOrDomainAndSettings> & TResult
            : ExtractRoutesFromDomains<TRestDomains, ExtractRouteFromDomain<TFirstDomainOrDomainAndSettings> & TResult>
          : ExtractRouteFromDomain<TFirstDomainOrDomainAndSettings> & TResult
        : TFirstDomainOrDomainAndSettings extends [infer TFirstDomain, any]
          ? TFirstDomain extends typeof Domain | ReturnType<typeof domain>
            ? TRestDomains extends readonly (
                | (typeof Domain | ReturnType<typeof domain>)
                | readonly [typeof Domain | ReturnType<typeof domain>, any]
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
            | readonly [typeof Domain | ReturnType<typeof domain>, any]
          )[]
          ? TRestDomains['length'] extends 0
            ? ExtractRouteFromDomain<TFirstDomain> & TResult
            : ExtractRoutesFromDomains<TRestDomains, ExtractRouteFromDomain<TFirstDomain> & TResult>
          : ExtractRouteFromDomain<TFirstDomain> & TResult
        : TFirstDomain extends [infer TFirstDomain, any]
          ? TFirstDomain extends typeof Domain | ReturnType<typeof domain>
            ? TRestDomains extends readonly (
                | (typeof Domain | ReturnType<typeof domain>)
                | readonly [typeof Domain | ReturnType<typeof domain>, any]
              )[]
              ? TRestDomains['length'] extends 0
                ? ExtractRouteFromDomain<TFirstDomain> & TResult
                : ExtractRoutesFromDomains<TRestDomains, ExtractRouteFromDomain<TFirstDomain> & TResult>
              : ExtractRouteFromDomain<TFirstDomain> & TResult
            : TResult
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
    : unknown
  : unknown;

// eslint-disable-next-line ts/require-await
function palmaresFetchConstructor<THandlersAndPaths>(host: string) {
  return async <
    TInput extends keyof THandlersAndPaths,
    TMethod extends Uppercase<keyof THandlersAndPaths[TInput] extends string ? keyof THandlersAndPaths[TInput] : string>
  >(
    input: TInput,
    init: {
      method: TMethod;
    } & (keyof ExtractUrlParamsFromPathType<TInput extends string ? TInput : never> extends never
      ? unknown
      : { params: ExtractUrlParamsFromPathType<TInput extends string ? TInput : never> }) &
      (ExtractQueryParamsFromPathType<TInput extends string ? TInput : never> extends never
        ? unknown
        : { query: ExtractQueryParamsFromPathType<TInput extends string ? TInput : never> }) &
      (TMethod extends 'GET'
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
      (keyof ExtractHeadersFromHandler<
        Lowercase<TMethod> extends keyof THandlersAndPaths[TInput]
          ? THandlersAndPaths[TInput][Lowercase<TMethod>]
          : never
      > extends never
        ? ExtractHeadersFromHandler<
            Lowercase<TMethod> extends keyof THandlersAndPaths[TInput]
              ? THandlersAndPaths[TInput][Lowercase<TMethod>]
              : never
          > extends never
          ? { headers?: unknown }
          : { headers?: unknown }
        : {
            headers: object &
              ExtractHeadersFromHandler<
                Lowercase<TMethod> extends keyof THandlersAndPaths[TInput]
                  ? THandlersAndPaths[TInput][Lowercase<TMethod>]
                  : unknown
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
    // eslint-disable-next-line ts/require-await
  > => {
    if ((init as any)?.params) {
      const paramsInUrl: {
        variable: string;
        start: number;
        end: number;
      }[] = [];
      const splittedUrl = (typeof input === 'string' ? input : '').split('');
      let start = 0;
      let isParam = false;
      let isIgnore = false;
      let variable = '';

      for (let i = 0; i < splittedUrl.length; i++) {
        const partOfUrl = splittedUrl[i];

        if (isParam && partOfUrl === ':') isParam = false;
        if (isParam) variable += partOfUrl;
        if (!isIgnore && partOfUrl === '<') {
          isParam = true;
          start = i;
        }
        if (!isIgnore && partOfUrl === '>') {
          isParam = false;
          paramsInUrl.push({
            variable,
            start,
            end: i
          });
          variable = '';
        }
        if (isIgnore) isIgnore = false;
        if (partOfUrl === '\\') isIgnore = true;
      }

      paramsInUrl.reverse();
      for (const { start, end, variable } of paramsInUrl) {
        (input as string) =
          (input as string).substring(0, start) + (init as any).params[variable] + (input as string).substring(end + 1);
      }
    }

    (input as string) = (input as string).split('?')[0];
    const url = new URL(input, host);

    if ((init as any)?.query) {
      Object.entries((init as any).query || {}).forEach(([key, value]) => {
        url.searchParams.append(key, value as string);
      });
    }

    const response = await fetch(url, {
      method: init.method,
      body: (init as any).body ? JSON.stringify((init as any).body) : undefined,
      headers: (init as any).headers
    });
    return response as any;
  };
}

export default function initializeClient<
  TDomainsOrSettings extends readonly (typeof Domain | ReturnType<typeof domain>)[] | SettingsType2<any[]>
>(host: string) {
  return palmaresFetchConstructor<ExtractRoutesFromDomains<TDomainsOrSettings>>(host);
}
