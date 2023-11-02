import CacheAdapter from "./adapter";

let cachedAdapter: CacheAdapter | undefined = undefined

export function setCachedAdapter(cacheAdapter: CacheAdapter) {
  cachedAdapter = cacheAdapter;
}

export function getCachedAdapter() {
  return cachedAdapter;
}
