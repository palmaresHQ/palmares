import { AuthAdapterException } from './exceptions';

import type { AdapterMethods, AuthAdapter } from './adapter';

export interface AuthConfig {
  adapters: AuthAdapter[];
  adapterConfigs: Record<string, any>;
}

const defaultConfig: AuthConfig = {
  adapters: [],
  adapterConfigs: {}
};

declare global {
  // eslint-disable-next-line no-var
  var $PAuthAdapters: AuthAdapter[] | undefined;
  // eslint-disable-next-line no-var
  var $PAuthConfig: AuthConfig | undefined;

  namespace Palmares {
    interface PAuth {
      config: AuthConfig;
    }
  }
}

export function setAdapters(adapters: AuthAdapter[]) {
  globalThis.$PAuthAdapters = adapters;

  // Also update the adapters in the config
  const config = getConfig();
  config.adapters = adapters;
}

export function getAdapters() {
  if (!globalThis.$PAuthAdapters) throw new AuthAdapterException('AuthAdapter', 'No adapter has been set');

  return globalThis.$PAuthAdapters;
}

export function initConfig() {
  if (!globalThis.$PAuthConfig) {
    globalThis.$PAuthConfig = { ...defaultConfig };
  }
  return globalThis.$PAuthConfig;
}

export function getConfig(): AuthConfig {
  return initConfig();
}

export function getAdapterConfig<T = any>(adapterName: string): T {
  const config = getConfig();
  return config.adapterConfigs[adapterName] as T;
}

export function setAdapterConfig(adapterName: string, adapterConfig: any): void {
  const config = getConfig();
  config.adapterConfigs[adapterName] = {
    ...config.adapterConfigs[adapterName],
    ...adapterConfig
  };
}
