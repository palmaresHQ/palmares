import type Domain from '../domain/domain';
import type domain from '../domain/function';
import type { DomainReadyFunctionArgs } from '../domain/types';
import type Std from '../std-adapter'
import type { Narrow } from '../utils';

export type ValidateDomains<
  TDomains extends
    | readonly (
        | typeof Domain
        | ReturnType<typeof domain>
        | Promise<{ default: typeof Domain | ReturnType<typeof domain> }>
        | readonly [
            typeof Domain | ReturnType<typeof domain> | Promise<{ default: typeof Domain | ReturnType<typeof domain> }>,
            any
          ]
      )[]
    | Narrow<
        readonly (
          | typeof Domain
          | ReturnType<typeof domain>
          | Promise<{ default: typeof Domain | ReturnType<typeof domain> }>
          | readonly [
              (
                | typeof Domain
                | ReturnType<typeof domain>
                | Promise<{
                    default: typeof Domain | ReturnType<typeof domain>;
                  }>
              ),
              any
            ]
        )[]
      >
> = TDomains extends
  | readonly [
      (
        | infer TFirstDomain
        | readonly [infer TFirstDomain, any]
        | Promise<infer TFirstDomain>
        | Promise<readonly [infer TFirstDomain, any]>
      ),
      ...infer TRestDomains
    ]
  ? TFirstDomain extends typeof Domain | ReturnType<typeof domain>
    ? InstanceType<TFirstDomain> extends
        | {
            load: (settings: infer TSettings) => any;
          }
        | {
            ready: (args: DomainReadyFunctionArgs<infer TSettings, any>) => any;
          }
      ? TSettings extends object
        ? readonly [
            readonly [TFirstDomain, TSettings],
            ...ValidateDomains<
              TRestDomains extends readonly (
                | (typeof Domain | ReturnType<typeof domain>)
                | readonly [typeof Domain | ReturnType<typeof domain>, any]
              )[]
                ? TRestDomains
                : []
            >
          ]
        : readonly [
            TFirstDomain,
            ...ValidateDomains<
              TRestDomains extends readonly (
                | (typeof Domain | ReturnType<typeof domain>)
                | readonly [typeof Domain | ReturnType<typeof domain>, any]
              )[]
                ? TRestDomains
                : []
            >
          ]
      : never
    : never
  : TDomains;

export type InstalledDomainsType = Promise<{ default: typeof Domain }>[] | typeof Domain[];

export type SettingsType2<
  TDomains extends readonly (
    | typeof Domain
    | ReturnType<typeof domain>
    | Promise<{ default: typeof Domain | ReturnType<typeof domain> }>
    | readonly [
        typeof Domain | ReturnType<typeof domain> | Promise<{ default: typeof Domain | ReturnType<typeof domain> }>,
        any
      ]
  )[] = readonly any[]
> = {
  installedDomains: ValidateDomains<Narrow<TDomains>>;
  std: typeof Std;
  settingsLocation: string;
  basePath: string;
};

export type CoreSettingsType = {
  isDynamicDomains?: boolean;
  useTs?: boolean;
  debug?: boolean;
  env?: string;
  appName?: string;
};

export type ExtendsSettings<TOtherSettings extends object> = TOtherSettings & Partial<SettingsType2>;

export type SettingsType = {
  ENV?: string;
  DEBUG: boolean;
  APP_NAME?: string;
  USE_TS?: boolean;
  BASE_PATH: string;
  INSTALLED_DOMAINS: InstalledDomainsType;
  SOCKETS?: {
    ROOT_URLCONF: string;
    ENGINE: string;
    LAYER?: {
      BACKEND: string;
    };
  };
};
