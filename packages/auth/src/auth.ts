import { getAdapters } from './conf';

import type { AuthAdapters } from '.';
import type { AdapterMethods, AuthAdapter } from './adapter';

type AuthProxy<TAdapters extends readonly (AuthAdapter | unknown)[]> = {
  [KAdapter in TAdapters[number] as KAdapter extends AuthAdapter
    ? KAdapter['name']
    : never]: KAdapter extends AuthAdapter ? KAdapter['methods'] : never;
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
  return new Proxy(
    {},
    {
      get(_, adapterName: string) {
        const adapters = getAdapters();
        const adapter = adapters.find((a) => a.name === adapterName);

        if (adapter) {
          return createAdapterProxy(adapter.methods);
        }

        throw new Error(`Adapter "${adapterName}" not found`);
      }
    }
  ) as any;
}
