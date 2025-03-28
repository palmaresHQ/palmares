import { getAdapterConfig, getAdapters } from './conf';

import type { AuthAdapters } from '.';
import type { AdapterMethods, AuthAdapter } from './adapter';

type AuthProxy<TAdapters extends readonly (AuthAdapter | unknown)[]> = {
  [KAdapter in TAdapters[number] as KAdapter extends AuthAdapter
    ? KAdapter['name']
    : never]: KAdapter extends AuthAdapter ? KAdapter['methods'] : never;
} & {
  config: {
    getAdapterConfig: <T = any>(adapterName: string) => T;
  };
};

const createAdapterProxy = <TMethods extends AdapterMethods>(methods: TMethods): TMethods =>
  new Proxy({} as TMethods, {
    get(_, prop: string) {
      if (prop in methods) {
        return methods[prop];
      }
      throw new Error(`Method ${String(prop)} not found`);
    }
  });

export function getAuth<TAdapters extends AuthAdapters & Palmares.PAuth = AuthAdapters & Palmares.PAuth>(): AuthProxy<
  TAdapters['adapters']
> {
  const proxy = new Proxy(
    {
      config: {
        getAdapterConfig: <T = any>(adapterName: string) => getAdapterConfig<T>(adapterName)
      }
    },
    {
      get(target, prop: string) {
        if (prop === 'config') {
          return target.config;
        }

        const adapters = getAdapters();
        const adapter = adapters.find((a) => a.name === prop);

        if (adapter) {
          return createAdapterProxy(adapter.methods);
        }

        throw new Error(`Adapter "${prop}" not found`);
      }
    }
  ) as any;

  return proxy;
}
