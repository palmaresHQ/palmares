import type { ServerAdapter } from '../adapters';

const serverAdapterInstanceByServerClass = new Map<typeof ServerAdapter, Awaited<ReturnType<ServerAdapter['load']>>>();

export const setServerAdapterInstance = (
  adapter: typeof ServerAdapter,
  server: Awaited<ReturnType<ServerAdapter['load']>>
) => {
  serverAdapterInstanceByServerClass.set(adapter, server);
};

export function getAdapterServer<TServerAdapter extends typeof ServerAdapter>(
  adapter: TServerAdapter
): Awaited<ReturnType<InstanceType<TServerAdapter>['load']>> {
  return serverAdapterInstanceByServerClass.get(adapter);
}
