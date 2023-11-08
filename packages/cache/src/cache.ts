import { getCachedAdapter, setCachedAdapter } from "./config";
import { NotSpecifiedCacheAdapterError } from "./exceptions";

class Cache {
  async get(key: string) {
    const cachedAdapter = await this.#getCachedAdapter();

    return cachedAdapter?.get(key);
  }

  async set(key: string, value: any) {
    const cachedAdapter = await this.#getCachedAdapter();

    return cachedAdapter?.set(key, value)
  }

  async remove(key: string) {
    const cachedAdapter = await this.#getCachedAdapter();

    return cachedAdapter?.remove(key);
  }

  async #getCachedAdapter() {
    let cachedAdapter = getCachedAdapter();

    if(cachedAdapter instanceof Promise) {
      const awaitedCachedAdapter = await cachedAdapter;
      setCachedAdapter(awaitedCachedAdapter);
      cachedAdapter = awaitedCachedAdapter;
    }

    if(!cachedAdapter) throw new NotSpecifiedCacheAdapterError();

    return cachedAdapter;
  }
}

export const cache = new Cache();
