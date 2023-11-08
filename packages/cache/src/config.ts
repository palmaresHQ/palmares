import CacheAdapter from "./adapter";

let cachedAdapter: CacheAdapter | undefined = undefined
let cacheAdapterInitializer: () => Promise<any> | undefined = async() => {}

export function setCachedAdapter(cacheAdapter: CacheAdapter) {
  cachedAdapter = cacheAdapter;
}

export function getCachedAdapter() {
  return cachedAdapter;
}

export function setCacheAdapterInitializer(callback: () => Promise<any>) {
  cacheAdapterInitializer = callback;
}

export function getCacheAdapterInitializer() {
  return cacheAdapterInitializer;
}
