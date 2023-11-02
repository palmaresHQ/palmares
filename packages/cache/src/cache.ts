import { getCachedAdapter, setCachedAdapter } from "./config";

class Cache {
  async get(key: string) {
    const cachedAdapter = await this.#getCachedAdapter()

    return cachedAdapter?.get(key);
  }

  async #getCachedAdapter() {
    let cachedAdapter = getCachedAdapter()

    if(cachedAdapter instanceof Promise) {
      const awaitedCachedAdapter = await cachedAdapter;
      setCachedAdapter(awaitedCachedAdapter);
      cachedAdapter = awaitedCachedAdapter;
    }

    return cachedAdapter
  }
}

export const cache = new Cache();
