import { getAdapters } from './conf';

import type { AdapterMethods, AuthAdapter } from './adapter';

type AuthProxy<TAdapters> = {
  // [KAdapter in TAdapters[number] as KAdapter['name']]: KAdapter['methods'];
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

type GetAdapters = ReturnType<typeof getAdapters>;

const createAuthProxy = <TAdapters = Palmares.PAuth extends { adapters: any } ? true : false>(adapters: GetAdapters) =>
  new Proxy(
    {},
    {
      get(_, adapterName: string) {
        const adapter = adapters.find((a) => a.name === adapterName);

        if (adapter) {
          return createAdapterProxy(adapter.methods);
        }

        throw new Error(`Adapter "${adapterName}" not found`);
      }
    }
  ) as AuthProxy<TAdapters>;

export const Auth = createAuthProxy(getAdapters());
