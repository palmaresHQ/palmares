import { ServerAdapterNotInitialized } from './exceptions';

import type { ServerAdapter } from '../adapters';

const serverAdapterInstanceByServerClass = new Map<
  typeof ServerAdapter,
  Record<string, Awaited<ReturnType<ServerAdapter['load']>>>
>();
export const setServerAdapterInstance = (
  adapter: typeof ServerAdapter,
  serverName: string,
  server: Awaited<ReturnType<ServerAdapter['load']>>
) => {
  let existingOrNewServerAdapter = serverAdapterInstanceByServerClass.get(adapter);
  if (!existingOrNewServerAdapter) existingOrNewServerAdapter = {};
  existingOrNewServerAdapter[serverName] = server;
  serverAdapterInstanceByServerClass.set(adapter, existingOrNewServerAdapter);
};

export function getAdapterServer<TServerAdapter extends typeof ServerAdapter>(
  adapter: TServerAdapter,
  serverName?: string
): Awaited<ReturnType<InstanceType<TServerAdapter>['load']>> {
  const existingServerAdapters = serverAdapterInstanceByServerClass.get(adapter);
  if (!existingServerAdapters) throw new ServerAdapterNotInitialized(adapter.name);

  const serverNames = Object.keys(existingServerAdapters);
  if (serverNames.length <= 0 || (serverName && !serverNames.includes(serverName)))
    throw new ServerAdapterNotInitialized(adapter.name);

  const serverNameToReturn: string = serverName || serverNames[0];
  return existingServerAdapters[serverNameToReturn];
}
